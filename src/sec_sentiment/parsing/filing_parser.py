"""Simple HTML-to-text parser for SEC filing documents."""

import re

from bs4 import BeautifulSoup

from sec_sentiment.models import FilingSection

SECTION_PATTERNS: tuple[tuple[str, str, str], ...] = (
    ("item_1a", "Item 1A - Risk Factors", r"\bitem\s+1a\.?\s+risk\s+factors\b"),
    (
        "item_7",
        "Item 7 - Management Discussion and Analysis",
        r"\bitem\s+7\.?\s+management'?s\s+discussion\s+and\s+analysis\b",
    ),
    (
        "item_7a",
        "Item 7A - Market Risk",
        r"\bitem\s+7a\.?\s+quantitative\s+and\s+qualitative\s+disclosures\b",
    ),
    ("item_3d", "Item 3.D - Risk Factors", r"\bitem\s+3\.?d\.?\s+risk\s+factors\b"),
    (
        "item_5",
        "Item 5 - Operating and Financial Review",
        r"\bitem\s+5\.?\s+operating\s+and\s+financial\s+review\b",
    ),
    ("item_1_01", "Item 1.01 - Material Agreement", r"\bitem\s+1\.01\b"),
    ("item_2_02", "Item 2.02 - Results of Operations", r"\bitem\s+2\.02\b"),
    ("item_8_01", "Item 8.01 - Other Events", r"\bitem\s+8\.01\b"),
)


class FilingParser:
    """Converts SEC filing HTML into normalized plain text."""

    def clean_text(self, html_or_text: str) -> str:
        """Remove HTML noise and normalize whitespace."""

        soup = BeautifulSoup(html_or_text, "html.parser")
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()

        text = soup.get_text(separator=" ")
        text = text.replace("\xa0", " ")
        return re.sub(r"\s+", " ", text).strip()

    def extract_sections(self, clean_text: str) -> list[FilingSection]:
        """Extract major SEC sections from normalized filing text."""

        matches: list[tuple[int, int, str, str]] = []
        for key, title, pattern in SECTION_PATTERNS:
            for match in re.finditer(pattern, clean_text, flags=re.IGNORECASE):
                matches.append((match.start(), match.end(), key, title))

        if not matches:
            return []

        matches.sort(key=lambda item: item[0])
        best_sections: dict[str, FilingSection] = {}
        for index, (_start, end, key, title) in enumerate(matches):
            next_start = matches[index + 1][0] if index + 1 < len(matches) else len(clean_text)
            section_text = clean_text[end:next_start].strip()
            word_count = len(section_text.split())
            if word_count < 30:
                continue

            section = FilingSection(
                key=key,
                title=title,
                text=section_text,
                word_count=word_count,
            )
            current = best_sections.get(key)
            if current is None or section.word_count > current.word_count:
                best_sections[key] = section

        sections: list[FilingSection] = []
        for key, _, _ in SECTION_PATTERNS:
            existing_section = best_sections.get(key)
            if existing_section is not None:
                sections.append(existing_section)
        return sections
