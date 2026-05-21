import type { Decimal } from "../types/api";

export const VAT_STANDARD_DE: Decimal = "0.19";
export const VAT_REDUCED_DE: Decimal = "0.07";
export const VAT_ZERO: Decimal = "0.00";

export const VAT_RATES_DE = {
  standard: VAT_STANDARD_DE,
  reduced: VAT_REDUCED_DE,
  zero: VAT_ZERO,
} as const;

export type VatRateKey = keyof typeof VAT_RATES_DE;

export function formatVatPercent(rate: Decimal): string {
  const n = Number.parseFloat(rate);
  if (!Number.isFinite(n)) return "0 %";
  return `${(n * 100).toLocaleString("de-DE", { maximumFractionDigits: 2 })} %`;
}
