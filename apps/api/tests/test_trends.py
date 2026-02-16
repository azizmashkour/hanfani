"""Tests for the Google Trends API endpoint and service."""

from datetime import datetime, timezone
from unittest.mock import patch

import pandas as pd
import pytest
from fastapi.testclient import TestClient

from models import TrendsDocument


def test_trends_returns_topics_for_country(client: TestClient) -> None:
    """GET /trends?country=US returns country and list of topics (with optional metadata)."""
    with patch(
        "main.get_trending_topics",
        return_value=(
            [
                {"title": "Topic A", "search_volume": "1M+", "started": "2h ago"},
                {"title": "Topic B"},
                {"title": "Topic C"},
            ],
            "scraper",
        ),
    ):
        response = client.get("/trends?country=US")

    assert response.status_code == 200
    data = response.json()
    assert data["country"] == "US"
    assert data["topics"][0]["title"] == "Topic A"
    assert data["topics"][0]["search_volume"] == "1M+"
    assert data["topics"][0]["started"] == "2h ago"
    assert data["topics"][1]["title"] == "Topic B"
    assert data["source"] == "scraper"


def test_trends_defaults_to_us(client: TestClient) -> None:
    """GET /trends without country defaults to US."""
    with patch(
        "main.get_trending_topics",
        return_value=([{"title": "Default Topic"}], "scraper"),
    ):
        response = client.get("/trends")

    assert response.status_code == 200
    assert response.json()["country"] == "US"


def test_trends_normalizes_country_code(client: TestClient) -> None:
    """GET /trends normalizes country code to uppercase."""
    with patch(
        "main.get_trending_topics",
        return_value=([{"title": "Topic"}], "scraper"),
    ) as mock_get:
        response = client.get("/trends?country=gb")

    assert response.status_code == 200
    assert response.json()["country"] == "GB"
    mock_get.assert_called_once_with("gb")


def test_trends_invalid_country_returns_400(client: TestClient) -> None:
    """GET /trends with invalid country code returns 400."""
    with patch(
        "main.get_trending_topics",
        side_effect=ValueError("Invalid country code: XYZ. Use ISO 3166-1 alpha-2 (e.g. US, GB)."),
    ):
        response = client.get("/trends?country=XYZ")

    assert response.status_code == 400
    assert "Invalid" in response.json()["detail"]


def test_trends_empty_country_returns_400(client: TestClient) -> None:
    """GET /trends with empty country returns 400."""
    with patch(
        "main.get_trending_topics",
        side_effect=ValueError("Country code is required"),
    ):
        response = client.get("/trends?country=")

    assert response.status_code == 400


def test_trends_api_failure_returns_fallback(client: TestClient) -> None:
    """GET /trends when Google Trends API fails returns fallback data, not 502."""
    with patch(
        "main.get_trending_topics",
        return_value=([{"title": "Fallback 1"}, {"title": "Fallback 2"}], "fallback"),
    ):
        response = client.get("/trends?country=US")

    assert response.status_code == 200
    data = response.json()
    assert [t["title"] for t in data["topics"]] == ["Fallback 1", "Fallback 2"]
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
    """GET /trends returns empty list when no trends available."""
    with patch(
        "main.get_trending_topics",
        return_value=([], "scraper"),
    ):
        response = client.get("/trends?country=FR")

    assert response.status_code == 200
    data = response.json()
    assert data["country"] == "FR"
    assert data["topics"] == []
    assert data["source"] == "scraper"


# --- Service layer tests ---


def test_get_trending_topics_returns_list() -> None:
    """get_trending_topics returns list of trend dicts from API."""
    from services.trends import get_trending_topics

    mock_df = pd.DataFrame({0: ["Trend 1", "Trend 2"]})

    class MockClient:
        def trending_searches(self, pn: str) -> pd.DataFrame:
            return mock_df

        def realtime_trending_searches(self, pn: str, cat: str = "all", count: int = 300) -> pd.DataFrame:
            return pd.DataFrame()

    topics, source = get_trending_topics("US", client=MockClient())
    assert [t["title"] for t in topics] == ["Trend 1", "Trend 2"]
    assert source == "api"


def test_get_trending_topics_fallback_when_api_fails() -> None:
    """get_trending_topics returns mock data when both endpoints fail."""
    from services.trends import get_trending_topics

    class MockClient:
        def trending_searches(self, pn: str) -> pd.DataFrame:
            raise Exception("404")

        def realtime_trending_searches(self, pn: str, cat: str = "all", count: int = 300) -> pd.DataFrame:
            raise Exception("404")

    topics, source = get_trending_topics("GB", client=MockClient())
    assert len(topics) > 0
    assert source == "fallback"


def test_get_trending_topics_invalid_country_empty() -> None:
    """get_trending_topics raises ValueError for empty country."""
    from services.trends import get_trending_topics

    with pytest.raises(ValueError, match="Country code is required"):
        get_trending_topics("", client=object())  # type: ignore


def test_get_trending_topics_invalid_country_format() -> None:
    """get_trending_topics raises ValueError for invalid country format."""
    from services.trends import get_trending_topics

    with pytest.raises(ValueError, match="Invalid country code"):
        get_trending_topics("USA", client=object())  # type: ignore

    with pytest.raises(ValueError, match="Invalid country code"):
        get_trending_topics("1", client=object())  # type: ignore
