#!/usr/bin/env python3
"""
Worker to fetch Google Trends (via scraper) and save to MongoDB.

Scrapes https://trends.google.com/trending?geo=XX for each country.
Run manually or schedule with cron (e.g. every 24 hours):

  0 0 * * * /path/to/apps/api/run-worker.sh

Set MONGODB_URI and MONGODB_DB for your environment.
"""

from __future__ import annotations

import os
import sys

# Ensure apps/api is on path when run as module
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.trends import get_trending_topics
from services.trends_store import save_trends

# Countries to scrape (configurable via env: TRENDS_COUNTRIES=US,GB,FR,...)
DEFAULT_COUNTRIES = ["US", "GB", "FR", "DE", "IN", "JP", "BR", "CA", "AU", "ES", "CR"]


def run() -> None:
    """Scrape trends for all configured countries and save to MongoDB."""
    countries_str = os.getenv("TRENDS_COUNTRIES", "")
    countries = [c.strip().upper() for c in countries_str.split(",") if c.strip()] if countries_str else DEFAULT_COUNTRIES

    for country in countries:
        try:
            print(f"Fetching trends from Google Trends for {country}...")
            topics, source = get_trending_topics(country)
            save_trends(country, topics, source=source)
            print(f"Saved {len(topics)} topics for {country} (source={source})")
            for i, t in enumerate(topics[:5], 1):
                title = t.get("title", t) if isinstance(t, dict) else t
                vol = t.get("search_volume", "") if isinstance(t, dict) else ""
                started = t.get("started", "") if isinstance(t, dict) else ""
                extra = []
                if vol:
                    extra.append(f"volume={vol}")
                if started:
                    extra.append(f"started={started}")
                suffix = f"  [{', '.join(extra)}]" if extra else ""
                print(f"  {i}. {title}{suffix}")
            if len(topics) > 5:
                print(f"  ... and {len(topics) - 5} more")
        except Exception as e:
            print(f"Error fetching {country}: {e}", file=sys.stderr)


if __name__ == "__main__":
    run()
