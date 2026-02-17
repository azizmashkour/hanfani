"""AI agent service for trends intelligence and guidance.

Supports free, open-source backends:
- Ollama (default): Local LLMs, no API key. Run `ollama run llama3` first.
- Groq: Free tier (30 req/min). Set GROQ_API_KEY.
- OpenAI: Paid. Set OPENAI_API_KEY.
"""

from __future__ import annotations

import os
from typing import Any

from services.topic_mentions import fetch_topic_mentions
from services.trends_store import get_trends_from_db

SYSTEM_PROMPT = """You are the Hanfani AI agent. Your role is to help users discover what's trending, explore coverage across news and platforms, and stay ahead with actionable insights.

You have access to:
1. **Trending topics** – Real-time Google Trends data by country
2. **Topic mentions** – News articles and coverage for any trending topic

Guidelines:
- Be concise and actionable. Summarize trends, explain why they matter, and suggest next steps.
- When users ask about a topic, use the mentions data to provide context from news and platforms.
- If no data is available, say so clearly and suggest they check the Trends page or try a different country/topic.
- Stay professional and helpful. Avoid speculation; base answers on the data provided.
"""


def _get_llm_client() -> tuple[Any, str]:
    """
    Return (client, model) for the configured LLM backend.
    Free options: Ollama (local), Groq (free tier). Paid: OpenAI.
    """
    provider = (os.getenv("AGENT_PROVIDER", "ollama") or "ollama").strip().lower()

    # Ollama: free, local, no API key. Run `ollama run llama3` first.
    if provider == "ollama":
        base_url = (os.getenv("OLLAMA_BASE_URL", "http://localhost:11434") or "http://localhost:11434").rstrip("/")
        if not base_url.endswith("/v1"):
            base_url = f"{base_url}/v1"
        model = os.getenv("OLLAMA_MODEL", "llama3")
        try:
            from openai import OpenAI

            client = OpenAI(base_url=base_url, api_key="ollama")
            return client, model
        except Exception:
            pass

    # Groq: free tier (30 req/min). Get key at console.groq.com
    if provider == "groq":
        groq_key = os.getenv("GROQ_API_KEY", "").strip()
        if groq_key:
            try:
                from openai import OpenAI

                client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=groq_key)
                model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
                return client, model
            except Exception:
                pass

    # OpenAI: paid
    if provider == "openai":
        openai_key = os.getenv("OPENAI_API_KEY", "").strip()
        if openai_key:
            try:
                from openai import OpenAI

                client = OpenAI(api_key=openai_key)
                model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
                return client, model
            except Exception:
                pass

    # Fallback: Groq if key set (e.g. when Ollama not running)
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if groq_key:
        try:
            from openai import OpenAI

            client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=groq_key)
            model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
            return client, model
        except Exception:
            pass

    return None, ""


def _build_context(country: str, topic: str | None) -> str:
    """Build context string from trends and optionally mentions."""
    parts: list[str] = []

    try:
        doc = get_trends_from_db(country)
        if doc and doc.topics:
            topics_str = ", ".join(
                t.get("title", str(t)) if isinstance(t, dict) else str(t)
                for t in doc.topics[:20]
            )
            parts.append(f"**Trending in {country}:** {topics_str}")
        else:
            parts.append(f"No trending data for {country} in the database.")
    except Exception:
        parts.append(f"Could not fetch trends for {country}.")

    if topic and topic.strip():
        mentions = fetch_topic_mentions(topic.strip(), country, limit=10)
        if mentions:
            items = []
            for m in mentions[:8]:
                title = m.get("title", "")
                source = m.get("source", "")
                link = m.get("link", "")
                snippet = (m.get("snippet", "") or "")[:150]
                items.append(f"- {title} ({source}): {snippet}...")
            parts.append(f"\n**News/coverage for '{topic.strip()}':**\n" + "\n".join(items))
        else:
            parts.append(f"\nNo news/mentions found for '{topic.strip()}'.")

    return "\n\n".join(parts) if parts else "No context available."


def chat(message: str, country: str = "US", topic: str | None = None) -> str:
    """
    Send a message to the AI agent and get a reply.

    Uses free backends by default: Ollama (local) or Groq (free tier).
    Set AGENT_PROVIDER=openai and OPENAI_API_KEY for paid OpenAI.

    Args:
        message: User message.
        country: Country code for trends context (default US).
        topic: Optional topic to fetch mentions for (e.g. when user asks about a specific trend).

    Returns:
        Agent reply string.
    """
    client, model = _get_llm_client()
    if not client or not model:
        return (
            "No LLM backend available. Free options:\n\n"
            "1. **Ollama** (recommended): Install from ollama.com, run `ollama run llama3`, "
            "then start the API. No API key needed.\n\n"
            "2. **Groq** (free tier): Get a key at console.groq.com, set GROQ_API_KEY, "
            "and AGENT_PROVIDER=groq.\n\n"
            "You can still explore trends and mentions on the Trends page."
        )

    context = _build_context(country, topic)
    user_content = f"[Context]\n{context}\n\n[User question]\n{message}"

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            max_tokens=1024,
            temperature=0.7,
        )
        reply = response.choices[0].message.content
        return reply or "I couldn't generate a response. Please try again."
    except Exception as e:
        return f"Sorry, I encountered an error: {str(e)}. Please try again."
