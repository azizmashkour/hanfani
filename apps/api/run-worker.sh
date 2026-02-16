#!/usr/bin/env bash
# Run the trends worker. Use with cron for daily runs:
#   0 0 * * * /path/to/apps/api/run-worker.sh

set -e
cd "$(dirname "$0")"

# Load .env if present
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Activate venv if it exists (ensures dependencies like pandas, playwright are available)
if [ -d .venv ]; then
  source .venv/bin/activate
fi

# Use python3 if python is not available
if command -v python3 &>/dev/null; then
  exec python3 -m worker
else
  exec python -m worker
fi
