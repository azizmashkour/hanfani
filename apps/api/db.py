"""MongoDB connection and database access."""

from __future__ import annotations

import os

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGODB_DB", "hanfani")
# Fail fast if MongoDB unreachable (default 30s can cause frontend "signal timed out")
MONGODB_TIMEOUT_MS = int(os.getenv("MONGODB_TIMEOUT_MS", "5000"))


def get_client() -> MongoClient:
    """Get MongoDB client (creates new connection)."""
    return MongoClient(MONGODB_URI, serverSelectionTimeoutMS=MONGODB_TIMEOUT_MS)


def get_db() -> Database:
    """Get database instance."""
    return get_client()[DB_NAME]


def get_trends_collection() -> Collection:
    """Get trends collection."""
    return get_db()["trends"]
