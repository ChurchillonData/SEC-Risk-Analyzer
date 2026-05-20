export function highlightTerms(text: string, terms: string[]) {
  const uniqueTerms = [...new Set(terms.filter(Boolean))].sort((first, second) => {
    return second.length - first.length;
  });
  if (uniqueTerms.length === 0) {
    return text;
  }

  const regex = new RegExp(`(${uniqueTerms.map(escapeRegex).join("|")})`, "gi");
  return text.split(regex).map((part, index) => {
    const isMatchedTerm = uniqueTerms.some((term) => term.toLowerCase() === part.toLowerCase());
    if (!isMatchedTerm) {
      return part;
    }

    return (
      <mark className="excerpt-highlight" key={`${part}-${index}`}>
        {part}
      </mark>
    );
  });
}

export function emphasizeTerms(text: string, terms: string[]) {
  const uniqueTerms = [...new Set(terms.filter(Boolean))].sort((first, second) => {
    return second.length - first.length;
  });
  if (uniqueTerms.length === 0) {
    return text;
  }

  const regex = new RegExp(`(${uniqueTerms.map(escapeRegex).join("|")})`, "gi");
  return text.split(regex).map((part, index) => {
    const isMatchedTerm = uniqueTerms.some((term) => term.toLowerCase() === part.toLowerCase());
    if (!isMatchedTerm) {
      return part;
    }

    return (
      <strong className="summary-emphasis" key={`${part}-${index}`}>
        {part}
      </strong>
    );
  });
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
