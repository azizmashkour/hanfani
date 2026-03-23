"""Tests for the topic mentions API endpoint and service."""

import os
from unittest.mock import patch

from fastapi.testclient import TestClient

# --- API endpoint tests ---


def test_mentions_returns_articles(client: TestClient) -> None:
    """GET /trends/mentions returns topic, country, and mentions list."""
    with patch("main.fetch_topic_mentions") as mock_fetch:
        mock_fetch.return_value = [
            {
                "title": "Article about AI",
                "source": "TechCrunch",
                "link": "https://example.com/1",
                "date": "2 hours ago",
            },
        ]
        response = client.get("/trends/mentions?topic=AI&country=US")

    assert response.status_code == 200
    data = response.json()
    assert data["topic"] == "AI"
    assert data["country"] == "US"
    assert len(data["mentions"]) == 1
    assert data["mentions"][0]["title"] == "Article about AI"
    assert data["mentions"][0]["source"] == "TechCrunch"
    mock_fetch.assert_called_once_with("AI", "US", limit=25)


def test_mentions_missing_topic_returns_400(client: TestClient) -> None:
    """GET /trends/mentions without topic returns 400."""
    response = client.get("/trends/mentions?country=US")
    assert response.status_code == 422  # FastAPI returns 422 for missing required param


def test_mentions_invalid_country_returns_400(client: TestClient) -> None:
    """GET /trends/mentions with invalid country returns 400."""
    response = client.get("/trends/mentions?topic=AI&country=XYZ")
    assert response.status_code == 400
    assert "Invalid" in response.json()["detail"]


# --- Service unit tests ---


def test_parse_news_entry_minimal() -> None:
    """_parse_news_entry returns item with title and link."""
    from services.topic_mentions import _parse_news_entry

    entry = {"title": "Test Article", "link": "https://example.com/1"}
    result = _parse_news_entry(entry, 1)
    assert result is not None
    assert result["title"] == "Test Article"
    assert result["source"] == "Unknown"
    assert result["link"] == "https://example.com/1"
    assert result["source_type"] == "news"
    assert result["position"] == 1


def test_parse_news_entry_full() -> None:
    """_parse_news_entry includes optional fields when present."""
    from services.topic_mentions import _parse_news_entry

    entry = {
        "title": "Full Article",
        "link": "https://example.com/2",
        "source": {"name": "TechCrunch", "authors": ["Alice", "Bob"]},
        "snippet": "A brief summary.",
        "date": "2 hours ago",
        "iso_date": "2024-01-15T10:00:00Z",
        "thumbnail": "https://example.com/img.jpg",
    }
    result = _parse_news_entry(entry, 5)
    assert result is not None
    assert result["title"] == "Full Article"
    assert result["source"] == "TechCrunch"
    assert result["snippet"] == "A brief summary."
    assert result["date"] == "2 hours ago"
    assert result["iso_date"] == "2024-01-15T10:00:00Z"
    assert result["authors"] == ["Alice", "Bob"]
    assert result["thumbnail"] == "https://example.com/img.jpg"


def test_parse_news_entry_no_title_uses_snippet() -> None:
    """_parse_news_entry uses snippet as title when title missing."""
    from services.topic_mentions import _parse_news_entry

    entry = {"snippet": "Fallback title here", "link": "https://example.com/3"}
    result = _parse_news_entry(entry, 1)
    assert result is not None
    assert result["title"] == "Fallback title here"


def test_parse_news_entry_no_link_returns_none() -> None:
    """_parse_news_entry returns None when link is empty."""
    from services.topic_mentions import _parse_news_entry

    entry = {"title": "No Link", "link": ""}
    assert _parse_news_entry(entry, 1) is None


def test_parse_news_entry_no_title_or_snippet_returns_none() -> None:
    """_parse_news_entry returns None when neither title nor snippet."""
    from services.topic_mentions import _parse_news_entry

    entry = {"link": "https://example.com"}
    assert _parse_news_entry(entry, 1) is None


def test_country_to_hl() -> None:
    """_country_to_hl maps country codes to language codes."""
    from services.topic_mentions import _country_to_hl

    assert _country_to_hl("FR") == "fr"
    assert _country_to_hl("DE") == "de"
    assert _country_to_hl("JP") == "ja"
    assert _country_to_hl("US") == "en"
    assert _country_to_hl("GB") == "en"
    assert _country_to_hl("XX") == "en"  # default


def test_fetch_topic_mentions_no_api_key() -> None:
    """fetch_topic_mentions returns empty list when SERPAPI_KEY not set."""
    from services.topic_mentions import fetch_topic_mentions

    with patch.dict(os.environ, {"SERPAPI_KEY": ""}, clear=False):
        result = fetch_topic_mentions("AI", "US")
    assert result == []


def test_fetch_topic_mentions_success() -> None:
    """fetch_topic_mentions returns parsed items on successful API response."""
    from unittest.mock import MagicMock

    from services.topic_mentions import fetch_topic_mentions

    mock_response = {
        "news_results": [
            {
                "title": "AI News",
                "link": "https://example.com/ai",
                "source": {"name": "TechNews"},
                "position": 1,
            },
        ]
    }

    mock_resp = MagicMock()
    mock_resp.json.return_value = mock_response

    with patch.dict(os.environ, {"SERPAPI_KEY": "test-key"}, clear=False):
        with patch("services.topic_mentions.requests.get") as mock_get:
            mock_get.return_value = mock_resp

            result = fetch_topic_mentions("AI", "US", limit=5)

    assert len(result) == 1
    assert result[0]["title"] == "AI News"
    assert result[0]["source"] == "TechNews"


def test_fetch_topic_mentions_api_error_returns_empty() -> None:
    """fetch_topic_mentions returns empty list on API error."""
    from services.topic_mentions import fetch_topic_mentions

    with patch.dict(os.environ, {"SERPAPI_KEY": "test-key"}, clear=False):
        with patch("services.topic_mentions.requests.get") as mock_get:
            mock_get.side_effect = Exception("Network error")

            result = fetch_topic_mentions("AI", "US")

    assert result == []
