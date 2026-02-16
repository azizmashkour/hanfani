"""Tests for the trends scraper service."""

import csv
import tempfile
from pathlib import Path

import pytest

from services.trends_scraper import _parse_trends_csv


def test_parse_trends_csv_basic() -> None:
    """_parse_trends_csv parses valid rows into trend items."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
        writer = csv.writer(f)
        writer.writerow(["AI News"])
        writer.writerow(["Climate Summit"])
        writer.writerow(["Sports Update"])
        path = Path(f.name)

    try:
        result = _parse_trends_csv(path)
        assert len(result) == 3
        assert result[0]["title"] == "AI News"
        assert result[1]["title"] == "Climate Summit"
        assert result[2]["title"] == "Sports Update"
    finally:
        path.unlink()


def test_parse_trends_csv_with_metadata() -> None:
    """_parse_trends_csv includes search_volume and started when present."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
        writer = csv.writer(f)
        writer.writerow(["Breaking News", "1M+", "2h ago"])
        writer.writerow(["Local Event", "500K"])
        path = Path(f.name)

    try:
        result = _parse_trends_csv(path)
        assert result[0]["title"] == "Breaking News"
        assert result[0]["search_volume"] == "1M+"
        assert result[0]["started"] == "2h ago"
        assert result[1]["title"] == "Local Event"
        assert result[1]["search_volume"] == "500K"
        assert "started" not in result[1]
    finally:
        path.unlink()


def test_parse_trends_csv_skips_headers() -> None:
    """_parse_trends_csv skips header-like rows."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
        writer = csv.writer(f)
        writer.writerow(["Tendances"])
        writer.writerow(["Valid Trend 1"])
        writer.writerow(["Trend"])
        writer.writerow(["Valid Trend 2"])
        path = Path(f.name)

    try:
        result = _parse_trends_csv(path)
        assert len(result) == 2
        assert result[0]["title"] == "Valid Trend 1"
        assert result[1]["title"] == "Valid Trend 2"
    finally:
        path.unlink()


def test_parse_trends_csv_skips_comments() -> None:
    """_parse_trends_csv skips rows starting with #."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
        writer = csv.writer(f)
        writer.writerow(["# comment"])
        writer.writerow(["Real Topic"])
        path = Path(f.name)

    try:
        result = _parse_trends_csv(path)
        assert len(result) == 1
        assert result[0]["title"] == "Real Topic"
    finally:
        path.unlink()


def test_parse_trends_csv_deduplicates() -> None:
    """_parse_trends_csv does not add duplicate titles."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
        writer = csv.writer(f)
        writer.writerow(["Duplicate"])
        writer.writerow(["Duplicate"])
        writer.writerow(["Other"])
        path = Path(f.name)

    try:
        result = _parse_trends_csv(path)
        assert len(result) == 2
        assert result[0]["title"] == "Duplicate"
        assert result[1]["title"] == "Other"
    finally:
        path.unlink()


def test_parse_trends_csv_respects_limit() -> None:
    """_parse_trends_csv stops at LIMIT (25) items."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
        writer = csv.writer(f)
        for i in range(30):
            writer.writerow([f"Item {i}"])
        path = Path(f.name)

    try:
        result = _parse_trends_csv(path)
        assert len(result) == 25
    finally:
        path.unlink()


def test_parse_trends_csv_empty_file() -> None:
    """_parse_trends_csv returns empty list for empty file."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
        path = Path(f.name)

    try:
        result = _parse_trends_csv(path)
        assert result == []
    finally:
        path.unlink()


def test_parse_trends_csv_nonexistent_returns_empty() -> None:
    """_parse_trends_csv returns empty list for nonexistent path."""
    result = _parse_trends_csv(Path("/nonexistent/path.csv"))
    assert result == []
