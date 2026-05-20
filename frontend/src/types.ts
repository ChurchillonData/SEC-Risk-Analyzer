export type FormType = "10-K" | "10-Q" | "8-K" | "20-F" | "6-K";
export type SentimentLabel = "positive" | "negative" | "neutral" | "mixed";
export type RiskLevel = "low" | "medium" | "high";
export type EvidenceCategory = "positive" | "negative" | "risk" | "uncertainty";
export type RiskCategory =
  | "litigation"
  | "regulatory"
  | "liquidity"
  | "market"
  | "cybersecurity"
  | "operational";

export interface EvidenceTerm {
  term: string;
  category: EvidenceCategory;
  count: number;
}

export interface EvidenceExcerpt {
  id: number;
  excerpt: string;
  matched_terms: string[];
  relevance_score: number;
  source_section_key: string | null;
  source_section_title: string | null;
}

export interface RiskCategoryScore {
  category: RiskCategory;
  label: string;
  score: number;
  level: RiskLevel;
  matched_terms: string[];
  evidence_count: number;
}

export interface SectionAnalysis {
  section_key: string;
  title: string;
  word_count: number;
  risk_score: number;
  uncertainty_score: number;
  risk_level: RiskLevel;
  top_terms: string[];
}

export interface FilingExplanation {
  provider: "none" | "template" | "openai";
  model: string | null;
  executive_summary: string;
  sentiment_explanation: string;
  risk_explanation: string;
  key_drivers: string[];
  cited_evidence_ids: number[];
  watch_items: string[];
  limitations: string[];
}

export interface AnalysisResult {
  id: number | null;
  ticker: string;
  cik: string;
  company_name: string | null;
  form_type: FormType;
  accession_number: string;
  filed_at: string;
  document_url: string | null;
  sentiment_label: SentimentLabel;
  sentiment_score: number;
  risk_score: number;
  uncertainty_score: number;
  risk_level: RiskLevel;
  evidence: EvidenceTerm[];
  evidence_excerpts: EvidenceExcerpt[];
  risk_categories: RiskCategoryScore[];
  section_analyses: SectionAnalysis[];
  explanation: FilingExplanation | null;
  analyzed_at: string;
}

export interface RiskTrendPoint {
  ticker: string;
  company_name: string | null;
  form_type: FormType;
  accession_number: string;
  filed_at: string;
  document_url: string;
  risk_score: number;
  risk_level: RiskLevel;
  sentiment_label: SentimentLabel;
  uncertainty_score: number;
  top_driver: string | null;
}

export interface RiskTrendResponse {
  ticker: string;
  company_name: string | null;
  points: RiskTrendPoint[];
}

export interface RecentAnalysis {
  id: string;
  companyName: string;
  ticker: string;
  formType: FormType;
  filedAt: string;
  sentiment: SentimentLabel;
  riskLevel: RiskLevel;
  analyzedAt: string;
}
