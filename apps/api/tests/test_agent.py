"""Tests for the AI agent service and endpoint."""

from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


def test_agent_chat_no_backend_returns_helpful_message() -> None:
    """When no LLM backend is available, chat returns setup instructions."""
    from services.agent import chat

    with patch("services.agent._get_llm_client", return_value=(None, "")):
        result = chat("What's trending?", country="US")
    assert "Ollama" in result or "Groq" in result
    assert "free" in result.lower() or "ollama.com" in result or "console.groq" in result


def test_agent_chat_with_mock_client() -> None:
    """When LLM client is mocked, chat returns the mock response."""
    from services.agent import chat

    mock_response = type("R", (), {"content": "Here are the top trends: A, B, C."})()
    mock_choice = type("C", (), {"message": mock_response})()
    mock_completion = type("Comp", (), {"choices": [mock_choice]})()

    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = mock_completion

    with patch("services.agent._get_llm_client", return_value=(mock_client, "llama3")):
        result = chat("What's trending?", country="US")

    assert "top trends" in result or "A, B, C" in result


def test_agent_endpoint_returns_reply(client: TestClient) -> None:
    """POST /agent/chat returns reply in JSON."""
    with patch("main.agent_chat") as mock_chat:
        mock_chat.return_value = "Here are the trends."
        response = client.post(
            "/agent/chat",
            json={"message": "What's trending?", "country": "US"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["reply"] == "Here are the trends."
    mock_chat.assert_called_once_with(
        message="What's trending?",
        country="US",
        topic=None,
    )


def test_agent_endpoint_with_topic(client: TestClient) -> None:
    """POST /agent/chat passes topic when provided."""
    with patch("main.agent_chat") as mock_chat:
        mock_chat.return_value = "News about AI..."
        response = client.post(
            "/agent/chat",
            json={
                "message": "Summarize the news",
                "country": "US",
                "topic": "AI developments",
            },
        )

    assert response.status_code == 200
    mock_chat.assert_called_once_with(
        message="Summarize the news",
        country="US",
        topic="AI developments",
    )


def test_agent_endpoint_invalid_country_returns_400(client: TestClient) -> None:
    """POST /agent/chat with invalid country returns 400."""
    response = client.post(
        "/agent/chat",
        json={"message": "Hi", "country": "INVALID"},
    )
    assert response.status_code == 400
    assert "Invalid" in response.json()["detail"]


def test_agent_endpoint_empty_message_returns_422(client: TestClient) -> None:
    """POST /agent/chat with empty message returns 422."""
    response = client.post(
        "/agent/chat",
        json={"message": "", "country": "US"},
    )
    assert response.status_code == 422
