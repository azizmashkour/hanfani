"""Hanfani AI FastAPI application entry point."""

from datetime import datetime, timezone
from fastapi import FastAPI

app = FastAPI(title="Hanfani AI API", version="0.1.0")


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
