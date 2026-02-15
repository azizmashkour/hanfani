"""Hanfani AI FastAPI application entry point."""

import os
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
