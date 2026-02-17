"""Tests for the Google Trends API endpoint and service."""

import os
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pandas as pd
import pytest
from fastapi.testclient import TestClient

from models import TrendsDocument


def test_trends_returns_topics_for_country(client: TestClient) -> None:
    """GET /trends?country=US returns country and list of topics from DB."""
    doc = TrendsDocument(
        country="US",
        topics=[
            {"title": "Topic A", "search_volume": "1M+", "started": "2h ago"},
            {"title": "Topic B"},
            {"title": "Topic C"},
        ],
        source="api",
        fetched_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    with patch("main.get_trends_from_db", return_value=doc):
        response = client.get("/trends?country=US")

    assert response.status_code == 200
    data = response.json()
    assert data["country"] == "US"
    assert data["topics"][0]["title"] == "Topic A"
    assert data["topics"][0]["search_volume"] == "1M+"
    assert data["topics"][0]["started"] == "2h ago"
    assert data["topics"][1]["title"] == "Topic B"
    assert data["source"] == "db"


def test_trends_defaults_to_us(client: TestClient) -> None:
    """GET /trends without country defaults to US."""
    doc = TrendsDocument(
        country="US",
        topics=[{"title": "Default Topic"}],
        source="api",
        fetched_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    with patch("main.get_trends_from_db", return_value=doc):
        response = client.get("/trends")

    assert response.status_code == 200
    assert response.json()["country"] == "US"


def test_trends_normalizes_country_code(client: TestClient) -> None:
    """GET /trends normalizes country code to uppercase."""
    doc = TrendsDocument(
        country="GB",
        topics=[{"title": "Topic"}],
        source="api",
        fetched_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    with patch("main.get_trends_from_db", return_value=doc) as mock_get:
        response = client.get("/trends?country=gb")

    assert response.status_code == 200
    assert response.json()["country"] == "GB"
    mock_get.assert_called_once_with("GB", filter_param="last_7_days")


def test_trends_filter_param_passed_to_db(client: TestClient) -> None:
    """GET /trends passes filter_param to get_trends_from_db."""
    doc = TrendsDocument(
        country="US",
        topics=[{"title": "Topic"}],
        source="db",
        fetched_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    with patch("main.get_trends_from_db", return_value=doc) as mock_get:
        client.get("/trends?country=US&filter_param=yesterday")

    mock_get.assert_called_once_with("US", filter_param="yesterday")


def test_trends_invalid_filter_returns_400(client: TestClient) -> None:
    """GET /trends with invalid filter returns 400."""
    response = client.get("/trends?country=US&filter_param=last_30_days")
    assert response.status_code == 400
    assert "yesterday" in response.json()["detail"]


def test_trends_invalid_country_returns_400(client: TestClient) -> None:
    """GET /trends with invalid country code returns 400."""
    response = client.get("/trends?country=XYZ")
    assert response.status_code == 400
    assert "Invalid" in response.json()["detail"]


def test_trends_empty_country_returns_400(client: TestClient) -> None:
    """GET /trends with empty country returns 400."""
    response = client.get("/trends?country=")
    assert response.status_code == 400


def test_trends_db_unreachable_returns_empty_fallback(client: TestClient) -> None:
    """GET /trends when DB unreachable returns empty list immediately, no timeout."""
    with patch("main.get_trends_from_db", side_effect=Exception("Connection refused")):
        response = client.get("/trends?country=US")

    assert response.status_code == 200
    data = response.json()
    assert data["topics"] == []
    assert data["source"] == "fallback"


def test_trends_from_db(client: TestClient) -> None:
    """GET /trends returns data from MongoDB when available."""
    doc = TrendsDocument(
        country="US",
        topics=[
            {"title": "DB Topic 1", "search_volume": "500K"},
            {"title": "DB Topic 2"},
        ],
        source="api",
        fetched_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    with patch("main.get_trends_from_db", return_value=doc):
        response = client.get("/trends?country=US")

    assert response.status_code == 200
    data = response.json()
    assert data["country"] == "US"
    assert data["topics"][0]["title"] == "DB Topic 1"
    assert data["topics"][0]["search_volume"] == "500K"
    assert data["source"] == "db"
    assert "fetched_at" in data


def test_trends_empty_result(client: TestClient) -> None:
    """GET /trends returns empty list when DB has no data for country."""
    with patch("main.get_trends_from_db", return_value=None):
        response = client.get("/trends?country=FR")

    assert response.status_code == 200
    data = response.json()
    assert data["country"] == "FR"
    assert data["topics"] == []
    assert data["source"] == "fallback"


# --- Service layer tests ---


def test_get_trending_topics_returns_list() -> None:
    """get_trending_topics returns list of trend dicts from API."""
    from services.trends import get_trending_topics

    mock_df = pd.DataFrame({0: ["Trend 1", "Trend 2"]})

    class MockClient:
        def trending_searches(self, pn: str) -> pd.DataFrame:
            return mock_df

        def realtime_trending_searches(
            self, pn: str, cat: str = "all", count: int = 300
        ) -> pd.DataFrame:
            return pd.DataFrame()

    with patch.dict(
        os.environ,
        {"TRENDS_USE_SCRAPER": "false", "SERPAPI_KEY": ""},
        clear=False,
    ):
        topics, source = get_trending_topics("US", client=MockClient())
    assert [t["title"] for t in topics] == ["Trend 1", "Trend 2"]
    assert source == "api"


def test_get_trending_topics_fallback_when_api_fails() -> None:
    """get_trending_topics returns mock data when both endpoints fail."""
    from services.trends import get_trending_topics

    class MockClient:
        def trending_searches(self, pn: str) -> pd.DataFrame:
            raise Exception("404")

        def realtime_trending_searches(
            self, pn: str, cat: str = "all", count: int = 300
        ) -> pd.DataFrame:
            raise Exception("404")

    with patch.dict(
        os.environ,
        {"TRENDS_USE_SCRAPER": "false", "SERPAPI_KEY": ""},
        clear=False,
    ):
        topics, source = get_trending_topics("GB", client=MockClient())
    assert len(topics) > 0
    assert source == "fallback"


def test_get_trending_topics_invalid_country_empty() -> None:
    """get_trending_topics raises ValueError for empty country."""
    from services.trends import get_trending_topics

    with patch.dict(os.environ, {"TRENDS_USE_SCRAPER": "false"}, clear=False):
        with pytest.raises(ValueError, match="Country code is required"):
            get_trending_topics("", client=object())  # type: ignore


def test_get_trending_topics_invalid_country_format() -> None:
    """get_trending_topics raises ValueError for invalid country format."""
    from services.trends import get_trending_topics

    with patch.dict(os.environ, {"TRENDS_USE_SCRAPER": "false"}, clear=False):
        with pytest.raises(ValueError, match="Invalid country code"):
            get_trending_topics("USA", client=object())  # type: ignore

        with pytest.raises(ValueError, match="Invalid country code"):
            get_trending_topics("1", client=object())  # type: ignore


def test_get_trending_topics_use_mock() -> None:
    """get_trending_topics returns mock data when TRENDS_USE_MOCK is set."""
    from services.trends import get_trending_topics

    with patch.dict(os.environ, {"TRENDS_USE_MOCK": "true"}, clear=False):
        topics, source = get_trending_topics("US", client=object())  # type: ignore

    assert len(topics) > 0
    assert all("title" in t for t in topics)
    assert source == "fallback"


def test_get_trending_topics_serpapi_when_scraper_fails() -> None:
    """get_trending_topics uses SerpApi when scraper fails and key is set."""
    from services.trends import get_trending_topics

    mock_resp = MagicMock()
    mock_resp.json.return_value = {
        "trending_searches": [
            {"query": "SerpApi Topic 1"},
            {"query": "SerpApi Topic 2"},
        ]
    }

    with patch.dict(os.environ, {"SERPAPI_KEY": "test-key"}, clear=False):
        with patch("services.trends_scraper.scrape_trending_topics") as mock_scrape:
            mock_scrape.return_value = []  # scraper returns empty
            with patch("services.trends.requests.get") as mock_get:
                mock_get.return_value = mock_resp

                topics, source = get_trending_topics("US")

    assert [t["title"] for t in topics] == ["SerpApi Topic 1", "SerpApi Topic 2"]
    assert source == "serpapi"


def test_extract_titles_from_title_column() -> None:
    """_extract_titles uses 'title' column when present."""
    from services.trends import _extract_titles

    df = pd.DataFrame({"title": ["A", "B", "A"]})
    assert _extract_titles(df) == ["A", "B"]


def test_extract_titles_from_entity_names() -> None:
    """_extract_titles uses entityNames (list or str) when present."""
    from services.trends import _extract_titles

    df = pd.DataFrame({"entityNames": [["X", "Y"], "Z"]})
    result = _extract_titles(df)
    assert "X, Y" in result
    assert "Z" in result


def test_extract_titles_fallback_last_column() -> None:
    """_extract_titles uses last column when neither title nor entityNames."""
    from services.trends import _extract_titles

    df = pd.DataFrame({"a": [1, 2], "b": ["P", "Q"]})
    assert _extract_titles(df) == ["P", "Q"]


def test_fetch_via_serpapi_success() -> None:
    """_fetch_via_serpapi returns topic titles from API response."""
    from services.trends import _fetch_via_serpapi

    mock_resp = MagicMock()
    mock_resp.json.return_value = {
        "trending_searches": [
            {"query": "Trend 1"},
            {"query": "Trend 2"},
            {"other": "ignored"},
        ]
    }

    with patch("services.trends.requests.get") as mock_get:
        mock_get.return_value = mock_resp

        result = _fetch_via_serpapi("US", "api-key")

    assert result == ["Trend 1", "Trend 2"]


def test_fetch_via_serpapi_error_returns_empty() -> None:
    """_fetch_via_serpapi returns empty list on error."""
    from services.trends import _fetch_via_serpapi

    with patch("services.trends.requests.get") as mock_get:
        mock_get.side_effect = Exception("Timeout")

        result = _fetch_via_serpapi("US", "api-key")

    assert result == []
