import { Loader2, FileText, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { COMPANIES, type CompanyOption } from "../data/companies";
import type { FormType } from "../types";
import { formDescription } from "../utils/format";
import { CountryBadge, Logo } from "./Logo";

interface CompanyControlsProps {
  formType: FormType;
  isLoading: boolean;
  onFormTypeChange: (formType: FormType) => void;
  onSelectCompany: (company: CompanyOption) => void;
  selectedCompany: CompanyOption;
}

export function CompanyControls({
  formType,
  isLoading,
  onFormTypeChange,
  onSelectCompany,
  selectedCompany
}: CompanyControlsProps) {
  return (
    <>
      <CompanySelector selectedCompany={selectedCompany} onSelect={onSelectCompany} />
      <FilingSelector
        formType={formType}
        onChange={onFormTypeChange}
        selectedCompany={selectedCompany}
      />
      <button className="analyze-button" disabled={isLoading} type="submit">
        {isLoading ? <Loader2 className="spin" size={18} /> : <FileText size={18} />}
        {isLoading ? "Analyzing filing..." : "Analyze latest filing"}
      </button>
    </>
  );
}

function CompanySelector({
  selectedCompany,
  onSelect
}: {
  selectedCompany: CompanyOption;
  onSelect: (company: CompanyOption) => void;
}) {
  const selectorRef = useRef<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!selectorRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const filteredCompanies = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) {
      return COMPANIES;
    }

    return COMPANIES.filter((company) => {
      const searchText = `${company.name} ${company.ticker} ${company.exchange} ${company.sector}`;
      return searchText.toLowerCase().includes(normalizedQuery);
    });
  }, [query]);

  function handleSelect(company: CompanyOption) {
    onSelect(company);
    setQuery("");
    setIsOpen(false);
  }

  return (
    <section className="selector-card" ref={selectorRef}>
      <label className="section-label" htmlFor="company-search">
        Company or ticker
      </label>
      <div className="company-search-box">
        <Search size={18} />
        <input
          id="company-search"
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by name or ticker"
          value={query}
        />
      </div>

      {isOpen ? (
        <div className="company-menu">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <button
                className={company.ticker === selectedCompany.ticker ? "selected" : ""}
                key={company.ticker}
                onClick={() => handleSelect(company)}
                type="button"
              >
                <Logo company={company} />
                <span>
                  <strong>{company.name}</strong>
                  <small>
                    {company.ticker} | {company.exchange}
                  </small>
                  <CountryBadge company={company} />
                </span>
              </button>
            ))
          ) : (
            <p className="empty-menu">No matching company found.</p>
          )}
        </div>
      ) : null}

      <button
        className="selected-company-card"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Logo company={selectedCompany} size="large" />
        <span>
          <strong>{selectedCompany.name}</strong>
          <small>
            {selectedCompany.ticker} | {selectedCompany.exchange}
          </small>
          <CountryBadge company={selectedCompany} />
          <em>{selectedCompany.sector}</em>
        </span>
      </button>
    </section>
  );
}

function FilingSelector({
  selectedCompany,
  formType,
  onChange
}: {
  selectedCompany: CompanyOption;
  formType: FormType;
  onChange: (formType: FormType) => void;
}) {
  return (
    <section className="filing-card">
      <span className="section-label">Filing type</span>
      <div
        className="filing-options"
        style={{
          gridTemplateColumns: `repeat(${selectedCompany.forms.length}, minmax(0, 1fr))`
        }}
      >
        {selectedCompany.forms.map((type) => (
          <button
            aria-pressed={formType === type}
            className={formType === type ? "active" : ""}
            key={type}
            onClick={() => onChange(type)}
            type="button"
          >
            <strong>{type}</strong>
            <span>{formDescription(type)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
