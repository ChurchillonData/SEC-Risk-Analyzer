import { Clock } from "lucide-react";
import { COMPANIES } from "../data/companies";
import type { RecentAnalysis, RiskLevel, SentimentLabel } from "../types";
import { formatDate, formatDateTime } from "../utils/format";
import { CountryBadge, Logo } from "./Logo";
import { riskCopy } from "./AnalysisDashboard";

const sentimentCopy: Record<SentimentLabel, string> = {
  positive: "Positive",
  negative: "Negative",
  neutral: "Neutral",
  mixed: "Mixed"
};

export function RecentAnalysesTable({ rows }: { rows: RecentAnalysis[] }) {
  return (
    <section className="recent-panel">
      <div className="recent-heading">
        <Clock size={17} />
        <h2>Recent Analyses</h2>
      </div>
      {rows.length > 0 ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Filing</th>
                <th>Filed date</th>
                <th>Sentiment</th>
                <th>Risk</th>
                <th>Analyzed time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <RecentCompanyCell row={row} />
                  </td>
                  <td>{row.formType}</td>
                  <td>{formatDate(row.filedAt)}</td>
                  <td>
                    <StatusPill tone={row.sentiment}>{sentimentCopy[row.sentiment]}</StatusPill>
                  </td>
                  <td>
                    <StatusPill tone={row.riskLevel}>{riskCopy[row.riskLevel]}</StatusPill>
                  </td>
                  <td>{formatDateTime(row.analyzedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="recent-empty">
          Run an analysis and it will appear here during this browser session.
        </p>
      )}
    </section>
  );
}

function RecentCompanyCell({ row }: { row: RecentAnalysis }) {
  const company = COMPANIES.find((option) => option.ticker === row.ticker);

  return (
    <div className="recent-company-cell">
      {company ? (
        <Logo company={company} />
      ) : (
        <span className="company-logo">{row.ticker.slice(0, 1)}</span>
      )}
      <span>
        <strong>{row.companyName}</strong>
        <small>{row.ticker}</small>
        {company ? <CountryBadge company={company} /> : null}
      </span>
    </div>
  );
}

function StatusPill({
  children,
  tone
}: {
  children: React.ReactNode;
  tone: SentimentLabel | RiskLevel;
}) {
  return <span className={`status-pill tone-${tone}`}>{children}</span>;
}
