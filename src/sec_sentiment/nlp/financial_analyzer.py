"""Readable finance-specific sentiment and risk analyzer."""

from __future__ import annotations

import re
from collections import Counter

from sec_sentiment.models import (
    EvidenceCategory,
    EvidenceExcerpt,
    EvidenceTerm,
    FilingSection,
    RiskCategory,
    RiskCategoryScore,
    RiskLevel,
    SectionAnalysis,
    SentimentLabel,
    TextAnalysis,
)

POSITIVE_TERMS = {
    "benefit",
    "favorable",
    "gain",
    "growth",
    "improve",
    "improved",
    "increase",
    "increased",
    "opportunity",
    "profit",
    "profitable",
    "strong",
    "successful",
}

NEGATIVE_TERMS = {
    "adverse",
    "challenging",
    "decline",
    "declined",
    "decrease",
    "decreased",
    "difficult",
    "impairment",
    "loss",
    "negative",
    "restructuring",
    "shortfall",
    "slowdown",
    "weak",
    "weakness",
}

RISK_TERMS = {
    "bankruptcy",
    "breach",
    "default",
    "disruption",
    "fraud",
    "investigation",
    "litigation",
    "material weakness",
    "penalty",
    "regulatory",
    "risk",
    "risks",
    "substantial doubt",
    "violation",
    "volatility",
}

UNCERTAINTY_TERMS = {
    "approximately",
    "believe",
    "could",
    "estimate",
    "expect",
    "may",
    "might",
    "possible",
    "potential",
    "subject to",
    "uncertain",
    "uncertainty",
    "would",
}

RISK_CATEGORY_LABELS: dict[RiskCategory, str] = {
    "litigation": "Litigation Risk",
    "regulatory": "Regulatory Risk",
    "liquidity": "Liquidity Risk",
    "market": "Market Risk",
    "cybersecurity": "Cybersecurity Risk",
    "operational": "Operational Risk",
}

RISK_CATEGORY_TERMS: dict[RiskCategory, set[str]] = {
    "litigation": {
        "claim",
        "claims",
        "class action",
        "lawsuit",
        "legal",
        "litigation",
        "proceeding",
        "settlement",
    },
    "regulatory": {
        "compliance",
        "investigation",
        "regulation",
        "regulations",
        "regulatory",
        "sanction",
        "violation",
    },
    "liquidity": {
        "cash flow",
        "credit facility",
        "debt",
        "default",
        "liquidity",
        "refinance",
        "working capital",
    },
    "market": {
        "competition",
        "competitive",
        "demand",
        "foreign exchange",
        "inflation",
        "interest rate",
        "market",
        "pricing",
        "volatility",
    },
    "cybersecurity": {
        "breach",
        "cyber",
        "cybersecurity",
        "data security",
        "privacy",
        "ransomware",
        "security incident",
    },
    "operational": {
        "disruption",
        "failure",
        "outage",
        "shortage",
        "supply chain",
        "third party",
    },
}


class FinancialTextAnalyzer:
    """Scores filing text and extracts explainable evidence."""

    token_pattern = re.compile(r"\b[a-z][a-z-]*\b")
    sentence_pattern = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9])")

    def analyze(
        self,
        text: str,
        max_excerpts: int = 8,
        sections: list[FilingSection] | None = None,
    ) -> TextAnalysis:
        """Return sentiment, risk, uncertainty, and evidence for filing text."""

        normalized_text = text.lower()
        tokens = self.token_pattern.findall(normalized_text)
        token_counts = Counter(tokens)
        token_total = max(len(tokens), 1)

        positive = self._count_terms(normalized_text, token_counts, POSITIVE_TERMS)
        negative = self._count_terms(normalized_text, token_counts, NEGATIVE_TERMS)
        risk = self._count_terms(normalized_text, token_counts, RISK_TERMS)
        uncertainty = self._count_terms(normalized_text, token_counts, UNCERTAINTY_TERMS)

        positive_total = sum(positive.values())
        negative_total = sum(negative.values())
        risk_total = sum(risk.values())
        uncertainty_total = sum(uncertainty.values())

        sentiment_score = self._sentiment_score(positive_total, negative_total)
        risk_score = round((risk_total / token_total) * 1000, 4)
        uncertainty_score = round((uncertainty_total / token_total) * 1000, 4)
        evidence = self._build_evidence(positive, negative, risk, uncertainty)

        return TextAnalysis(
            sentiment_label=self._sentiment_label(
                sentiment_score,
                positive_total,
                negative_total,
            ),
            sentiment_score=sentiment_score,
            risk_level=self._risk_level(risk_score),
            risk_score=risk_score,
            uncertainty_score=uncertainty_score,
            evidence=evidence,
            evidence_excerpts=self._extract_excerpts(
                text,
                evidence,
                max_excerpts,
                sections or [],
            ),
            risk_categories=self._risk_category_scores(normalized_text, token_counts, token_total),
            section_analyses=self._section_analyses(sections or []),
        )

    def _count_terms(
        self,
        text: str,
        token_counts: Counter[str],
        terms: set[str],
    ) -> Counter[str]:
        counts: Counter[str] = Counter()
        for term in terms:
            counts[term] = text.count(term) if " " in term else token_counts[term]
        return Counter({term: count for term, count in counts.items() if count > 0})

    def _sentiment_score(self, positive_total: int, negative_total: int) -> float:
        total = positive_total + negative_total
        if total == 0:
            return 0.0
        return round((positive_total - negative_total) / total, 4)

    def _sentiment_label(
        self,
        score: float,
        positive_total: int,
        negative_total: int,
    ) -> SentimentLabel:
        if positive_total >= 3 and negative_total >= 3 and abs(score) < 0.25:
            return "mixed"
        if score >= 0.15:
            return "positive"
        if score <= -0.15:
            return "negative"
        return "neutral"

    def _risk_level(self, risk_score: float) -> RiskLevel:
        if risk_score >= 12:
            return "high"
        if risk_score >= 5:
            return "medium"
        return "low"

    def _category_risk_level(self, score: float) -> RiskLevel:
        if score >= 2:
            return "high"
        if score >= 0.6:
            return "medium"
        return "low"

    def _build_evidence(
        self,
        positive: Counter[str],
        negative: Counter[str],
        risk: Counter[str],
        uncertainty: Counter[str],
    ) -> list[EvidenceTerm]:
        evidence: list[EvidenceTerm] = []
        category_counts: list[tuple[EvidenceCategory, Counter[str]]] = [
            ("positive", positive),
            ("negative", negative),
            ("risk", risk),
            ("uncertainty", uncertainty),
        ]
        for category, counts in category_counts:
            for term, count in counts.most_common(5):
                evidence.append(EvidenceTerm(term=term, category=category, count=count))
        return sorted(evidence, key=lambda item: item.count, reverse=True)[:20]

    def _risk_category_scores(
        self,
        text: str,
        token_counts: Counter[str],
        token_total: int,
    ) -> list[RiskCategoryScore]:
        category_scores: list[RiskCategoryScore] = []
        for category, terms in RISK_CATEGORY_TERMS.items():
            counts = self._count_terms(text, token_counts, terms)
            evidence_count = sum(counts.values())
            score = round((evidence_count / token_total) * 1000, 4)
            category_scores.append(
                RiskCategoryScore(
                    category=category,
                    label=RISK_CATEGORY_LABELS[category],
                    score=score,
                    level=self._category_risk_level(score),
                    matched_terms=[term for term, _ in counts.most_common(5)],
                    evidence_count=evidence_count,
                )
            )

        return sorted(category_scores, key=lambda item: item.score, reverse=True)

    def _section_analyses(self, sections: list[FilingSection]) -> list[SectionAnalysis]:
        analyses: list[SectionAnalysis] = []
        for section in sections[:6]:
            normalized_text = section.text.lower()
            tokens = self.token_pattern.findall(normalized_text)
            token_counts = Counter(tokens)
            token_total = max(len(tokens), 1)
            risk = self._count_terms(normalized_text, token_counts, RISK_TERMS)
            uncertainty = self._count_terms(normalized_text, token_counts, UNCERTAINTY_TERMS)
            risk_total = sum(risk.values())
            uncertainty_total = sum(uncertainty.values())
            risk_score = round((risk_total / token_total) * 1000, 4)
            uncertainty_score = round((uncertainty_total / token_total) * 1000, 4)
            top_terms = [
                term
                for term, _ in (risk + uncertainty).most_common(5)
            ]

            analyses.append(
                SectionAnalysis(
                    section_key=section.key,
                    title=section.title,
                    word_count=section.word_count,
                    risk_score=risk_score,
                    uncertainty_score=uncertainty_score,
                    risk_level=self._risk_level(risk_score),
                    top_terms=top_terms,
                )
            )

        return analyses

    def _extract_excerpts(
        self,
        text: str,
        evidence: list[EvidenceTerm],
        max_excerpts: int,
        sections: list[FilingSection],
    ) -> list[EvidenceExcerpt]:
        terms = [item.term.lower() for item in evidence]
        if not terms or max_excerpts <= 0:
            return []

        candidates = self._excerpt_candidates_from_sections(sections, terms)
        if not candidates:
            candidates = self._excerpt_candidates(text, terms, None, None)

        candidates.sort(key=lambda item: item[0], reverse=True)
        return [
            EvidenceExcerpt(
                id=index,
                excerpt=sentence[:700],
                matched_terms=matched_terms,
                relevance_score=round(relevance, 4),
                source_section_key=source_section_key,
                source_section_title=source_section_title,
            )
            for index, (
                relevance,
                sentence,
                matched_terms,
                source_section_key,
                source_section_title,
            ) in enumerate(
                candidates[:max_excerpts],
                start=1,
            )
        ]

    def _excerpt_candidates_from_sections(
        self,
        sections: list[FilingSection],
        terms: list[str],
    ) -> list[tuple[float, str, list[str], str | None, str | None]]:
        candidates: list[tuple[float, str, list[str], str | None, str | None]] = []
        for section in sections:
            candidates.extend(
                self._excerpt_candidates(
                    section.text,
                    terms,
                    section.key,
                    section.title,
                )
            )
        return candidates

    def _excerpt_candidates(
        self,
        text: str,
        terms: list[str],
        source_section_key: str | None,
        source_section_title: str | None,
    ) -> list[tuple[float, str, list[str], str | None, str | None]]:
        candidates: list[tuple[float, str, list[str], str | None, str | None]] = []
        for sentence in self.sentence_pattern.split(text):
            sentence = sentence.strip()
            if len(sentence) < 40 or len(sentence) > 1000:
                continue

            matched_terms = sorted({term for term in terms if self._term_in_sentence(term, sentence)})
            if not matched_terms:
                continue

            relevance = len(matched_terms) + min(len(sentence) / 500, 1)
            candidates.append(
                (
                    relevance,
                    sentence,
                    matched_terms,
                    source_section_key,
                    source_section_title,
                )
            )

        return candidates

    def _term_in_sentence(self, term: str, sentence: str) -> bool:
        sentence = sentence.lower()
        if " " in term:
            return term in sentence
        return re.search(rf"\b{re.escape(term)}\b", sentence) is not None
