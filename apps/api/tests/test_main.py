"""Tests for the main FastAPI application."""

from fastapi.testclient import TestClient


def test_health_check(client: TestClient) -> None:
    """Health check endpoint returns ok status."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_status(client: TestClient) -> None:
    """Status endpoint returns operational status and metadata."""
    response = client.get("/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["service"] == "hanfani-api"
    assert "version" in data
    assert "timestamp" in data
