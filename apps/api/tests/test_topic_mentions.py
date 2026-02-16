"""Tests for the topic mentions API endpoint."""

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient


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
