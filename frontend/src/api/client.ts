import type { AnalysisResult, FormType, RiskTrendResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

interface ApiErrorBody {
  detail?: string;
}

export async function analyzeFiling(ticker: string, formType: FormType): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/api/v1/filings/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ticker,
      form_type: formType
    })
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = (await response.json()) as ApiErrorBody;
      if (errorBody.detail) {
        message = errorBody.detail;
      }
    } catch {
      // Keep the status-based fallback message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<AnalysisResult>;
}

export async function analyzeRiskTrend(
  ticker: string,
  formTypes: FormType[],
  limit = 6
): Promise<RiskTrendResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/filings/risk-trend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ticker,
      form_types: formTypes,
      limit
    })
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = (await response.json()) as ApiErrorBody;
      if (errorBody.detail) {
        message = errorBody.detail;
      }
    } catch {
      // Keep the status-based fallback message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<RiskTrendResponse>;
}
