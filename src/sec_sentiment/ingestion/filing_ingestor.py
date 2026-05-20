"""Fetches and prepares SEC filing documents for analysis."""

from sec_sentiment.clients import SECClient
from sec_sentiment.models import FilingDocument, FilingMetadata, FormType
from sec_sentiment.parsing import FilingParser


class FilingIngestor:
    """Downloads the latest filing and cleans its text."""

    def __init__(self, sec_client: SECClient, parser: FilingParser, max_chars: int) -> None:
        self.sec_client = sec_client
        self.parser = parser
        self.max_chars = max_chars

    def fetch_latest(self, ticker: str, form_type: FormType) -> FilingDocument:
        """Fetch, parse, and return the latest matching filing."""

        metadata = self.sec_client.get_latest_filing(ticker, form_type)
        return self.fetch_by_metadata(metadata)

    def fetch_recent(
        self,
        ticker: str,
        form_types: list[FormType],
        limit: int,
    ) -> list[FilingDocument]:
        """Fetch, parse, and return recent matching filings."""

        metadata_items = self.sec_client.get_recent_filings(ticker, form_types, limit)
        return [self.fetch_by_metadata(metadata) for metadata in metadata_items]

    def fetch_by_metadata(self, metadata: FilingMetadata) -> FilingDocument:
        """Fetch and parse one filing already identified by metadata."""

        raw_text = self.sec_client.download_filing(metadata)
        clean_text = self.parser.clean_text(raw_text)[: self.max_chars]
        sections = self.parser.extract_sections(clean_text)

        return FilingDocument(
            metadata=metadata,
            raw_text=raw_text,
            clean_text=clean_text,
            sections=sections,
        )
