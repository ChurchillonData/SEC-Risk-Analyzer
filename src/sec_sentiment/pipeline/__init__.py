"""Application pipeline that coordinates SEC ingestion, NLP, LLM, and storage."""

from sec_sentiment.pipeline.analysis_service import FilingAnalysisService

__all__ = ["FilingAnalysisService"]
