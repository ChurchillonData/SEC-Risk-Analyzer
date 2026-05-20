"""Tests for end-to-end filing analysis service helpers."""

from datetime import date

from sec_sentiment.models import FilingDocument, FilingExplanation, FilingMetadata
from sec_sentiment.nlp import FinancialTextAnalyzer
from sec_sentiment.pipeline import FilingAnalysisService
from sec_sentiment.storage import AnalysisStore


def test_risk_trend_returns_chronological_points() -> None:
    service = FilingAnalysisService(
        ingestor=FakeIngestor(),
        analyzer=FinancialTextAnalyzer(),
        explainer=FakeExplainer(),
        store=NullStore(),
        max_evidence_excerpts=4,
    )

    trend = service.analyze_risk_trend("MSFT", ["10-Q", "10-K"], limit=2)

    assert [point.filed_at for point in trend.points] == [
        date(2025, 1, 31),
        date(2025, 4, 30),
    ]
    assert trend.points[-1].risk_score > 0
    assert trend.points[-1].top_driver == "Regulatory Risk"


def test_analyze_latest_returns_cached_result_without_refetching(tmp_path) -> None:
    store = AnalysisStore(str(tmp_path / "analysis.db"))
    ingestor = FakeIngestor()
    service = FilingAnalysisService(
        ingestor=ingestor,
        analyzer=FinancialTextAnalyzer(),
        explainer=FakeExplainer(),
        store=store,
        max_evidence_excerpts=4,
    )

    first_result = service.analyze_latest("MSFT", "10-K")
    second_result = service.analyze_latest("MSFT", "10-K")

    assert first_result.accession_number == second_result.accession_number
    assert second_result.id == first_result.id
    assert ingestor.download_count == 1


class FakeIngestor:
    def __init__(self) -> None:
        self.download_count = 0

    def get_latest_metadata(self, ticker, form_type):
        return build_metadata(form_type, date(2025, 7, 30), "0003")

    def get_recent_metadata(self, ticker, form_types, limit):
        return [
            build_metadata("10-Q", date(2025, 4, 30), "0002"),
            build_metadata("10-Q", date(2025, 1, 31), "0001"),
        ]

    def fetch_by_metadata(self, metadata):
        self.download_count += 1
        return build_document(metadata)


class FakeExplainer:
    def explain(self, metadata, analysis):
        return FilingExplanation(
            provider="template",
            model=None,
            executive_summary="Test explanation.",
            sentiment_explanation="Test sentiment.",
            risk_explanation="Test risk.",
            key_drivers=[],
            cited_evidence_ids=[],
            watch_items=[],
            limitations=[],
        )


class NullStore:
    def get_trend_point(self, ticker, form_type, accession_number):
        return None

    def save_trend_point(self, point):
        return point


def build_metadata(form_type: str, filed_at: date, accession: str) -> FilingMetadata:
    return FilingMetadata(
        ticker="MSFT",
        cik="789019",
        company_name="Microsoft Corporation",
        form_type=form_type,
        accession_number=accession,
        filed_at=filed_at,
        primary_document="msft.htm",
        document_url=f"https://www.sec.gov/example/{accession}",
    )


def build_document(metadata: FilingMetadata) -> FilingDocument:
    text = (
        "The company faces regulatory risk and compliance uncertainty. "
        "New regulations could increase costs and create investigation risk."
    )
    return FilingDocument(metadata=metadata, raw_text=text, clean_text=text)
