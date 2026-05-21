"""Read-only analysis snapshots that keep the public demo available."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from sec_sentiment.models import AnalysisResult, FormType, RiskTrendPoint


class PrecomputedAnalysisCache:
    """Returns committed analysis snapshots for selected popular filings."""

    def __init__(self, path: str) -> None:
        self.path = Path(path)
        self.analyses = self._load_analyses()

    def get_analysis(self, ticker: str, form_type: FormType) -> AnalysisResult | None:
        """Return the newest precomputed result for one ticker and filing form."""

        results = self._matching_analyses(ticker, [form_type])
        return results[0] if results else None

    def get_trend_points(
        self,
        ticker: str,
        form_types: list[FormType],
        limit: int,
    ) -> list[RiskTrendPoint]:
        """Build chart points from saved full-analysis snapshots."""

        results = self._matching_analyses(ticker, form_types)[:limit]
        return [self._trend_point(result) for result in results]

    def _load_analyses(self) -> list[AnalysisResult]:
        if not self.path.exists():
            return []

        raw_payload: Any = json.loads(self.path.read_text(encoding="utf-8"))
        if not isinstance(raw_payload, dict):
            raise ValueError("Precomputed analysis cache must contain a JSON object.")

        raw_analyses = raw_payload.get("analyses", [])
        if not isinstance(raw_analyses, list):
            raise ValueError("Precomputed analysis cache analyses must be a JSON list.")

        return [AnalysisResult.model_validate(item) for item in raw_analyses]

    def _matching_analyses(
        self,
        ticker: str,
        form_types: list[FormType],
    ) -> list[AnalysisResult]:
        normalized_ticker = ticker.upper().strip()
        matches = [
            result
            for result in self.analyses
            if result.ticker == normalized_ticker and result.form_type in form_types
        ]
        return sorted(
            matches,
            key=lambda result: (result.filed_at, result.analyzed_at),
            reverse=True,
        )

    def _trend_point(self, result: AnalysisResult) -> RiskTrendPoint:
        return RiskTrendPoint(
            ticker=result.ticker,
            company_name=result.company_name,
            form_type=result.form_type,
            accession_number=result.accession_number,
            filed_at=result.filed_at,
            document_url=result.document_url,
            risk_score=result.risk_score,
            risk_level=result.risk_level,
            sentiment_label=result.sentiment_label,
            uncertainty_score=result.uncertainty_score,
            top_driver=self._top_driver(result),
        )

    def _top_driver(self, result: AnalysisResult) -> str | None:
        for category in result.risk_categories:
            if category.score > 0:
                return category.label
        return None
