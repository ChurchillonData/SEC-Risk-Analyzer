"""Small SQLite repository for persisted filing analysis and trend results."""

from __future__ import annotations

import sqlite3
from datetime import UTC, datetime
from pathlib import Path

from sec_sentiment.models import AnalysisResult, FormType, RiskTrendPoint


class AnalysisStore:
    """Saves completed analysis results and lightweight chart points to SQLite."""

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

    def get_analysis(
        self,
        ticker: str,
        form_type: FormType,
        accession_number: str,
    ) -> AnalysisResult | None:
        """Return a saved full analysis for the same exact SEC filing."""

        with sqlite3.connect(self.db_path) as connection:
            row = connection.execute(
                """
                SELECT id, result_json
                FROM analyses
                WHERE ticker = ?
                  AND form_type = ?
                  AND accession_number = ?
                ORDER BY analyzed_at DESC
                LIMIT 1
                """,
                (ticker.upper().strip(), form_type, accession_number),
            ).fetchone()

        if row is None:
            return None

        result = AnalysisResult.model_validate_json(row[1])
        return result.model_copy(update={"id": row[0]})

    def save_trend_point(self, point: RiskTrendPoint) -> RiskTrendPoint:
        """Store one lightweight point used by the risk trend chart."""

        now = datetime.now(UTC).isoformat()
        with sqlite3.connect(self.db_path) as connection:
            connection.execute(
                """
                INSERT INTO trend_points (
                    ticker,
                    form_type,
                    accession_number,
                    filed_at,
                    point_json,
                    analyzed_at
                )
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(ticker, form_type, accession_number)
                DO UPDATE SET
                    filed_at = excluded.filed_at,
                    point_json = excluded.point_json,
                    analyzed_at = excluded.analyzed_at
                """,
                (
                    point.ticker,
                    point.form_type,
                    point.accession_number,
                    point.filed_at.isoformat(),
                    point.model_dump_json(),
                    now,
                ),
            )
        return point

    def get_trend_point(
        self,
        ticker: str,
        form_type: FormType,
        accession_number: str,
    ) -> RiskTrendPoint | None:
        """Return a saved risk trend point for the same exact SEC filing."""

        with sqlite3.connect(self.db_path) as connection:
            row = connection.execute(
                """
                SELECT point_json
                FROM trend_points
                WHERE ticker = ?
                  AND form_type = ?
                  AND accession_number = ?
                """,
                (ticker.upper().strip(), form_type, accession_number),
            ).fetchone()

        if row is None:
            return None

        return RiskTrendPoint.model_validate_json(row[0])

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
            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_analyses_filing
                ON analyses (ticker, form_type, accession_number)
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS trend_points (
                    ticker TEXT NOT NULL,
                    form_type TEXT NOT NULL,
                    accession_number TEXT NOT NULL,
                    filed_at TEXT NOT NULL,
                    point_json TEXT NOT NULL,
                    analyzed_at TEXT NOT NULL,
                    PRIMARY KEY (ticker, form_type, accession_number)
                )
                """
            )
