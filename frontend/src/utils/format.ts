import type { FormType } from "../types";

export function formDescription(formType: FormType) {
  const descriptions: Record<FormType, string> = {
    "10-K": "Annual",
    "10-Q": "Quarterly",
    "8-K": "Current",
    "20-F": "Annual",
    "6-K": "Current"
  };

  return descriptions[formType];
}

export function formatSigned(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)} score`;
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
