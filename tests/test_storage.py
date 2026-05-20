from datetime import date

from sec_sentiment.models import AnalysisResult, RiskTrendPoint
from sec_sentiment.storage import AnalysisStore


def test_analysis_store_saves_result(tmp_path) -> None:
    store = AnalysisStore(str(tmp_path / "analysis.db"))

    saved = store.save(build_result())

    assert saved.id == 1


def test_analysis_store_returns_cached_result(tmp_path) -> None:
    store = AnalysisStore(str(tmp_path / "analysis.db"))
    saved = store.save(build_result())

    cached = store.get_analysis("AAPL", "8-K", "0000320193-26-000001")

    assert cached is not None
    assert cached.id == saved.id
    assert cached.company_name == "Apple Inc."


def test_analysis_store_saves_and_returns_trend_point(tmp_path) -> None:
    store = AnalysisStore(str(tmp_path / "analysis.db"))
    point = RiskTrendPoint(
        ticker="AAPL",
        company_name="Apple Inc.",
        form_type="10-K",
        accession_number="0000320193-26-000002",
        filed_at=date(2026, 5, 2),
        document_url="https://www.sec.gov/example",
        risk_score=4.2,
        risk_level="low",
        sentiment_label="positive",
        uncertainty_score=8.5,
        top_driver="Market Risk",
    )

    store.save_trend_point(point)
    cached = store.get_trend_point("AAPL", "10-K", "0000320193-26-000002")

    assert cached == point


def build_result() -> AnalysisResult:
    return AnalysisResult(
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
