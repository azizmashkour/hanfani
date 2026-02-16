"""Tests for trends storage."""

from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

from models import TrendsDocument


def test_save_trends_upserts() -> None:
    """save_trends calls update_one with upsert."""
    from services.trends_store import save_trends

    with patch("services.trends_store.get_trends_collection") as mock_get:
        mock_coll = MagicMock()
        mock_get.return_value = mock_coll

        save_trends("US", [{"title": "Topic 1"}, {"title": "Topic 2"}], source="api")

        mock_coll.update_one.assert_called_once()
        call_args = mock_coll.update_one.call_args
        assert call_args[0][0] == {"country": "US"}
        assert "$set" in call_args[0][1]
        assert call_args[0][1]["$set"]["topics"] == [{"title": "Topic 1"}, {"title": "Topic 2"}]
        assert call_args[0][1]["$set"]["source"] == "api"
        assert call_args[1]["upsert"] is True


def test_get_trends_from_db_returns_none_when_empty() -> None:
    """get_trends_from_db returns None when no document exists."""
    from services.trends_store import get_trends_from_db

    with patch("services.trends_store.get_trends_collection") as mock_get:
        mock_coll = MagicMock()
        mock_coll.find_one.return_value = None
        mock_get.return_value = mock_coll

        result = get_trends_from_db("US")

        assert result is None


def test_get_trends_from_db_returns_document() -> None:
    """get_trends_from_db returns TrendsDocument when data exists."""
    from services.trends_store import get_trends_from_db

    now = datetime.now(timezone.utc)
    doc = {
        "country": "US",
        "topics": [{"title": "A"}, {"title": "B"}],
        "source": "api",
        "fetched_at": now,
        "updated_at": now,
    }
    with patch("services.trends_store.get_trends_collection") as mock_get:
        mock_coll = MagicMock()
        mock_coll.find_one.return_value = doc
        mock_get.return_value = mock_coll

        result = get_trends_from_db("US")

        assert result is not None
        assert isinstance(result, TrendsDocument)
        assert result.country == "US"
        assert [t["title"] for t in result.topics] == ["A", "B"]
        assert result.source == "api"
