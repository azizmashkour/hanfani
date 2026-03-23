"""Pytest fixtures for Hanfani API tests."""

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client() -> TestClient:
    """Create a test client for the FastAPI application."""
    return TestClient(app)


@pytest.fixture(autouse=True)
def mock_db_empty():
    """Mock get_trends_from_db to return None (no DB data) so tests use live fetch path."""
    with patch("main.get_trends_from_db", return_value=None):
        yield
