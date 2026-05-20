# SEC Sentiment Frontend

React + TypeScript interface for the SEC Filing Sentiment & Risk Analyzer.

## Local Development

```bash
npm install
npm run dev
```

Set the API URL in `.env`:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8010
```

## Structure

```text
src/
|-- api/          # backend fetch client
|-- components/   # readable React UI sections
|-- data/         # curated company selector data
|-- utils/        # small formatting/highlight helpers
|-- App.tsx       # page orchestration
`-- types.ts      # frontend response types
```
