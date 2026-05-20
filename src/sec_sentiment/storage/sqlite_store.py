"""Small SQLite repository for persisted filing analysis results."""

from __future__ import annotations

import sqlite3
from pathlib import Path

from sec_sentiment.models import AnalysisResult


class AnalysisStore:
    """Saves completed analysis results to SQLite."""

    def __init__(self, db_path: str) -> None:
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._create_table()

    def save(self, result: AnalysisResult) -> AnalysisResult:
        """Store the result JSON and return the result with its database id."""

        with sqlite3.connect(self.db_path) as connection:
            cursor = connection.execute(
                """
                INSERT INTO analyses (
                    ticker,
                    form_type,
                    accession_number,
                    filed_at,
                    result_json,
                    analyzed_at
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    result.ticker,
                    result.form_type,
                    result.accession_number,
                    result.filed_at.isoformat(),
                    result.model_dump_json(),
                    result.analyzed_at.isoformat(),
                ),
            )
            return result.model_copy(update={"id": cursor.lastrowid})

    def _create_table(self) -> None:
        with sqlite3.connect(self.db_path) as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS analyses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ticker TEXT NOT NULL,
                    form_type TEXT NOT NULL,
                    accession_number TEXT NOT NULL,
                    filed_at TEXT NOT NULL,
                    result_json TEXT NOT NULL,
                    analyzed_at TEXT NOT NULL
                )
                """
            )
            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_analyses_ticker_form
                ON analyses (ticker, form_type, analyzed_at)
                """
            )
