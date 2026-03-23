"""Google Trends service for fetching top trending topics by country."""

from __future__ import annotations

import os
from typing import Any, Protocol

import pandas as pd
import requests

# Sample data when Google Trends API is unavailable (e.g. 404 from deprecated endpoints)
_MOCK_TOPICS: list[str] = [
    "AI developments",
    "Climate summit",
    "Tech earnings",
    "Sports championship",
    "Election updates",
    "Space mission",
    "Health breakthrough",
    "Entertainment news",
    "Economic indicators",
    "Local events",
]

# trending_searches uses country names with underscores (pn param)
_COUNTRY_TO_PN: dict[str, str] = {
    "US": "united_states",
    "GB": "united_kingdom",
    "FR": "france",
    "DE": "germany",
    "IN": "india",
    "JP": "japan",
    "BR": "brazil",
    "CA": "canada",
    "AU": "australia",
    "ES": "spain",
    "IT": "italy",
    "MX": "mexico",
    "RU": "russia",
    "KR": "south_korea",
    "NL": "netherlands",
    "PL": "poland",
    "TR": "turkey",
    "ID": "indonesia",
    "SA": "saudi_arabia",
    "CR": "costa_rica",
}


class TrendsClient(Protocol):
    """Protocol for a Google Trends client (pytrends-compatible)."""

    def trending_searches(self, pn: str) -> pd.DataFrame:
        """Fetch trending searches for a country (hottrends endpoint)."""
        ...

    def realtime_trending_searches(
        self, pn: str, cat: str = "all", count: int = 300
    ) -> pd.DataFrame:
        """Fetch realtime trending searches for a country."""
        ...


def get_trending_topics(
    country: str, client: object | None = None
) -> tuple[list[dict[str, Any]], str]:
    """
    Get the top trending topics for a specific country.

    Tries trending_searches (hottrends) first, then realtime_trending_searches.
    Falls back to sample data when Google's API is unavailable.

    Args:
        country: ISO 3166-1 alpha-2 country code (e.g. US, GB, FR).
        client: Optional trends client. If None, uses pytrends TrendReq.

    Returns:
        Tuple of (topics list of dicts with title/search_volume/started, source).

    Raises:
        ValueError: If country code is invalid or empty.
    """
    if not country or not country.strip():
        raise ValueError("Country code is required")

    code = country.strip().upper()
    if len(code) != 2 or not code.isalpha():
        raise ValueError(f"Invalid country code: {country}. Use ISO 3166-1 alpha-2 (e.g. US, GB).")

    def _to_items(titles: list[str]) -> list[dict[str, Any]]:
        return [{"title": t} for t in titles]

    if os.getenv("TRENDS_USE_MOCK", "").lower() in ("1", "true", "yes"):
        return (_to_items(_MOCK_TOPICS.copy()), "fallback")

    # Scrape: no API key, uses Playwright to scrape trends.google.com/trending (primary)
    if os.getenv("TRENDS_USE_SCRAPER", "true").lower() in ("1", "true", "yes"):
        try:
            from services.trends_scraper import scrape_trending_topics

            topics = scrape_trending_topics(code)
            if topics:
                return (topics, "scraper")
        except Exception:
            pass

    # SerpApi: optional, requires SERPAPI_KEY (100 free searches/month)
    api_key = os.getenv("SERPAPI_KEY", "").strip()
    if api_key:
        titles = _fetch_via_serpapi(code, api_key)
        if titles:
            return (_to_items(titles), "serpapi")

    if client is None:
        from pytrends.request import TrendReq

        client = TrendReq(hl="en-US", tz=360)

    pn = _COUNTRY_TO_PN.get(code, "united_states")

    # Try trending_searches first (hottrends/visualize - different endpoint)
    try:
        df = client.trending_searches(pn=pn)
        if not df.empty:
            titles = _extract_titles(df)
            if titles:
                return (_to_items(titles), "api")
    except Exception:
        pass

    # Fallback: realtime_trending_searches
    try:
        df = client.realtime_trending_searches(pn=code)
        if not df.empty:
            titles = _extract_titles(df)
            if titles:
                return (_to_items(titles), "api")
    except Exception:
        pass

    # Google API unavailable - return sample data so the app works
    return (_to_items(_MOCK_TOPICS.copy()), "fallback")


def _fetch_via_serpapi(country: str, api_key: str) -> list[str]:
    """Fetch trending searches via SerpApi (https://serpapi.com/google-trends-trending-now)."""
    try:
        resp = requests.get(
            "https://serpapi.com/search",
            params={
                "engine": "google_trends_trending_now",
                "geo": country,
                "api_key": api_key,
            },
            timeout=15,
        )
        resp.raise_for_status()
        data: dict[str, Any] = resp.json()
        items = data.get("trending_searches", [])
        if not isinstance(items, list):
            return []
        topics = []
        for item in items:
            if isinstance(item, dict) and "query" in item:
                q = str(item["query"]).strip()
                if q:
                    topics.append(q)
        return topics
    except Exception:
        return []


def _extract_titles(df: pd.DataFrame) -> list[str]:
    """Extract topic titles from a trends DataFrame."""
    if "title" in df.columns:
        titles = df["title"].astype(str).str.strip()
    elif "entityNames" in df.columns:
        col = df["entityNames"]
        # entityNames can be list or str
        titles = col.apply(
            lambda x: ", ".join(x) if isinstance(x, list) else str(x)
        ).str.strip()
    else:
        titles = df.iloc[:, -1].astype(str).str.strip()
    return titles.dropna().replace("", pd.NA).dropna().unique().tolist()
