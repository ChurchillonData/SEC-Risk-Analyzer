"""Tests for end-to-end filing analysis service helpers."""

from datetime import date

from sec_sentiment.models import FilingDocument, FilingMetadata
from sec_sentiment.nlp import FinancialTextAnalyzer
from sec_sentiment.pipeline import FilingAnalysisService


def test_risk_trend_returns_chronological_points() -> None:
    service = FilingAnalysisService(
        ingestor=FakeIngestor(),
        analyzer=FinancialTextAnalyzer(),
        explainer=object(),
        store=object(),
        max_evidence_excerpts=4,
    )

    trend = service.analyze_risk_trend("MSFT", ["10-Q", "10-K"], limit=2)

    assert [point.filed_at for point in trend.points] == [
        date(2025, 1, 31),
        date(2025, 4, 30),
    ]
    assert trend.points[-1].risk_score > 0
    assert trend.points[-1].top_driver == "Regulatory Risk"


class FakeIngestor:
    def fetch_recent(self, ticker, form_types, limit):
        return [
            build_document("10-Q", date(2025, 4, 30), "0002"),
            build_document("10-Q", date(2025, 1, 31), "0001"),
        ]


def build_document(form_type: str, filed_at: date, accession: str) -> FilingDocument:
    metadata = FilingMetadata(
        ticker="MSFT",
        cik="789019",
        company_name="Microsoft Corporation",
        form_type=form_type,
        accession_number=accession,
        filed_at=filed_at,
        primary_document="msft.htm",
        document_url=f"https://www.sec.gov/example/{accession}",
    )
    text = (
        "The company faces regulatory risk and compliance uncertainty. "
        "New regulations could increase costs and create investigation risk."
    )
    return FilingDocument(metadata=metadata, raw_text=text, clean_text=text)
