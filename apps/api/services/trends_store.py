"""Trends storage and retrieval from MongoDB."""

from __future__ import annotations

from datetime import datetime, timezone

from db import get_trends_collection
from models import TrendsDocument


def save_trends(country: str, topics: list[dict] | list[str], source: str = "api") -> None:
    """
    Save or update trends for a country in MongoDB.

    Uses upsert: replaces existing document for the country.
    topics: list of dicts {title, search_volume?, started?} or list of strings (legacy).
    """
    now = datetime.now(timezone.utc)
    # Normalize: convert list[str] to list[dict]
    normalized = [
        t if isinstance(t, dict) else {"title": str(t)}
        for t in topics
    ]
    doc = {
        "country": country.upper(),
        "topics": normalized,
        "source": source,
        "fetched_at": now,
        "updated_at": now,
    }
    coll = get_trends_collection()
    coll.update_one(
        {"country": country.upper()},
        {"$set": doc},
        upsert=True,
    )


def get_trends_from_db(country: str) -> TrendsDocument | None:
    """
    Get the latest trends for a country from MongoDB.

    Returns None if no document exists for the country.
    """
    coll = get_trends_collection()
    doc = coll.find_one({"country": country.upper()})
    if doc is None:
        return None
    raw_topics = doc.get("topics", [])
    # Normalize: legacy list[str] -> list[dict]
    topics = [
        t if isinstance(t, dict) else {"title": str(t)}
        for t in raw_topics
    ]
    fetched = doc.get("fetched_at") or doc.get("updated_at")
    updated = doc.get("updated_at") or doc.get("fetched_at")
    return TrendsDocument(
        country=doc["country"],
        topics=topics,
        source=doc.get("source", "fallback"),
        fetched_at=fetched,
        updated_at=updated,
    )
