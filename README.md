# 📈 Hanfani AI

[![CI](https://github.com/azizmashkour/hanfani/actions/workflows/ci.yml/badge.svg)](https://github.com/azizmashkour/hanfani/actions/workflows/ci.yml)

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
- **State/Types:** TypeScript + Pydantic
- **DevOps:** Docker + GitHub Actions
- **Documentation:** Swagger (API) + Docusaurus (Features)

## 🏃 Quick Start

Default ports (configurable if 3000–3002 and 8000 are in use):

- **Web:** http://localhost:3004 — `cd apps/web && pnpm dev`
- **API:** http://localhost:8001 — `cd apps/api && uvicorn main:app --reload --port 8001`

Copy `apps/web/.env.example` to `apps/web/.env` and set `NEXT_PUBLIC_API_URL=http://localhost:8001` if needed.

## 🌍 Globalization
Built with inclusivity in mind:
- **Languages:** English / French (Fully i18n)
- **Visuals:** Native Dark/Light mode support.
- **Geolocalisation:** Trend analysis per continent and country.

## 📊 Status
A status page is available at `/status` to check app and API availability in real time.

## 🤝 Contributing
We release one feature every single day. Check our [Project Board](https://github.com/users/azizmashkour/projects/3) to see what's being built today. Please read our `CONTRIBUTING.md` for our coding standards.

---
Licensed under MIT. Built for the community.