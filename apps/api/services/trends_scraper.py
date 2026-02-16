"""Scrape Google Trends trending page (no API key required)."""

from __future__ import annotations

import csv
import tempfile
from pathlib import Path
from typing import TypedDict

LIMIT = 25

# Use locale-specific domain when available (e.g. trends.google.fr for FR)
_COUNTRY_DOMAIN = {"FR": "trends.google.fr", "DE": "trends.google.de", "GB": "trends.google.co.uk"}


class TrendItem(TypedDict, total=False):
    """A single trend with optional metadata."""

    title: str
    search_volume: str
    started: str


def scrape_trending_topics(country: str) -> list[TrendItem]:
    """
    Scrape the first 25 trending topics from Google Trends for a country.

    Uses Playwright to load the page and either:
    - Clicks the CSV download button and parses the file, or
    - Extracts trend titles from the DOM.

    Args:
        country: ISO 3166-1 alpha-2 country code (e.g. US, FR).

    Returns:
        List of up to 25 trend items with title, search_volume, started.
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return []

    domain = _COUNTRY_DOMAIN.get(country, "trends.google.com")
    url = f"https://{domain}/trending?geo={country}"
    topics: list[TrendItem] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            accept_downloads=True,
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        )
        page = context.new_page()

        try:
            page.goto(url, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(4000)  # Allow dynamic content to render

            # Try CSV download first (Export -> Download CSV / Télécharger au format CSV)
            export_btn = page.locator('button:has-text("Export"), button:has-text("Exporter")').first
            if export_btn.is_visible(timeout=2000):
                try:
                    with tempfile.TemporaryDirectory() as tmpdir:
                        download_path = Path(tmpdir) / "trends.csv"
                        with page.expect_download(timeout=15000) as download_info:
                            export_btn.click()
                            page.wait_for_timeout(1200)
                            csv_btn = page.get_by_role("menuitem").filter(has_text="CSV").first
                            if not csv_btn.is_visible(timeout=2000):
                                csv_btn = page.locator('a:has-text("CSV"), [role="menuitem"]:has-text("CSV")').first
                            if csv_btn.is_visible(timeout=2000):
                                csv_btn.click()
                        download = download_info.value
                        download.save_as(download_path)
                        topics = _parse_trends_csv(download_path)
                except Exception:
                    pass

            # Fallback: extract from DOM
            if not topics:
                # Scroll to load lazy-rendered rows (table often virtualizes)
                try:
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    page.wait_for_timeout(1500)
                    page.evaluate("window.scrollTo(0, 0)")
                    page.wait_for_timeout(500)
                except Exception:
                    pass
                topics = _extract_from_dom(page)

            browser.close()
        except Exception:
            try:
                browser.close()
            except Exception:
                pass

    return topics[:LIMIT]


# Header-like values to skip (exact or start of first column)
_CSV_SKIP = (
    "trend", "tendances", "topic", "query", "search", "recherche",
    "volume", "started", "démarrée", "composition", "état",
)


def _parse_trends_csv(path: Path) -> list[TrendItem]:
    """Parse trend items from downloaded CSV. Columns: title, search_volume, started."""
    topics: list[TrendItem] = []
    seen: set[str] = set()
    try:
        with open(path, encoding="utf-8-sig", errors="replace") as f:
            reader = csv.reader(f)
            for row in reader:
                if not row or not row[0]:
                    continue
                val = str(row[0]).strip()
                if not val or val.startswith("#"):
                    continue
                low = val.lower()
                if low in _CSV_SKIP or any(low.startswith(s) for s in _CSV_SKIP):
                    continue
                if len(val) > 1 and val not in seen:
                    seen.add(val)
                    item: TrendItem = {"title": val}
                    if len(row) > 1 and row[1]:
                        item["search_volume"] = str(row[1]).strip()
                    if len(row) > 2 and row[2]:
                        item["started"] = str(row[2]).strip()
                    topics.append(item)
                    if len(topics) >= LIMIT:
                        break
    except Exception:
        pass
    return topics


def _extract_from_dom(page) -> list[TrendItem]:
    """Extract trend items from page DOM. Table columns: title, search_volume, started."""
    skip = {
        "trends", "tendances", "export", "exporter", "search", "recherche",
        "trend", "volume", "started", "démarrée", "tendances de recherche",
        "search trends", "composition", "état",
    }
    best: list[TrendItem] = []
    seen: set[str] = set()

    def _add(title: str, volume: str = "", started: str = "") -> None:
        if not title or title.lower() in skip or title in seen or not (2 < len(title) < 200):
            return
        seen.add(title)
        item: TrendItem = {"title": title}
        if volume:
            item["search_volume"] = volume
        if started:
            item["started"] = started
        best.append(item)

    try:
        # 1. Rows via get_by_role - extract all columns
        rows = page.get_by_role("row").all()
        for row in rows[1:]:  # Skip header row
            try:
                cells = row.locator("td").all()
                if len(cells) >= 1:
                    title = cells[0].inner_text().strip().split("\n")[0].strip()
                    volume = cells[1].inner_text().strip().split("\n")[0].strip() if len(cells) > 1 else ""
                    started = cells[2].inner_text().strip().split("\n")[0].strip() if len(cells) > 2 else ""
                    _add(title, volume, started)
            except Exception:
                pass
            if len(best) >= LIMIT:
                break

        # 2. Fallback: first column only (no volume/started)
        if len(best) < 5:
            for sel in [
                "tr[role='row'] td:first-child",
                "[role='row'] td:first-child",
                "table td:first-child",
                "a[href*='/trends/explore']",
            ]:
                try:
                    for el in page.locator(sel).all()[:LIMIT * 2]:
                        try:
                            raw = el.inner_text().strip()
                            title = raw.split("\n")[0].strip() if raw else ""
                            _add(title)
                        except Exception:
                            continue
                    if len(best) >= LIMIT:
                        break
                except Exception:
                    continue
    except Exception:
        pass

    return best[:LIMIT]
