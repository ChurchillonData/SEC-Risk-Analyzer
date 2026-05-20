# Project Decisions

This file records the main engineering and product decisions for the SEC Filing Sentiment & Risk Analyzer.

It helps future readers understand why the project is built this way, what tradeoffs were made, and what should not be changed casually.

## 1. Use SEC Filings Instead Of Earnings Call Transcripts

**Decision:** Use public SEC filings such as `8-K`, `10-Q`, and `10-K` as the primary data source.

**Why:** Earnings call transcripts are often paywalled or restricted by licensing. SEC filings are public, official, reliable, and accessible without buying a dataset.

**Tradeoff:** SEC filings are more formal and legal than earnings calls, so the language can be harder to interpret. That is acceptable because the data access path is much cleaner.

## 2. Fetch SEC Data Live

**Decision:** The app fetches filings live from SEC EDGAR instead of requiring users to manually download documents.

**Why:** This keeps the project easy to run. A user only needs to enter a ticker and form type.

**Tradeoff:** The app depends on SEC availability and must respect SEC request limits. Raw filing caching can be added later if needed.

## 3. Store Analysis Results In SQLite

**Decision:** SQLite stores the final analysis result, not the raw SEC filing documents.

**Why:** SQLite proves the project has a real persistence layer while keeping setup simple. It avoids requiring Postgres or cloud infrastructure.

**Stored Data Includes:**

- ticker
- form type
- accession number
- filing date
- full analysis JSON
- analysis timestamp

**Tradeoff:** SQLite is not ideal for multi-user production scale, but it is perfect for a focused MVP and GitHub portfolio project.

## 4. Keep A Minimal Layered Backend

**Decision:** Keep professional backend folders such as `api`, `clients`, `ingestion`, `nlp`, `llm`, `pipeline`, and `storage`, but keep each folder small.

**Why:** The structure shows production thinking without creating unnecessary complexity. A beginner-to-mid-level developer should be able to follow the project quickly.

**Rule:** Do not add a new file or abstraction unless it makes the project easier to understand or maintain.

## 5. Use FastAPI For The Backend

**Decision:** Use FastAPI for the API layer.

**Why:** FastAPI is simple, typed, well-documented, and works naturally with Pydantic models. It is a good fit for a Python NLP service.

## 6. Use React For The Frontend

**Decision:** Put the frontend in a separate `frontend/` folder using React and TypeScript.

**Why:** This keeps frontend and backend concerns separate while still making the app feel like a real product instead of only a script or notebook.

**UI Choice:** The frontend uses a searchable company selector with company name, ticker, exchange, sector, and logo. Logos are loaded from company domains through a public logo service in the browser. If a logo fails to load, the UI falls back to the company ticker initial.

**Company Coverage:** The selector includes 100 companies. It mixes major U.S. companies with UK, European, energy, pharmaceutical, insurance, fintech, software, media, restaurants, apparel, industrial, banking, logistics, and global companies that have U.S.-listed securities or SEC filing access. UK/global companies often file `6-K` and `20-F` rather than `8-K`, `10-Q`, and `10-K`, so the frontend changes available form options based on the selected company.

## 7. Start With Explainable Dictionary-Based NLP

**Decision:** Use finance-focused word lists for the first sentiment, risk, and uncertainty scoring model.

**Why:** It is easy to understand, test, explain, and improve. It gives a clear baseline before adding more advanced ML models.

**Score Benchmark:** Risk and uncertainty scores are language-density scores, not `0-1` probabilities.

```text
score = matched term count / total words * 1,000
```

A risk score of `6.00` means about six matched risk terms per 1,000 words. Uncertainty uses the same calculation with uncertainty terms.

**Risk Level Thresholds:**

- low: below 5 risk terms per 1,000 words
- medium: 5 to below 12 risk terms per 1,000 words
- high: 12 or more risk terms per 1,000 words

**Tradeoff:** Dictionary scoring is not as accurate as a trained finance model. It may miss context, sarcasm, or complex financial meaning.

## 8. Add Section-Aware And Category-Aware Risk Scoring

**Decision:** Extract important filing sections when possible and score focused risk categories.

**Why:** A whole-document score is useful but too broad. Section-level signals show where risk language appears, and category scores make the analysis easier to explain.

**Current Categories:**

- litigation risk
- regulatory risk
- liquidity risk
- market risk
- cybersecurity risk
- operational risk

**Tradeoff:** The first version uses transparent term matching rather than a trained model. This keeps the project understandable and easy to maintain.

## 9. Add Evidence Excerpts

**Decision:** Return short filing excerpts that support the score.

**Why:** A score alone is not enough. Users need to see the language that influenced the result.

**Tradeoff:** Excerpt extraction is simple and should be evaluated with more filings over time.

## 10. Make The LLM Optional

**Decision:** The app works without an LLM by using a template explanation. OpenAI can be enabled with environment variables.

**Why:** The project should run without paid API access. The optional LLM adds richer explanations but should not be required.

**Rule:** The LLM should explain from supplied scores and evidence excerpts. It should not invent outside facts or predict stock prices.

## 11. Include Docker And CI

**Decision:** Keep Docker, Docker Compose, and GitHub Actions CI.

**Why:** These show that the project can be shipped and tested consistently.

**Tradeoff:** They add a few files, but those files are standard for a serious GitHub project and worth keeping.

## Future Decisions To Revisit

- Whether to cache raw filings in `data/filings/`.
- Whether to add FOMC statement analysis.
- Whether to add a FinBERT or fine-tuned finance model.
- Whether to move from SQLite to Postgres.
- Whether to add frontend end-to-end tests.
