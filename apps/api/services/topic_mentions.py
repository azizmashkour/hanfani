"""Fetch news articles and social mentions for a trending topic."""

from __future__ import annotations

import os
from typing import Any, TypedDict

import requests


class MentionItem(TypedDict, total=False):
    """A single mention (article, post, etc.) of a topic."""

    title: str
    source: str
    source_type: str  # "news" | "social"
    link: str
    snippet: str
    date: str
    iso_date: str
    authors: list[str]
    thumbnail: str
    position: int
    platform: str  # e.g. "Twitter", "Reddit" when source_type=social


def fetch_topic_mentions(topic: str, country: str, limit: int = 20) -> list[MentionItem]:
    """
    Fetch news articles and mentions for a topic in a country.

    Uses SerpApi Google News when SERPAPI_KEY is set. Results are sorted by
    relevance (position) then by date. Returns empty list on failure.

    Args:
        topic: The trending topic to search for.
        country: ISO 3166-1 alpha-2 country code (e.g. US, FR).
        limit: Max number of items to return (default 20).

    Returns:
        List of mention items with title, source, link, date, etc.
    """
    api_key = os.getenv("SERPAPI_KEY", "").strip()
    if not api_key:
        return []

    try:
        resp = requests.get(
            "https://serpapi.com/search",
            params={
                "engine": "google_news",
                "q": topic,
                "gl": country.lower(),
                "hl": _country_to_hl(country),
                "api_key": api_key,
                "so": 0,  # relevance
            },
            timeout=15,
        )
        resp.raise_for_status()
        data: dict[str, Any] = resp.json()
    except Exception:
        return []

    items: list[MentionItem] = []
    news_results = data.get("news_results") or []

    for nr in news_results:
        if len(items) >= limit:
            break

        # Handle nested structure (e.g. highlight, stories)
        entry = nr
        if "highlight" in nr:
            entry = nr["highlight"]
        elif "stories" in nr:
            for story in nr.get("stories", [])[:5]:
                item = _parse_news_entry(story, len(items) + 1)
                if item and item not in items:
                    items.append(item)
            continue

        item = _parse_news_entry(entry, len(items) + 1)
        if item:
            items.append(item)

    # Sort by position (relevance) then by date (newest first)
    def _sort_key(x: MentionItem) -> tuple:
        pos = x.get("position", 999)
        iso = x.get("iso_date") or ""
        return (pos, "" if iso else "z")  # empty date last

    items.sort(key=_sort_key)
    return items[:limit]


def _parse_news_entry(entry: dict[str, Any], default_pos: int) -> MentionItem | None:
    """Parse a news_result entry into MentionItem."""
    title = None
    if "title" in entry:
        title = str(entry["title"]).strip()
    if not title and "snippet" in entry:
        title = str(entry["snippet"])[:100].strip()
    if not title:
        return None

    source_name = ""
    authors: list[str] = []
    if "source" in entry and isinstance(entry["source"], dict):
        src = entry["source"]
        source_name = str(src.get("name", "")).strip()
        authors = src.get("authors") or []
        if isinstance(authors, str):
            authors = [authors] if authors else []

    link = str(entry.get("link", "")).strip()
    if not link:
        return None

    item: MentionItem = {
        "title": title,
        "source": source_name or "Unknown",
        "source_type": "news",
        "link": link,
        "position": entry.get("position", default_pos),
    }
    if entry.get("snippet"):
        item["snippet"] = str(entry["snippet"]).strip()
    if entry.get("date"):
        item["date"] = str(entry["date"])
    if entry.get("iso_date"):
        item["iso_date"] = str(entry["iso_date"])
    if authors:
        item["authors"] = authors
    if entry.get("thumbnail"):
        item["thumbnail"] = str(entry["thumbnail"])

    return item


def _country_to_hl(country: str) -> str:
    """Map country code to language code for SerpApi."""
    m: dict[str, str] = {
        "FR": "fr",
        "DE": "de",
        "ES": "es",
        "IT": "it",
        "BR": "pt",
        "JP": "ja",
        "IN": "en",
        "GB": "en",
        "US": "en",
    }
    return m.get(country.upper(), "en")
