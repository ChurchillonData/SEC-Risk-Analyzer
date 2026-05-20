"""Small SEC EDGAR client for public company filing data."""

from __future__ import annotations

import time
from datetime import date
from typing import Any, cast

import httpx

from sec_sentiment.config import Settings
from sec_sentiment.models import FilingMetadata, FormType


class SECClient:
    """Fetches company metadata and filing documents from SEC EDGAR."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._last_request_at = 0.0
        self._ticker_cache: dict[str, Any] | None = None
        self._client = httpx.Client(
            timeout=settings.request_timeout_seconds,
            follow_redirects=True,
            headers={
                "User-Agent": settings.sec_user_agent,
                "Accept": "application/json,text/html,text/plain,*/*",
            },
        )

    def get_latest_filing(self, ticker: str, form_type: FormType) -> FilingMetadata:
        """Return metadata for the latest matching filing."""

        filings = self.get_recent_filings(ticker, [form_type], limit=1)
        if filings:
            return filings[0]

        raise ValueError(f"No {form_type} filing found for {ticker.upper()}")

    def get_recent_filings(
        self,
        ticker: str,
        form_types: list[FormType],
        limit: int,
    ) -> list[FilingMetadata]:
        """Return recent filing metadata for one ticker and a small set of forms."""

        cik, company_name = self.get_cik_for_ticker(ticker)
        submissions = self._get_json(
            f"{self.settings.sec_data_base_url}/submissions/CIK{int(cik):010d}.json"
        )
        recent = submissions.get("filings", {}).get("recent", {})
        requested_forms = set(form_types)
        filings: list[FilingMetadata] = []

        for index, form in enumerate(recent.get("form", [])):
            if form not in requested_forms:
                continue

            accession_number = recent["accessionNumber"][index]
            primary_document = recent["primaryDocument"][index]
            document_url = self.build_document_url(cik, accession_number, primary_document)

            filings.append(
                FilingMetadata(
                    ticker=ticker.upper().strip(),
                    cik=cik,
                    company_name=company_name,
                    form_type=cast(FormType, form),
                    accession_number=accession_number,
                    filed_at=date.fromisoformat(recent["filingDate"][index]),
                    primary_document=primary_document,
                    document_url=document_url,
                )
            )

            if len(filings) >= limit:
                return filings

        forms = ", ".join(form_types)
        raise ValueError(f"No recent {forms} filings found for {ticker.upper()}")

    def get_cik_for_ticker(self, ticker: str) -> tuple[str, str | None]:
        """Resolve a stock ticker to an SEC CIK identifier."""

        normalized_ticker = ticker.upper().strip()
        companies = self._get_company_tickers()

        for company in companies.values():
            if company["ticker"].upper() == normalized_ticker:
                return str(company["cik_str"]), company.get("title")

        raise ValueError(f"No SEC company found for ticker {normalized_ticker}")

    def download_filing(self, filing: FilingMetadata) -> str:
        """Download the raw filing document text or HTML."""

        return self._get_text(filing.document_url)

    def build_document_url(self, cik: str, accession_number: str, primary_document: str) -> str:
        """Build the SEC archive URL for a primary filing document."""

        cik_without_padding = str(int(cik))
        accession_without_dashes = accession_number.replace("-", "")
        return (
            f"{self.settings.sec_www_base_url}/Archives/edgar/data/"
            f"{cik_without_padding}/{accession_without_dashes}/{primary_document}"
        )

    def _get_company_tickers(self) -> dict[str, Any]:
        if self._ticker_cache is None:
            self._ticker_cache = self._get_json(
                f"{self.settings.sec_www_base_url}/files/company_tickers.json"
            )
        return self._ticker_cache

    def _get_json(self, url: str) -> dict[str, Any]:
        response = self._request(url)
        data = response.json()
        if not isinstance(data, dict):
            raise RuntimeError(f"Expected SEC JSON object from {url}")
        return data

    def _get_text(self, url: str) -> str:
        return self._request(url).text

    def _request(self, url: str) -> httpx.Response:
        self._wait_between_sec_requests()
        response = self._client.get(url)

        if response.status_code == 404:
            raise ValueError(f"SEC resource not found: {url}")
        if response.status_code == 429:
            raise RuntimeError("SEC rate limit reached. Wait and try again.")

        response.raise_for_status()
        return response

    def _wait_between_sec_requests(self) -> None:
        elapsed = time.monotonic() - self._last_request_at
        wait_time = self.settings.min_sec_request_interval_seconds - elapsed
        if wait_time > 0:
            time.sleep(wait_time)
        self._last_request_at = time.monotonic()
