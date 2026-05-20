"""Template and optional OpenAI explanations for filing analysis results."""

import json

from sec_sentiment.config import Settings
from sec_sentiment.models import FilingExplanation, FilingMetadata, TextAnalysis


class FilingExplainer:
    """Creates a plain-English explanation from grounded evidence."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def explain(
        self,
        filing: FilingMetadata,
        analysis: TextAnalysis,
    ) -> FilingExplanation | None:
        """Create an explanation using the configured provider."""

        if self.settings.explanation_provider == "none":
            return None
        if self.settings.explanation_provider == "openai":
            return self._openai_explanation(filing, analysis)
        return self._template_explanation(filing, analysis)

    def _template_explanation(
        self,
        filing: FilingMetadata,
        analysis: TextAnalysis,
    ) -> FilingExplanation:
        company = filing.company_name or filing.ticker
        terms = ", ".join(item.term for item in analysis.evidence[:8]) or "no strong signal terms"
        risk_terms = self._terms_for_category(analysis, "risk")
        uncertainty_terms = self._terms_for_category(analysis, "uncertainty")
        positive_terms = self._terms_for_category(analysis, "positive")
        negative_terms = self._terms_for_category(analysis, "negative")
        cited_ids = [item.id for item in analysis.evidence_excerpts[:4]]
        watch_items = [
            item.term
            for item in analysis.evidence
            if item.category in {"negative", "risk", "uncertainty"}
        ][:8]

        return FilingExplanation(
            provider="template",
            model=None,
            executive_summary=self._build_executive_summary(
                company=company,
                filing=filing,
                analysis=analysis,
                risk_terms=risk_terms,
                uncertainty_terms=uncertainty_terms,
                positive_terms=positive_terms,
                negative_terms=negative_terms,
            ),
            sentiment_explanation=(
                f"The sentiment score is {analysis.sentiment_score}. "
                f"The strongest matched terms are: {terms}."
            ),
            risk_explanation=(
                f"The risk score is {analysis.risk_score} and the uncertainty score is "
                f"{analysis.uncertainty_score}. Review the cited excerpts for the source language."
            ),
            key_drivers=[
                f"Evidence {item.id}: matched {', '.join(item.matched_terms)}."
                for item in analysis.evidence_excerpts[:4]
            ],
            cited_evidence_ids=cited_ids,
            watch_items=watch_items,
            limitations=[
                "This is an explainable baseline, not investment advice.",
                "Dictionary scoring is simple and should be improved with evaluation data.",
            ],
        )

    def _build_executive_summary(
        self,
        company: str,
        filing: FilingMetadata,
        analysis: TextAnalysis,
        risk_terms: list[str],
        uncertainty_terms: list[str],
        positive_terms: list[str],
        negative_terms: list[str],
    ) -> str:
        """Build a fuller template summary without inventing facts."""

        summary_parts = [
            (
                f"{company}'s {filing.form_type} filing from {filing.filed_at.isoformat()} "
                f"is scored as {analysis.sentiment_label} with {analysis.risk_level} risk."
            )
        ]

        if uncertainty_terms or risk_terms:
            summary_parts.append(
                "The main caution signals come from "
                f"uncertainty language such as {self._join_terms(uncertainty_terms)} "
                f"and risk language such as {self._join_terms(risk_terms)}."
            )

        if positive_terms or negative_terms:
            summary_parts.append(
                "Positive terms such as "
                f"{self._join_terms(positive_terms)} are balanced against negative terms such as "
                f"{self._join_terms(negative_terms)}, so the score should be read alongside the "
                "cited filing excerpts."
            )

        if analysis.risk_categories:
            top_category = analysis.risk_categories[0]
            summary_parts.append(
                f"The strongest risk category is {top_category.label.lower()} "
                f"with {top_category.evidence_count} matched signals."
            )

        if analysis.section_analyses:
            top_section = max(analysis.section_analyses, key=lambda item: item.risk_score)
            summary_parts.append(
                f"At section level, {top_section.title} has the highest risk density "
                f"at {top_section.risk_score} risk terms per 1,000 words."
            )

        return " ".join(summary_parts)

    def _terms_for_category(self, analysis: TextAnalysis, category: str) -> list[str]:
        """Return the strongest terms for one evidence category."""

        return [item.term for item in analysis.evidence if item.category == category][:3]

    def _join_terms(self, terms: list[str]) -> str:
        """Format term examples for human-readable explanations."""

        if not terms:
            return "no strong matched terms"
        if len(terms) == 1:
            return f"'{terms[0]}'"
        if len(terms) == 2:
            return f"'{terms[0]}' and '{terms[1]}'"
        return f"'{terms[0]}', '{terms[1]}', and '{terms[2]}'"

    def _openai_explanation(
        self,
        filing: FilingMetadata,
        analysis: TextAnalysis,
    ) -> FilingExplanation:
        if not self.settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is required when EXPLANATION_PROVIDER=openai")

        from openai import OpenAI

        prompt = {
            "filing": filing.model_dump(),
            "analysis": analysis.model_dump(),
        }
        client = OpenAI(api_key=self.settings.openai_api_key)
        response = client.responses.create(
            model=self.settings.openai_model,
            input=(
                "Explain this SEC filing analysis in plain English. Use only the supplied "
                "scores and evidence excerpts. Do not predict stock prices.\n\n"
                f"{json.dumps(prompt, indent=2, default=str)}"
            ),
        )

        return FilingExplanation(
            provider="openai",
            model=self.settings.openai_model,
            executive_summary=response.output_text,
            sentiment_explanation="Generated by the LLM from supplied evidence excerpts.",
            risk_explanation="Generated by the LLM from supplied evidence excerpts.",
            key_drivers=[f"Evidence {item.id}" for item in analysis.evidence_excerpts[:4]],
            cited_evidence_ids=[item.id for item in analysis.evidence_excerpts[:4]],
            watch_items=[item.term for item in analysis.evidence[:8]],
            limitations=[
                "LLM output should be reviewed against the cited excerpts.",
                "This is not investment advice.",
            ],
        )
