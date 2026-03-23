# 📈 Hanfani AI

[![CI](https://github.com/azizmashkour/hanfani/actions/workflows/ci.yml/badge.svg)](https://github.com/azizmashkour/hanfani/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/azizmashkour/hanfani/graph/badge.svg)](https://codecov.io/gh/azizmashkour/hanfani)

> **Bridging Google Trends and Social Intelligence with Autonomous AI Agents.**

Hanfani AI is a high-performance, open-source intelligence platform designed to not only track what is trending but to explain **why** it matters. By combining real-time data from Google Trends with social media context, it empowers users to turn raw data into actionable goals via a dedicated AI agent.

## 🚀 The Ambition
Our goal is to build a transparent, community-driven tool that provides:
1. **Automated Discovery:** Real-time fetching of Google Trends data.
2. **Contextual Intelligence:** Cross-referencing trends with social media signals.
3. **Agentic Guidance:** An AI agent that clarifies user intent and directs them toward their specific goals.
4. **Developer Excellence:** A "one feature a day" delivery model with strict JSDoc, high-quality tests, and automated CI/CD.

## 🛠️ The Tech Stack (Free & Open Source)
- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router, React Compiler) + [Tailwind CSS](https://tailwindcss.com/)
- **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
- **Database:** [MongoDB](https://www.mongodb.com/)
- **AI Agent:** [Ollama](https://ollama.com/) (default) – local open-source LLMs; optional: Groq, OpenAI
- **State/Types:** TypeScript + Pydantic
- **DevOps:** Docker + GitHub Actions
- **Documentation:** Swagger (API) + Docusaurus (Features)

## 🏃 Quick Start

Default ports (configurable if 3000–3002 and 8000 are in use):

- **Web:** http://localhost:3004 — `cd apps/web && pnpm dev`
- **API:** http://localhost:8001 — `cd apps/api && uvicorn main:app --reload --port 8001`

Copy `apps/web/.env.example` to `apps/web/.env` and set `NEXT_PUBLIC_API_URL=http://localhost:8001` if needed.

## 🤖 AI Agent

The AI agent powers insights, trends summaries, and coverage exploration. It supports multiple backends:

| Backend | Cost | Setup |
|---------|------|-------|
| **Ollama** (default) | Free | Local, no API key. [Install Ollama](https://ollama.com/) then run `ollama run llama3` |
| **Groq** | Free tier | Set `GROQ_API_KEY`. Get key at [console.groq.com](https://console.groq.com/) |
| **OpenAI** | Paid | Set `OPENAI_API_KEY` |

**Ollama (recommended for local use):**
```bash
# Install from https://ollama.com, then:
ollama run llama3
```

Set `AGENT_PROVIDER=ollama` (default), `groq`, or `openai` in `.env` if needed.

## 🌍 Globalization
Built with inclusivity in mind:
- **Languages:** English / French (Fully i18n)
- **Visuals:** Native Dark/Light mode support.
- **Geolocalisation:** Trend analysis per continent and country.

## 📊 Status
A status page is available at `/status` to check app and API availability in real time.

## 🤝 Contributing
We release one feature every single day. Check our [Project Board](https://github.com/users/azizmashkour/projects/3) to see what's being built today. Please read our `CONTRIBUTING.md` for our coding standards.

## 📜 Third-Party & AI Model Licenses

This project uses the following third-party components:

- **Ollama** – [MIT License](https://github.com/ollama/ollama/blob/main/LICENSE)
- **LLM models** (e.g. Llama 3 via Ollama) – When using models such as Meta Llama 3, you must comply with their respective licenses (e.g. [Llama 3 Community License](https://github.com/meta-llama/llama3/blob/main/LICENSE)). See each model's documentation for terms.

---
Licensed under MIT. Built for the community.