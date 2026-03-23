"""Trends storage and retrieval from MongoDB."""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

from db import get_trends_collection
from models import TrendsDocument

TOPICS_LIMIT = 25
FILTER_YESTERDAY = "yesterday"
FILTER_LAST_7_DAYS = "last_7_days"


def save_trends(
    country: str,
    topics: list[dict] | list[str],
    source: str = "api",
    day: date | None = None,
) -> None:
    """
    Cumulate trends for a country and date in MongoDB.

    Merges new topics with existing for that (country, date). Does not overwrite.
    Keeps up to TOPICS_LIMIT (25) most relevant: new fetch first, then existing.
    topics: list of dicts {title, search_volume?, started?} or list of strings.
    """
    now = datetime.now(timezone.utc)
    day = day or now.date()
    day_str = day.isoformat()

    # Normalize: convert list[str] to list[dict]
    new_topics = [
        t if isinstance(t, dict) else {"title": str(t)}
        for t in topics
    ]

    def _title(t: dict) -> str:
        return (t.get("title") or "").strip() or str(t)

    # Fetch existing for this (country, date)
    coll = get_trends_collection()
    existing = coll.find_one({"country": country.upper(), "date": day_str})
    existing_list = existing.get("topics", []) if existing else []

    # Merge: new first (relevance order), then existing not in new. Dedupe by title.
    seen: set[str] = set()
    merged: list[dict] = []
    for t in new_topics:
        title = _title(t)
        if title and title.lower() not in seen:
            seen.add(title.lower())
            merged.append(t)
            if len(merged) >= TOPICS_LIMIT:
                break
    for t in existing_list:
        if len(merged) >= TOPICS_LIMIT:
            break
        title = _title(t)
        if title and title.lower() not in seen:
            seen.add(title.lower())
            merged.append(t)

    doc = {
        "country": country.upper(),
        "date": day_str,
        "topics": merged,
        "source": source,
        "fetched_at": now,
        "updated_at": now,
    }
    coll.update_one(
        {"country": country.upper(), "date": day_str},
        {"$set": doc},
        upsert=True,
    )


def get_trends_from_db(
    country: str,
    filter_param: str = FILTER_LAST_7_DAYS,
) -> TrendsDocument | None:
    """
    Get trends for a country from MongoDB.

    filter_param: "yesterday" (single day) or "last_7_days" (aggregate).
    Returns None if no documents exist for the country in the range.
    """
    today = date.today()
    if filter_param == FILTER_YESTERDAY:
        start = today - timedelta(days=1)
        end = start
    else:
        start = today - timedelta(days=7)
        end = today

    coll = get_trends_collection()
    cursor = coll.find(
        {
            "country": country.upper(),
            "date": {"$gte": start.isoformat(), "$lte": end.isoformat()},
        }
    ).sort([("date", -1)])

    docs = list(cursor)
    if not docs:
        # Fallback: legacy docs (country only, no date)
        legacy = coll.find_one({"country": country.upper()})
        if legacy and "date" not in legacy:
            docs = [legacy]
        if not docs:
            return None

    # Count days each topic appeared (for "most relevant" badge: 3+ days)
    def _title(t: dict) -> str:
        return (t.get("title") or "").strip() or str(t)

    days_per_topic: dict[str, int] = {}
    for doc in docs:
        day_str = doc.get("date")
        if not day_str:
            continue
        for t in doc.get("topics", []):
            raw = t if isinstance(t, dict) else {"title": str(t)}
            title = _title(raw)
            if title:
                key = title.lower()
                days_per_topic[key] = days_per_topic.get(key, 0) + 1

    # Aggregate: merge all days, dedupe by title, keep order (newest day first)
    seen: set[str] = set()
    topics: list[dict] = []
    for doc in docs:
        for t in doc.get("topics", []):
            raw = t if isinstance(t, dict) else {"title": str(t)}
            title = _title(raw)
            if title and title.lower() not in seen:
                seen.add(title.lower())
                key = title.lower()
                if days_per_topic.get(key, 0) >= 3:
                    raw = dict(raw)
                    raw["days_ongoing"] = days_per_topic[key]
                topics.append(raw)
                if len(topics) >= TOPICS_LIMIT:
                    break
        if len(topics) >= TOPICS_LIMIT:
            break

    # Use most recent doc for metadata
    latest = docs[0]
    fetched = latest.get("fetched_at") or latest.get("updated_at")
    updated = latest.get("updated_at") or latest.get("fetched_at")
    return TrendsDocument(
        country=latest["country"],
        topics=topics,
        source=latest.get("source", "fallback"),
        fetched_at=fetched,
        updated_at=updated,
    )
