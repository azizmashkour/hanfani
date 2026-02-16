"""Data models for Hanfani API."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class TrendsDocument(BaseModel):
    """Trends document stored in MongoDB."""

    country: str = Field(..., description="ISO 3166-1 alpha-2 country code")
    topics: list[dict[str, Any]] = Field(
        default_factory=list,
        description="List of trend items: {title, search_volume?, started?}",
    )
    source: Literal["api", "fallback"] = Field(default="fallback")
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
