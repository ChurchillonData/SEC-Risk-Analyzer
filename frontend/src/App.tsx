/* Main React interface for selecting companies and reviewing SEC filing analysis. */

import { AlertCircle, Github } from "lucide-react";
import { type FormEvent, useState } from "react";
import { analyzeFiling, analyzeRiskTrend } from "./api/client";
import {
  AnalysisDashboard,
  AnalysisSkeleton,
  EmptyState
} from "./components/AnalysisDashboard";
import { CompanyControls } from "./components/CompanyControls";
import { RecentAnalysesTable } from "./components/RecentAnalysesTable";
import { COMPANIES, type CompanyOption } from "./data/companies";
import type { AnalysisResult, FormType, RecentAnalysis, RiskTrendResponse } from "./types";

export default function App() {
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption>(COMPANIES[0]);
  const [formType, setFormType] = useState<FormType>(COMPANIES[0].defaultForm);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [riskTrend, setRiskTrend] = useState<RiskTrendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trendError, setTrendError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTrendLoading, setIsTrendLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setTrendError(null);
    setRiskTrend(null);

    try {
      const analysis = await analyzeFiling(selectedCompany.ticker, formType);
      setResult(analysis);
      setRecentAnalyses((currentRows) => [
        {
          id: `${analysis.ticker}-${analysis.accession_number}-${Date.now()}`,
          companyName: analysis.company_name ?? selectedCompany.name,
          ticker: analysis.ticker,
          formType: analysis.form_type,
          filedAt: analysis.filed_at,
          sentiment: analysis.sentiment_label,
          riskLevel: analysis.risk_level,
          analyzedAt: analysis.analyzed_at
        },
        ...currentRows.slice(0, 4)
      ]);
      void loadRiskTrend(selectedCompany.ticker, formType);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Analysis failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function selectCompany(company: CompanyOption) {
    setSelectedCompany(company);
    setFormType(company.defaultForm);
    setResult(null);
    setRiskTrend(null);
    setError(null);
    setTrendError(null);
  }

  async function loadRiskTrend(ticker: string, selectedFormType: FormType) {
    setIsTrendLoading(true);
    try {
      const trend = await analyzeRiskTrend(ticker, trendFormsFor(selectedFormType), 6);
      setRiskTrend(trend);
    } catch (caughtError) {
      setTrendError(caughtError instanceof Error ? caughtError.message : "Trend analysis failed.");
    } finally {
      setIsTrendLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">
          <ProductLogo />
        </div>
        <div className="brand-copy">
          <strong>EDGAR RiskLens</strong>
          <span>Explainable SEC filing risk intelligence</span>
        </div>
        <div className="topbar-actions">
          <LiveChip label="Live" />
          <a className="github-link" href="https://github.com/" rel="noreferrer" target="_blank">
            <Github size={17} />
            GitHub
          </a>
        </div>
      </header>

      <section className="layout-grid">
        <form className="control-panel" onSubmit={handleSubmit}>
          <CompanyControls
            formType={formType}
            isLoading={isLoading}
            onFormTypeChange={setFormType}
            onSelectCompany={selectCompany}
            selectedCompany={selectedCompany}
          />
        </form>

        <section className="results-column">
          {error ? (
            <div className="alert" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : null}

          {isLoading ? (
            <AnalysisSkeleton />
          ) : result ? (
            <AnalysisDashboard
              company={selectedCompany}
              isTrendLoading={isTrendLoading}
              result={result}
              trend={riskTrend}
              trendError={trendError}
            />
          ) : (
            <EmptyState selectedCompany={selectedCompany} formType={formType} />
          )}
        </section>
      </section>

      <RecentAnalysesTable rows={recentAnalyses} />
    </main>
  );
}

function trendFormsFor(formType: FormType): FormType[] {
  if (formType === "10-K" || formType === "10-Q") {
    return ["10-Q", "10-K"];
  }
  if (formType === "20-F" || formType === "6-K") {
    return ["6-K", "20-F"];
  }
  return [formType];
}

function ProductLogo() {
  return (
    <svg aria-hidden="true" className="product-logo" viewBox="0 0 32 32">
      <rect x="4" y="4" width="24" height="24" rx="6" fill="#0F172A" />
      <rect x="8" y="8" width="16" height="16" rx="3" fill="#F8FAFC" />
      <path
        d="M10 13 L14 11 L18 13 L22 11"
        stroke="#EF4444"
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M11 17 H17" stroke="#94A3B8" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="20" cy="20" r="4" stroke="#1F6FEB" strokeWidth="1.8" fill="none" />
      <line
        x1="23"
        y1="23"
        x2="26"
        y2="26"
        stroke="#1F6FEB"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LiveChip({ label }: { label: string }) {
  return (
    <span className="live-chip">
      <span />
      {label}
    </span>
  );
}
