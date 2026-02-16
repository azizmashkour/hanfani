# Hanfani API

## Run locally

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Use `--port 8001` if port 8000 is already in use.

## MongoDB

Trends are stored in MongoDB. Set env vars:

- `MONGODB_URI` – default `mongodb://localhost:27017`
- `MONGODB_DB` – default `hanfani`

## Google Trends

**Option 1: Scraper (default, no API key)**  
Scrapes https://trends.google.com/trending?geo=XX using Playwright. Returns first 25 trends.

```bash
pip install playwright
playwright install chromium
```

Set `TRENDS_USE_SCRAPER=false` to disable.

**Option 2: SerpApi (100 free searches/month)**  
Set `SERPAPI_KEY=your_key` for API-based fetching. Takes precedence over scraper.

**Topic mentions (news/articles)**  
`GET /trends/mentions?topic=...&country=...` fetches news articles and platform coverage for a trending topic. Requires `SERPAPI_KEY`.

## Trends worker

Scrapes Google Trends for each country and saves to MongoDB.

```bash
# One-time run
python3 -m worker

# Or use the wrapper (loads .env)
./run-worker.sh
```

**Schedule every 24 hours** (cron):

```bash
# Make script executable
chmod +x apps/api/run-worker.sh

# Add to crontab (crontab -e)
0 0 * * * /absolute/path/to/apps/api/run-worker.sh >> /var/log/hanfani-worker.log 2>&1
```

Runs at midnight daily. Change `0 0` to another hour (e.g. `0 6` for 6am).

**Custom countries:**

```bash
TRENDS_COUNTRIES=US,GB,FR,CR python3 -m worker
```

## Docker

**Run API (runtime):**
```bash
docker build -t hanfani-api .
docker run -p 8000:8000 hanfani-api
```

**Run tests:**
```bash
docker build -f Dockerfile.test -t hanfani-api-test .
docker run hanfani-api-test
```

## CORS

The API allows cross-origin requests from the web app. Set `CORS_ORIGINS` (comma-separated) to add production domains.
