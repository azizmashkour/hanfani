# Hanfani API

## Run locally

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Use `--port 8001` if port 8000 is already in use.

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
