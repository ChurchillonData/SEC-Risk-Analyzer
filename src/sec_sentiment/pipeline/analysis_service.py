"""End-to-end service for analyzing the latest SEC filing."""

from sec_sentiment.errors import SECRateLimitError
from sec_sentiment.ingestion import FilingIngestor
from sec_sentiment.llm import FilingExplainer
from sec_sentiment.models import (
    AnalysisResult,
    FormType,
    RiskCategoryScore,
    RiskTrendPoint,
    RiskTrendResponse,
)
from sec_sentiment.nlp import FinancialTextAnalyzer
from sec_sentiment.storage import AnalysisStore


class FilingAnalysisService:
    """Runs the complete filing analysis workflow."""

    def __init__(
        self,
        ingestor: FilingIngestor,
        analyzer: FinancialTextAnalyzer,
        explainer: FilingExplainer,
        store: AnalysisStore,
        max_evidence_excerpts: int,
    ) -> None:
        self.ingestor = ingestor
        self.analyzer = analyzer
        self.explainer = explainer
        self.store = store
        self.max_evidence_excerpts = max_evidence_excerpts

    def analyze_latest(self, ticker: str, form_type: FormType) -> AnalysisResult:
        """Fetch the filing, analyze it, explain it, and save the result."""

        normalized_ticker = ticker.upper().strip()

        try:
            metadata = self.ingestor.get_latest_metadata(normalized_ticker, form_type)
        except SECRateLimitError:
            cached_result = self.store.get_latest_analysis(normalized_ticker, form_type)
            if cached_result:
                return cached_result
            raise

        cached_result = self.store.get_analysis(
            metadata.ticker,
            metadata.form_type,
            metadata.accession_number,
        )
        if cached_result:
            return cached_result

        try:
            document = self.ingestor.fetch_by_metadata(metadata)
        except SECRateLimitError:
            cached_result = self.store.get_latest_analysis(normalized_ticker, form_type)
            if cached_result:
                return cached_result
            raise

        analysis = self.analyzer.analyze(
            document.clean_text,
            max_excerpts=self.max_evidence_excerpts,
            sections=document.sections,
        )
        explanation = self.explainer.explain(document.metadata, analysis)

        result = AnalysisResult(
            ticker=document.metadata.ticker,
            cik=document.metadata.cik,
            company_name=document.metadata.company_name,
            form_type=document.metadata.form_type,
            accession_number=document.metadata.accession_number,
            filed_at=document.metadata.filed_at,
            document_url=document.metadata.document_url,
            sentiment_label=analysis.sentiment_label,
            sentiment_score=analysis.sentiment_score,
            risk_score=analysis.risk_score,
            uncertainty_score=analysis.uncertainty_score,
            risk_level=analysis.risk_level,
            evidence=analysis.evidence,
            evidence_excerpts=analysis.evidence_excerpts,
            risk_categories=analysis.risk_categories,
            section_analyses=analysis.section_analyses,
            explanation=explanation,
        )
        return self.store.save(result)

    def analyze_risk_trend(
        self,
        ticker: str,
        form_types: list[FormType],
        limit: int,
    ) -> RiskTrendResponse:
        """Analyze recent filings and return lightweight chart points."""

        normalized_ticker = ticker.upper().strip()

        try:
            metadata_items = self.ingestor.get_recent_metadata(normalized_ticker, form_types, limit)
        except SECRateLimitError:
            return self._cached_trend_response(normalized_ticker, form_types, limit)

        points: list[RiskTrendPoint] = []

        for metadata in metadata_items:
            cached_point = self.store.get_trend_point(
                metadata.ticker,
                metadata.form_type,
                metadata.accession_number,
            )
            if cached_point:
                points.append(cached_point)
                continue

            try:
                document = self.ingestor.fetch_by_metadata(metadata)
            except SECRateLimitError:
                fallback = self._cached_trend_response(normalized_ticker, form_types, limit)
                if fallback.points:
                    return fallback
                raise

            analysis = self.analyzer.analyze(
                document.clean_text,
                max_excerpts=0,
                sections=document.sections,
            )
            point = RiskTrendPoint(
                ticker=metadata.ticker,
                company_name=metadata.company_name,
                form_type=metadata.form_type,
                accession_number=metadata.accession_number,
                filed_at=metadata.filed_at,
                document_url=metadata.document_url,
                risk_score=analysis.risk_score,
                risk_level=analysis.risk_level,
                sentiment_label=analysis.sentiment_label,
                uncertainty_score=analysis.uncertainty_score,
                top_driver=self._top_risk_driver(analysis.risk_categories),
            )
            points.append(self.store.save_trend_point(point))

        return self._trend_response(normalized_ticker, points)

    def _top_risk_driver(self, categories: list[RiskCategoryScore]) -> str | None:
        """Return the strongest non-zero risk category label for chart tooltips."""

        for category in categories:
            if category.score > 0:
                return category.label
        return None

    def _cached_trend_response(
        self,
        ticker: str,
        form_types: list[FormType],
        limit: int,
    ) -> RiskTrendResponse:
        """Return saved trend points during temporary SEC rate limits."""

        points = self.store.get_recent_trend_points(ticker, form_types, limit)
        return self._trend_response(ticker, points)

    def _trend_response(self, ticker: str, points: list[RiskTrendPoint]) -> RiskTrendResponse:
        """Return trend points in chronological order for the frontend chart."""

        points.sort(key=lambda point: point.filed_at)
        company_name = points[-1].company_name if points else None
        return RiskTrendResponse(
            ticker=ticker.upper().strip(),
            company_name=company_name,
            points=points,
        )
