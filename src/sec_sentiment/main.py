"""Application entrypoint used by Uvicorn and Docker."""

from sec_sentiment.api import app

__all__ = ["app"]
