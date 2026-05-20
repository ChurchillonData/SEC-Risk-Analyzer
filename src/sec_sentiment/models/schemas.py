"""Pydantic models used by the API, pipeline, and frontend response contract."""

from datetime import UTC, date, datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

FormType = Literal["10-K", "10-Q", "8-K", "20-F", "6-K"]
SentimentLabel = Literal["positive", "negative", "neutral", "mixed"]
RiskLevel = Literal["low", "medium", "high"]
EvidenceCategory = Literal["positive", "negative", "risk", "uncertainty"]
RiskCategory = Literal[
    "litigation",
    "regulatory",
    "liquidity",
    "market",
    "cybersecurity",
    "operational",
]


def default_trend_forms() -> list[FormType]:
    """Return the default forms used for a quarterly risk trend."""

    return ["10-Q", "10-K"]


class AnalysisRequest(BaseModel):
    """User request for analyzing the latest SEC filing for a ticker."""

    ticker: str = Field(min_length=1, examples=["AAPL"])
    form_type: FormType = "8-K"

    @field_validator("ticker")
    @classmethod
    def normalize_ticker(cls, value: str) -> str:
        """Store ticker symbols in a consistent uppercase format."""

        return value.upper().strip()


class RiskTrendRequest(BaseModel):
    """User request for analyzing recent filings for a risk trend chart."""

    ticker: str = Field(min_length=1, examples=["AAPL"])
    form_types: list[FormType] = Field(default_factory=default_trend_forms)
    limit: int = Field(default=6, ge=2, le=8)

    @field_validator("ticker")
    @classmethod
    def normalize_ticker(cls, value: str) -> str:
        """Store ticker symbols in a consistent uppercase format."""

        return value.upper().strip()


class FilingMetadata(BaseModel):
    """Metadata that identifies one SEC filing document."""

    ticker: str
    cik: str
    company_name: str | None = None
    form_type: FormType
    accession_number: str
    filed_at: date
    primary_document: str
    document_url: str


class FilingDocument(BaseModel):
    """A downloaded SEC filing with raw and cleaned text."""

    metadata: FilingMetadata
    raw_text: str
    clean_text: str
    sections: list["FilingSection"] = Field(default_factory=list)


class FilingSection(BaseModel):
    """A meaningful filing section extracted from the clean filing text."""

    key: str
    title: str
    text: str
    word_count: int


class EvidenceTerm(BaseModel):
    """A matched signal term and how often it appears."""

    term: str
    category: EvidenceCategory
    count: int = Field(ge=1)


class EvidenceExcerpt(BaseModel):
    """A short excerpt from the filing that supports the analysis."""

    id: int
    excerpt: str
    matched_terms: list[str]
    relevance_score: float
    source_section_key: str | None = None
    source_section_title: str | None = None


class RiskCategoryScore(BaseModel):
    """A focused risk score for one business risk theme."""

    category: RiskCategory
    label: str
    score: float
    level: RiskLevel
    matched_terms: list[str]
    evidence_count: int


class SectionAnalysis(BaseModel):
    """Risk and uncertainty signal summary for one filing section."""

    section_key: str
    title: str
    word_count: int
    risk_score: float
    uncertainty_score: float
    risk_level: RiskLevel
    top_terms: list[str]


class TextAnalysis(BaseModel):
    """NLP output before filing metadata and storage id are attached."""

    sentiment_label: SentimentLabel
    sentiment_score: float
    risk_level: RiskLevel
    risk_score: float
    uncertainty_score: float
    evidence: list[EvidenceTerm]
    evidence_excerpts: list[EvidenceExcerpt]
    risk_categories: list[RiskCategoryScore] = Field(default_factory=list)
    section_analyses: list[SectionAnalysis] = Field(default_factory=list)


class FilingExplanation(BaseModel):
    """Plain-English explanation shown in the frontend."""

    provider: Literal["none", "template", "openai"]
    model: str | None = None
    executive_summary: str
    sentiment_explanation: str
    risk_explanation: str
    key_drivers: list[str]
    cited_evidence_ids: list[int]
    watch_items: list[str]
    limitations: list[str]


class AnalysisResult(BaseModel):
    """Final API response returned to the React frontend."""

    id: int | None = None
    ticker: str
    cik: str
    company_name: str | None = None
    form_type: FormType
    accession_number: str
    filed_at: date
    document_url: str
    sentiment_label: SentimentLabel
    sentiment_score: float
    risk_score: float
    uncertainty_score: float
    risk_level: RiskLevel
    evidence: list[EvidenceTerm]
    evidence_excerpts: list[EvidenceExcerpt]
    risk_categories: list[RiskCategoryScore] = Field(default_factory=list)
    section_analyses: list[SectionAnalysis] = Field(default_factory=list)
    explanation: FilingExplanation | None = None
    analyzed_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class RiskTrendPoint(BaseModel):
    """One analyzed filing point shown in the frontend risk timeline."""

    ticker: str
    company_name: str | None = None
    form_type: FormType
    accession_number: str
    filed_at: date
    document_url: str
    risk_score: float
    risk_level: RiskLevel
    sentiment_label: SentimentLabel
    uncertainty_score: float
    top_driver: str | None = None


class RiskTrendResponse(BaseModel):
    """Recent filing risk scores for one company."""

    ticker: str
    company_name: str | None = None
    points: list[RiskTrendPoint]
