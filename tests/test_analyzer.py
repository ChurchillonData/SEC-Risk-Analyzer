from sec_sentiment.nlp import FinancialTextAnalyzer
from sec_sentiment.parsing import FilingParser


def test_clean_text_removes_script_and_normalizes_spacing() -> None:
    parser = FilingParser()

    text = parser.clean_text(
        """
        <html>
          <script>ignored()</script>
          <body>Revenue&nbsp;increased during the quarter.</body>
        </html>
        """
    )

    assert "ignored" not in text
    assert text == "Revenue increased during the quarter."


def test_extract_sections_finds_major_10k_sections() -> None:
    parser = FilingParser()
    text = parser.clean_text(
        """
        Item 1A. Risk Factors
        Litigation risk and regulatory risk could affect the company.
        This risk factor text has enough repeated language to look like a real section.
        It includes operational disruption, liquidity pressure, market volatility, and
        cybersecurity incidents that may affect operations in future periods.
        These words are included so the section passes the minimum section length check.
        The company may face additional claims, investigations, defaults, outages,
        pricing pressure, foreign exchange volatility, and supply chain disruption.
        Item 7. Management's Discussion and Analysis
        Revenue increased but management believes market conditions could remain uncertain.
        This management discussion section also has enough words to be extracted cleanly.
        It discusses operations, demand, liquidity, and cash flow in plain language.
        """
    )

    sections = parser.extract_sections(text)

    assert [section.key for section in sections] == ["item_1a", "item_7"]
    assert sections[0].title == "Item 1A - Risk Factors"


def test_score_detects_risk_and_uncertainty() -> None:
    analyzer = FinancialTextAnalyzer()

    analysis = analyzer.analyze(
        "The company faces litigation risk, regulatory uncertainty, volatility, and default risk."
    )

    assert analysis.risk_level in {"medium", "high"}
    assert analysis.risk_score > 0
    assert analysis.uncertainty_score > 0
    assert any(item.category == "risk" for item in analysis.evidence)
    assert analysis.risk_categories
    assert analysis.risk_categories[0].score > 0


def test_extract_excerpts_returns_supporting_sentences() -> None:
    analyzer = FinancialTextAnalyzer()
    text = (
        "Revenue increased during the period and margins improved. "
        "The company faces litigation risk and regulatory uncertainty that could affect "
        "future operations."
    )

    analysis = analyzer.analyze(text)

    assert analysis.evidence_excerpts
    assert "litigation risk" in analysis.evidence_excerpts[0].excerpt


def test_section_analysis_scores_extracted_sections() -> None:
    parser = FilingParser()
    analyzer = FinancialTextAnalyzer()
    text = parser.clean_text(
        """
        Item 1A. Risk Factors
        The company faces litigation risk, regulatory uncertainty, cybersecurity breach risk,
        market volatility, liquidity pressure, debt default risk, operational disruption, and
        supply chain failures that could affect future operations. These risks may increase
        costs, reduce demand, and create legal claims or investigations over time. Additional
        wording is included to make this section long enough for extraction and scoring.
        Item 7. Management's Discussion and Analysis
        Revenue increased and margins improved, but management believes uncertainty could
        remain elevated because demand and pricing may change in future periods. Additional
        wording is included to make this section long enough for extraction and scoring.
        """
    )
    sections = parser.extract_sections(text)

    analysis = analyzer.analyze(text, sections=sections)

    assert analysis.section_analyses
    assert analysis.section_analyses[0].section_key == "item_1a"
    assert analysis.section_analyses[0].risk_score > 0


def test_excerpts_include_source_section_when_available() -> None:
    parser = FilingParser()
    analyzer = FinancialTextAnalyzer()
    text = parser.clean_text(
        """
        Item 1A. Risk Factors
        The company faces litigation risk, regulatory uncertainty, cybersecurity breach risk,
        market volatility, liquidity pressure, debt default risk, operational disruption, and
        supply chain failures that could affect future operations. Additional wording is included
        so this section is long enough to be extracted and cited by the evidence engine.
        Item 7. Management's Discussion and Analysis
        Revenue increased and margins improved, but demand could change in future periods.
        Additional wording is included so this section is long enough for extraction.
        """
    )
    sections = parser.extract_sections(text)

    analysis = analyzer.analyze(text, sections=sections)

    assert analysis.evidence_excerpts
    assert analysis.evidence_excerpts[0].source_section_key == "item_1a"
    assert analysis.evidence_excerpts[0].source_section_title == "Item 1A - Risk Factors"
