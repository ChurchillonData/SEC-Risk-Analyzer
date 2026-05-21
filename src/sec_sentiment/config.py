"""Application settings loaded from environment variables."""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "SEC Filing Sentiment & Risk Analyzer"
    environment: str = "local"
    log_level: str = "INFO"
    cors_allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    sec_user_agent: str = Field(
        default="sec-sentiment-dev contact@example.com",
        description="Descriptive SEC User-Agent. Use your name and email for real use.",
    )
    sec_data_base_url: str = "https://data.sec.gov"
    sec_www_base_url: str = "https://www.sec.gov"
    request_timeout_seconds: float = 20.0
    min_sec_request_interval_seconds: float = 0.15
    sec_metadata_cache_seconds: float = 21_600.0
    sec_rate_limit_retries: int = 2
    sec_rate_limit_retry_seconds: float = 2.0

    sqlite_path: str = "data/sec_sentiment.db"
    precomputed_analyses_path: str = "data/precomputed_analyses.json"
    max_filing_chars: int = 1_000_000

    explanation_provider: Literal["none", "template", "openai"] = "template"
    llm_max_evidence_excerpts: int = 8
    openai_api_key: str | None = None
    openai_model: str = "gpt-4.1-mini"


@lru_cache
def get_settings() -> Settings:
    return Settings()
