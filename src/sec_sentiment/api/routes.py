"""HTTP routes for health checks and filing analysis."""

from functools import lru_cache

from fastapi import APIRouter, HTTPException, status

from sec_sentiment.clients import SECClient
from sec_sentiment.config import get_settings
from sec_sentiment.ingestion import FilingIngestor
from sec_sentiment.llm import FilingExplainer
from sec_sentiment.models import (
    AnalysisRequest,
    AnalysisResult,
    RiskTrendRequest,
    RiskTrendResponse,
)
from sec_sentiment.nlp import FinancialTextAnalyzer
from sec_sentiment.parsing import FilingParser
from sec_sentiment.pipeline import FilingAnalysisService
from sec_sentiment.storage import AnalysisStore

router = APIRouter()


@lru_cache
def get_analysis_service() -> FilingAnalysisService:
    """Build the app service once and reuse it for requests."""

    settings = get_settings()
    sec_client = SECClient(settings)
    parser = FilingParser()
    ingestor = FilingIngestor(sec_client, parser, settings.max_filing_chars)
    analyzer = FinancialTextAnalyzer()
    explainer = FilingExplainer(settings)
    store = AnalysisStore(settings.sqlite_path)
    return FilingAnalysisService(
        ingestor=ingestor,
        analyzer=analyzer,
        explainer=explainer,
        store=store,
        max_evidence_excerpts=settings.llm_max_evidence_excerpts,
    )


@router.get("/health")
def health() -> dict[str, str]:
    """Return a small health response for uptime checks."""

    return {"status": "ok"}


@router.post("/api/v1/filings/analyze", response_model=AnalysisResult)
def analyze_filing(request: AnalysisRequest) -> AnalysisResult:
    """Analyze the latest SEC filing for a ticker and form type."""

    try:
        return get_analysis_service().analyze_latest(request.ticker, request.form_type)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Analysis failed: {exc}",
        ) from exc


@router.post("/api/v1/filings/risk-trend", response_model=RiskTrendResponse)
def analyze_risk_trend(request: RiskTrendRequest) -> RiskTrendResponse:
    """Analyze recent filings for a risk timeline chart."""

    try:
        return get_analysis_service().analyze_risk_trend(
            request.ticker,
            request.form_types,
            request.limit,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Risk trend analysis failed: {exc}",
        ) from exc
