"""Application-specific errors raised by the filing pipeline."""


class SECRateLimitError(RuntimeError):
    """Raised when SEC EDGAR temporarily throttles live requests."""
