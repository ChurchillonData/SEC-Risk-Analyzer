import { useState } from "react";
import { type CompanyOption, fallbackLogoUrl, logoUrl } from "../data/companies";

export function Logo({ company, size = "normal" }: { company: CompanyOption; size?: "normal" | "large" }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const className = size === "large" ? "company-logo large" : "company-logo";
  const sources = company.logoUrls ?? [logoUrl(company.domain), fallbackLogoUrl(company.domain)];

  if (sourceIndex >= sources.length) {
    return <span className={className}>{company.ticker.slice(0, 1)}</span>;
  }

  return (
    <img
      alt={`${company.name} logo`}
      className={className}
      onError={() => setSourceIndex((currentIndex) => currentIndex + 1)}
      src={sources[sourceIndex]}
    />
  );
}

export function CountryBadge({ company }: { company: CompanyOption }) {
  const label = company.country === "Global" ? "Global" : company.country;
  const flagUrl =
    company.country === "US"
      ? "/flags/us.svg"
      : company.country === "UK"
        ? "/flags/gb.svg"
        : null;

  return (
    <span className={`country-badge country-${company.country.toLowerCase()}`}>
      {flagUrl ? (
        <img alt="" aria-hidden="true" className="country-flag" src={flagUrl} />
      ) : (
        <span className="country-flag globe" aria-hidden="true">
          G
        </span>
      )}
      {label}
    </span>
  );
}
