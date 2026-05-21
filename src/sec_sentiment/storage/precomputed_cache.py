"""Read-only analysis snapshots that keep the public demo available."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from sec_sentiment.models import AnalysisResult, FormType


class PrecomputedAnalysisCache:
    """Returns committed analysis snapshots for selected popular filings."""

    def __init__(self, path: str) -> None:
        self.path = Path(path)
        self.analyses = self._load_analyses()

    def get_analysis(self, ticker: str, form_type: FormType) -> AnalysisResult | None:
        """Return the newest precomputed result for one ticker and filing form."""

        results = self._matching_analyses(ticker, [form_type])
        return results[0] if results else None

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
