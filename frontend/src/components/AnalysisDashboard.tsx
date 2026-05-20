import {
  CheckCircle,
  ExternalLink,
  FileText,
  HelpCircle,
  Shield,
  Smile
} from "lucide-react";
import { Fragment, type ReactNode, useState } from "react";
import type { CompanyOption } from "../data/companies";
import type {
  AnalysisResult,
  EvidenceCategory,
  EvidenceExcerpt,
  EvidenceTerm,
  RiskCategoryScore,
  RiskLevel,
  RiskTrendResponse,
  SectionAnalysis,
  SentimentLabel
} from "../types";
import { formatDate, formatSigned } from "../utils/format";
import { emphasizeTerms, highlightTerms } from "../utils/highlight";
import { CountryBadge, Logo } from "./Logo";
import { RiskTrendChart } from "./RiskTrendChart";

const sentimentCopy: Record<SentimentLabel, string> = {
  positive: "Positive",
  negative: "Negative",
  neutral: "Neutral",
  mixed: "Mixed"
};

export const riskCopy: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High"
};

const categoryCopy: Record<EvidenceCategory, string> = {
  positive: "Positive",
  negative: "Negative",
  risk: "Risk",
  uncertainty: "Uncertainty"
};

const categoryOrder: EvidenceCategory[] = ["risk", "uncertainty", "positive", "negative"];

export function AnalysisDashboard({
  company,
  isTrendLoading,
  result,
  trend,
  trendError
}: {
  company: CompanyOption;
  isTrendLoading: boolean;
  result: AnalysisResult;
  trend: RiskTrendResponse | null;
  trendError: string | null;
}) {
  const [showAllExcerpts, setShowAllExcerpts] = useState(false);
  const displayedExcerpts = showAllExcerpts
    ? result.evidence_excerpts
    : result.evidence_excerpts.slice(0, 3);
  const groupedTerms = groupEvidenceTerms(result.evidence);

  return (
    <article className="analysis-card">
      <header className="result-header">
        <div className="result-company">
          <Logo company={company} size="large" />
          <div>
            <div className="company-title-row">
              <h1>{result.company_name ?? company.name}</h1>
              <span>{result.ticker}</span>
            </div>
            <p className="filing-meta">
              <span>Filed: {formatDate(result.filed_at)}</span>
              <CountryBadge company={company} />
              {result.document_url ? (
                <a href={result.document_url} rel="noreferrer" target="_blank">
                  SEC Filing
                  <ExternalLink size={14} />
                </a>
              ) : null}
            </p>
          </div>
        </div>
      </header>

      <section className="metric-grid" aria-label="Analysis metrics">
        <MetricCard
          icon={<Smile size={23} />}
          label="Sentiment"
          metric={formatSigned(result.sentiment_score)}
          tone={result.sentiment_label}
          value={sentimentCopy[result.sentiment_label]}
        />
        <MetricCard
          icon={<Shield size={23} />}
          label="Risk Level"
          metric={`${result.risk_score.toFixed(2)} per 1k words`}
          tone={result.risk_level}
          value={riskCopy[result.risk_level]}
        />
        <MetricCard
          icon={<HelpCircle size={23} />}
          label="Uncertainty"
          metric="per 1k words"
          tone="uncertainty"
          value={result.uncertainty_score.toFixed(2)}
        />
      </section>

      <ExecutiveSummary result={result} />

      <RiskTrendChart error={trendError} isLoading={isTrendLoading} trend={trend} />

      <RiskFrameworkPanel result={result} />

      <section className="insight-grid">
        <section className="excerpts-panel">
          <div className="panel-title-row">
            <h2>Cited Excerpts</h2>
            <span>{result.evidence_excerpts.length} found</span>
          </div>
          <div className="excerpt-list">
            {displayedExcerpts.map((excerpt) => (
              <EvidenceExcerptCard
                documentUrl={result.document_url}
                excerpt={excerpt}
                key={excerpt.id}
              />
            ))}
          </div>
          {result.evidence_excerpts.length > 3 ? (
            <button
              className="show-more-button"
              onClick={() => setShowAllExcerpts((currentValue) => !currentValue)}
              type="button"
            >
              {showAllExcerpts ? "Show fewer excerpts" : "Show all excerpts"}
            </button>
          ) : null}
        </section>
        <EvidenceTermsPanel groupedTerms={groupedTerms} />
      </section>
    </article>
  );
}

export function EmptyState({
  selectedCompany,
  formType
}: {
  selectedCompany: CompanyOption;
  formType: string;
}) {
  return (
    <section className="empty-state">
      <div className="empty-icon">
        <FileText size={30} />
      </div>
      <h1>Ready to analyze {selectedCompany.ticker}</h1>
      <p>
        Run the latest {formType} filing to see sentiment, risk, uncertainty, signal terms,
        and cited excerpts from the SEC document.
      </p>
    </section>
  );
}

export function AnalysisSkeleton() {
  return (
    <section className="analysis-card skeleton-card" aria-label="Loading analysis">
      <div className="analysis-loading-copy">
        <strong>Fetching live SEC filing data...</strong>
        <p>
          EDGAR RiskLens is downloading the filing, parsing risk sections, and building cited
          evidence from the source document.
        </p>
      </div>
      <div className="loading-steps" aria-label="Analysis progress">
        <span>SEC fetch</span>
        <span>Section parsing</span>
        <span>Evidence scoring</span>
      </div>
      <div className="metric-grid">
        <div className="skeleton-block" />
        <div className="skeleton-block" />
        <div className="skeleton-block" />
      </div>
      <div className="skeleton-summary" />
      <div className="insight-grid">
        <div className="skeleton-panel" />
        <div className="skeleton-panel" />
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  metric,
  tone,
  value
}: {
  icon: ReactNode;
  label: string;
  metric: string;
  tone: SentimentLabel | RiskLevel | "uncertainty";
  value: string;
}) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <span className="metric-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{metric}</small>
      </div>
    </article>
  );
}

function ExecutiveSummary({ result }: { result: AnalysisResult }) {
  const explanation = result.explanation;
  const importantTerms = importantSummaryTerms(result);

  if (!explanation) {
    return (
      <section className="summary-box">
        <div className="summary-heading">
          <CheckCircle size={18} />
          <h2>Executive Summary</h2>
        </div>
        <p>No explanation returned for this filing.</p>
      </section>
    );
  }

  return (
    <section className="summary-box">
      <div className="summary-heading">
        <CheckCircle size={18} />
        <h2>Executive Summary</h2>
      </div>
      <p>{renderSummaryText(explanation.executive_summary, result, importantTerms)}</p>
      <p>{renderSummaryText(explanation.sentiment_explanation, result, importantTerms)}</p>
      <p>{renderSummaryText(explanation.risk_explanation, result, importantTerms)}</p>
    </section>
  );
}

type SummaryMetricTone = SentimentLabel | RiskLevel | "uncertainty" | "signals";

interface SummaryMetric {
  value: string;
  tone: SummaryMetricTone;
}

interface SummaryMetricMatch {
  index: number;
  metric: SummaryMetric;
}

// Renders the summary text while turning only the key numeric values into metric pills.
function renderSummaryText(
  text: string,
  result: AnalysisResult,
  importantTerms: string[]
) {
  const metrics = summaryMetrics(result);
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let chunkIndex = 0;

  while (cursor < text.length) {
    const match = findNextMetric(text, metrics, cursor);

    if (!match) {
      nodes.push(
        <Fragment key={`text-${chunkIndex}`}>
          {emphasizeTerms(text.slice(cursor), importantTerms)}
        </Fragment>
      );
      break;
    }

    if (match.index > cursor) {
      nodes.push(
        <Fragment key={`text-${chunkIndex}`}>
          {emphasizeTerms(text.slice(cursor, match.index), importantTerms)}
        </Fragment>
      );
      chunkIndex += 1;
    }

    nodes.push(
      <span
        className={`summary-metric-pill tone-${match.metric.tone}`}
        key={`metric-${match.index}-${match.metric.value}`}
      >
        {match.metric.value}
      </span>
    );
    cursor = match.index + match.metric.value.length;
    chunkIndex += 1;
  }

  return nodes;
}

// These are the numbers worth styling in the summary. Dates and generic numbers stay plain.
function summaryMetrics(result: AnalysisResult) {
  const metrics: SummaryMetric[] = [
    { value: metricValue(result.sentiment_score), tone: result.sentiment_label },
    { value: metricValue(result.risk_score), tone: result.risk_level },
    { value: metricValue(result.uncertainty_score), tone: "uncertainty" }
  ];

  result.risk_categories
    .filter((category) => category.score > 0)
    .slice(0, 2)
    .forEach((category) => {
      metrics.push({ value: String(category.evidence_count), tone: "signals" });
    });

  const highestRiskSection = [...result.section_analyses].sort(
    (first, second) => second.risk_score - first.risk_score
  )[0];
  if (highestRiskSection) {
    metrics.push({ value: metricValue(highestRiskSection.risk_score), tone: "signals" });
  }

  return uniqueMetrics(metrics).sort((first, second) => second.value.length - first.value.length);
}

// Prevents duplicate pill values when the same score appears in more than one sentence.
function uniqueMetrics(metrics: SummaryMetric[]) {
  const seenValues = new Set<string>();
  return metrics.filter((metric) => {
    if (seenValues.has(metric.value)) {
      return false;
    }
    seenValues.add(metric.value);
    return true;
  });
}

// Finds the next metric value in the paragraph without matching inside a larger number.
function findNextMetric(
  text: string,
  metrics: SummaryMetric[],
  startIndex: number
): SummaryMetricMatch | null {
  let nextMatch: SummaryMetricMatch | null = null;

  for (const metric of metrics) {
    let index = text.indexOf(metric.value, startIndex);
    while (index !== -1) {
      if (hasMetricBoundary(text, index, metric.value.length)) {
        if (!nextMatch || index < nextMatch.index) {
          nextMatch = { index, metric };
        }
        break;
      }
      index = text.indexOf(metric.value, index + 1);
    }
  }

  return nextMatch;
}

// Keeps a value like 5.2 from matching inside a larger value like 15.20.
function hasMetricBoundary(text: string, index: number, length: number) {
  const previous = text[index - 1] ?? "";
  const next = text[index + length] ?? "";
  return !isNumberCharacter(previous) && !isNumberCharacter(next);
}

function isNumberCharacter(value: string) {
  return /[\d.-]/.test(value);
}

function metricValue(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toString();
}

// Chooses meaningful summary phrases to bold from the actual analysis result.
function importantSummaryTerms(result: AnalysisResult) {
  const terms = new Set<string>();
  const addTerm = (value: string | null | undefined) => {
    if (value && value.trim().length >= 2) {
      terms.add(value.trim());
    }
  };

  addTerm(result.company_name);
  addTerm(result.ticker);
  addTerm(result.form_type);
  addTerm(result.filed_at);
  addTerm(formatDate(result.filed_at));
  addTerm(sentimentCopy[result.sentiment_label]);
  addTerm(riskCopy[result.risk_level]);
  addTerm(`${riskCopy[result.risk_level]} risk`);
  addTerm(`${result.risk_level} risk`);

  result.risk_categories
    .filter((category) => category.score > 0)
    .slice(0, 2)
    .forEach((category) => {
      addTerm(category.label);
      addTerm(category.label.toLowerCase());
    });

  const highestRiskSection = [...result.section_analyses].sort(
    (first, second) => second.risk_score - first.risk_score
  )[0];
  addTerm(highestRiskSection?.title);

  result.evidence
    .filter(isMeaningfulSummaryTerm)
    .slice(0, 6)
    .forEach((term) => addTerm(term.term));

  return [...terms];
}

// Filters out weak finance boilerplate so the summary does not bold words like "may" or "could".
function isMeaningfulSummaryTerm(term: EvidenceTerm) {
  const genericTerms = new Set([
    "approximately",
    "believe",
    "could",
    "decrease",
    "decreased",
    "estimate",
    "expect",
    "increase",
    "increased",
    "may",
    "might",
    "possible",
    "potential",
    "would"
  ]);

  if (genericTerms.has(term.term)) {
    return false;
  }
  if (term.term.includes(" ")) {
    return true;
  }
  if (term.category === "risk" || term.category === "negative") {
    return term.term.length >= 6;
  }
  if (term.category === "positive") {
    return ["growth", "improved", "opportunity", "profit", "profitable", "strong"].includes(
      term.term
    );
  }
  return term.term === "uncertain" || term.term === "uncertainty";
}

function RiskFrameworkPanel({ result }: { result: AnalysisResult }) {
  const riskCategories = result.risk_categories ?? [];
  const sectionAnalyses = result.section_analyses ?? [];

  if (riskCategories.length === 0 && sectionAnalyses.length === 0) {
    return null;
  }

  return (
    <section className="framework-grid">
      <RiskCategoriesPanel categories={riskCategories} />
      <SectionSignalsPanel sections={sectionAnalyses} />
    </section>
  );
}

function RiskCategoriesPanel({ categories }: { categories: RiskCategoryScore[] }) {
  return (
    <section className="framework-panel">
      <div className="panel-title-row">
        <h2>Risk Categories</h2>
        <span>Explainable signals</span>
      </div>
      <div className="risk-category-list">
        {categories.slice(0, 6).map((category) => (
          <article className="risk-category-row" key={category.category}>
            <div>
              <strong>{category.label}</strong>
              <span>{category.evidence_count} matched signals</span>
            </div>
            <div className="risk-category-score">
              <StatusPill tone={category.level}>{riskCopy[category.level]}</StatusPill>
              <small>{category.score.toFixed(2)}</small>
            </div>
            {category.matched_terms.length > 0 ? (
              <div className="mini-term-row">
                {category.matched_terms.slice(0, 4).map((term) => (
                  <span key={term}>{term}</span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function SectionSignalsPanel({ sections }: { sections: SectionAnalysis[] }) {
  return (
    <section className="framework-panel">
      <div className="panel-title-row">
        <h2>Section Signals</h2>
        <span>{sections.length} sections</span>
      </div>
      {sections.length > 0 ? (
        <div className="section-signal-list">
          {sections.map((section) => (
            <article className="section-signal-row" key={section.section_key}>
              <div>
                <strong>{section.title}</strong>
                <span>{section.word_count.toLocaleString()} words</span>
              </div>
              <div className="section-score-line">
                <StatusPill tone={section.risk_level}>{riskCopy[section.risk_level]}</StatusPill>
                <small>{section.risk_score.toFixed(2)} risk / 1k</small>
              </div>
              {section.top_terms.length > 0 ? (
                <div className="mini-term-row">
                  {section.top_terms.map((term) => (
                    <span key={term}>{term}</span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="muted-panel-text">
          No major SEC sections were detected in this filing type.
        </p>
      )}
    </section>
  );
}

function EvidenceTermsPanel({
  groupedTerms
}: {
  groupedTerms: Record<EvidenceCategory, EvidenceTerm[]>;
}) {
  return (
    <section className="evidence-panel">
      <h2>Evidence Terms</h2>
      <div className="term-groups">
        {categoryOrder.map((category) => (
          <div className="term-group" key={category}>
            <span>{categoryCopy[category]}</span>
            <div>
              {groupedTerms[category].slice(0, 5).map((term) => (
                <EvidenceTermPill category={category} key={term.term} term={term} />
              ))}
              {groupedTerms[category].length === 0 ? <em>No terms found</em> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EvidenceTermPill({
  category,
  term
}: {
  category: EvidenceCategory;
  term: EvidenceTerm;
}) {
  return (
    <span className={`term-pill category-${category}`}>
      {term.term}
      <b>{term.count}</b>
    </span>
  );
}

function EvidenceExcerptCard({
  documentUrl,
  excerpt
}: {
  documentUrl: string | null;
  excerpt: EvidenceExcerpt;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const secUrl = buildSecExcerptUrl(documentUrl, excerpt.excerpt);

  return (
    <article className="excerpt-card">
      <div className="excerpt-header">
        <strong>Evidence {excerpt.id}</strong>
        <span>Score {excerpt.relevance_score.toFixed(2)}</span>
      </div>
      <div className="excerpt-source-row">
        <span>
          Source: <strong>{excerpt.source_section_title ?? "SEC filing text"}</strong>
        </span>
        {secUrl ? (
          <a href={secUrl} rel="noreferrer" target="_blank">
            Open in SEC filing
            <ExternalLink size={12} />
          </a>
        ) : null}
      </div>
      <div className="matched-terms">
        {excerpt.matched_terms.map((term) => (
          <span key={term}>{term}</span>
        ))}
      </div>
      <p className={isExpanded ? "expanded" : ""}>
        {highlightTerms(excerpt.excerpt, excerpt.matched_terms)}
      </p>
      {excerpt.excerpt.length > 220 ? (
        <button
          className="text-button"
          onClick={() => setIsExpanded((currentValue) => !currentValue)}
          type="button"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      ) : null}
    </article>
  );
}

function buildSecExcerptUrl(documentUrl: string | null, excerpt: string) {
  if (!documentUrl) {
    return null;
  }

  const snippet = excerpt
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);

  if (!snippet) {
    return documentUrl;
  }

  return `${documentUrl}#:~:text=${encodeURIComponent(snippet)}`;
}

function StatusPill({
  children,
  tone
}: {
  children: ReactNode;
  tone: SentimentLabel | RiskLevel;
}) {
  return <span className={`status-pill tone-${tone}`}>{children}</span>;
}

function groupEvidenceTerms(terms: EvidenceTerm[]) {
  const groupedTerms: Record<EvidenceCategory, EvidenceTerm[]> = {
    positive: [],
    negative: [],
    risk: [],
    uncertainty: []
  };

  terms.forEach((term) => {
    groupedTerms[term.category].push(term);
  });

  categoryOrder.forEach((category) => {
    groupedTerms[category].sort((first, second) => second.count - first.count);
  });

  return groupedTerms;
}
