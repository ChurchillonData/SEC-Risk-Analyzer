from datetime import date

from sec_sentiment.models import AnalysisResult
from sec_sentiment.storage import AnalysisStore


def test_analysis_store_saves_result(tmp_path) -> None:
    store = AnalysisStore(str(tmp_path / "analysis.db"))
    result = AnalysisResult(
        ticker="AAPL",
        cik="320193",
        company_name="Apple Inc.",
        form_type="8-K",
        accession_number="0000320193-26-000001",
        filed_at=date(2026, 5, 1),
        document_url="https://www.sec.gov/example",
        sentiment_label="neutral",
        sentiment_score=0.0,
        risk_score=0.0,
        uncertainty_score=0.0,
        risk_level="low",
        evidence=[],
        evidence_excerpts=[],
        explanation=None,
    )

    saved = store.save(result)

    assert saved.id == 1
