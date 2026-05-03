const locale = navigator.languages?.[0] ?? navigator.language;

/** Parses a user-typed number, normalizing comma decimal separators (e.g. German locale). */
export function parseInputNumber(value: string | number): number {
  if (typeof value === "number") return value;
  return Number(value.replace(",", "."));
}

export const formatMoney = new Intl.NumberFormat(locale, {
  style: "currency",
  currency: "USD",
  // currencySign: "$",
}).format;

export const formatNumber = new Intl.NumberFormat(locale).format;
