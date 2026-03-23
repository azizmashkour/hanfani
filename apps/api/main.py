"""Hanfani AI FastAPI application entry point."""

import os
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.agent import chat as agent_chat
from services.topic_mentions import fetch_topic_mentions
from services.trends_store import get_trends_from_db

app = FastAPI(title="Hanfani AI API", version="0.1.0")

# CORS: allow web app (different origin/port) to call /status and other endpoints
_allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3004,http://localhost:3000,http://localhost:3003").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _allowed_origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    """Health check endpoint for CI and monitoring."""
    return {"status": "ok"}


@app.get("/status")
def status() -> dict:
    """Status endpoint for the status page. Returns availability and metadata."""
    return {
        "status": "operational",
        "service": "hanfani-api",
        "version": "0.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/trends")
def trends(
    country: str = "US",
    filter_param: str = "last_7_days",
) -> dict:
    """
    Get top trending topics for a specific country.

    Reads from MongoDB only (populated by worker). Never runs scraper in request path
    to avoid timeouts. If DB is empty or unreachable, returns empty list immediately.

    Args:
        country: ISO 3166-1 alpha-2 country code (e.g. US, GB, FR). Defaults to US.
        filter_param: "yesterday" (single day) or "last_7_days" (aggregate). Max 7 days.

    Returns:
        JSON with country, topics, source (db or fallback), and fetched_at.
    """
    if not country or not country.strip():
        raise HTTPException(status_code=400, detail="Country code is required")
    code = country.strip().upper()
    if len(code) != 2 or not code.isalpha():
        raise HTTPException(
            status_code=400,
            detail=f"Invalid country code: {country}. Use ISO 3166-1 alpha-2.",
        )

    if filter_param not in ("yesterday", "last_7_days"):
        raise HTTPException(
            status_code=400,
            detail="filter must be 'yesterday' or 'last_7_days'",
        )

    try:
        doc = get_trends_from_db(code, filter_param=filter_param)
        if doc and doc.topics:
            return {
                "country": doc.country,
                "topics": doc.topics,
                "source": "db",
                "fetched_at": doc.fetched_at.isoformat(),
            }
    except Exception:
        pass  # DB unreachable - return empty immediately (no slow scraper)

    # No data in DB - return empty immediately; worker populates DB in background
    return {
        "country": code,
        "topics": [],
        "source": "fallback",
    }


@app.get("/trends/mentions")
def trend_mentions(topic: str, country: str = "US") -> dict:
    """
    Get news articles and platform mentions for a trending topic.

    Requires SERPAPI_KEY for live data. Returns articles sorted by relevance
    (position in Google News) and date.

    Args:
        topic: The trending topic to search for.
        country: ISO 3166-1 alpha-2 country code (e.g. US, FR). Defaults to US.

    Returns:
        JSON with topic, country, mentions (list of articles/platforms).
    """
    if not topic or not topic.strip():
        raise HTTPException(status_code=400, detail="Topic is required")

    code = country.strip().upper() if country else "US"
    if len(code) != 2 or not code.isalpha():
        raise HTTPException(status_code=400, detail=f"Invalid country code: {country}")

    mentions = fetch_topic_mentions(topic.strip(), code, limit=25)
    return {
        "topic": topic.strip(),
        "country": code,
        "mentions": mentions,
    }


class AgentChatRequest(BaseModel):
    """Request body for agent chat."""

    message: str = Field(..., min_length=1, max_length=4000)
    country: str = Field(default="US", description="Country for trends context")
    topic: str | None = Field(default=None, description="Optional topic for mentions context")


@app.post("/agent/chat")
def agent_chat_endpoint(body: AgentChatRequest) -> dict:
    """
    Chat with the AI agent about trends and coverage.

    The agent has access to trending topics and news/mentions. Use it to:
    - Understand what's trending and why
    - Explore coverage for specific topics
    - Get actionable insights

    Args:
        body: message (required), country (default US), topic (optional for mentions).

    Returns:
        JSON with reply from the agent.
    """
    code = (body.country or "US").strip().upper()
    if len(code) != 2 or not code.isalpha():
        raise HTTPException(status_code=400, detail=f"Invalid country code: {body.country}")

    reply = agent_chat(
        message=body.message.strip(),
        country=code,
        topic=body.topic.strip() if body.topic and body.topic.strip() else None,
    )
    return {"reply": reply}
