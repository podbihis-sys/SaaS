import {
  MARKET_BY_LOCALE,
  VAT_RATE,
  ceil100,
  charm90,
  type Country,
} from "./quote";

/** Localised wording for the gross/net price breakdown. */
export const VAT_L10N: Record<
  string,
  { incl: string; net: string; vat: string; allPrices: string }
> = {
  de: { incl: "inkl.", net: "Netto", vat: "MwSt.", allPrices: "Alle Preise" },
  en: { incl: "incl.", net: "net", vat: "VAT", allPrices: "All prices" },
  hr: { incl: "uklj.", net: "neto", vat: "PDV", allPrices: "Sve cijene" },
  bs: { incl: "uklj.", net: "neto", vat: "PDV", allPrices: "Sve cijene" },
  sr: { incl: "uklj.", net: "neto", vat: "PDV", allPrices: "Sve cene" },
};

/** "19 %" / "8,1 %" — the statutory rate of a market, ready for display. */
export function vatPercent(country: Country): string {
  return `${((VAT_RATE[country] ?? VAT_RATE.other) * 100).toLocaleString("de-DE")} %`;
}

/** Charm gross (…9,90) of an advertised net price for a market. */
export function grossOf(net: number, country: Country): number {
  return charm90(net * (1 + (VAT_RATE[country] ?? VAT_RATE.other)));
}

/** de-DE grouped amount; cents only when the value actually has them. */
export function fmtAmount(value: number): string {
  const hasCents = Math.round(value * 100) % 100 !== 0;
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  });
}

export interface PriceDisplay {
  /** Gross price with currency, whole amounts only, e.g. "1.059 €". */
  gross: string;
  /** Statutory rate, e.g. "19 %". */
  vatPct: string;
  /** Approximate gross EUR value for non-EUR markets, e.g. "≈ 580 €". */
  eurHint: string | null;
}

interface MarketPrices {
  currency: string;
  /** Advertised net plan prices: Starter / Business / Premium. */
  plans: [number, number, number];
  /** Advertised net maintenance tiers: Basic / Business / Premium. */
  maintenance: [number, number, number];
  /** Net EUR equivalents for non-EUR markets (plans / maintenance). */
  eurPlans?: [number, number, number];
  eurMaintenance?: [number, number, number];
}

/**
 * Advertised net prices per market — the single source the pricing page and
 * maintenance strip render from (the quote engine prices each request itself).
 */
const MARKET_PRICES: Partial<Record<Country, MarketPrices>> = {
  de: { currency: "€", plans: [890, 1890, 3490], maintenance: [39, 89, 179] },
  hr: { currency: "€", plans: [590, 1290, 2490], maintenance: [29, 59, 119] },
  ba: {
    currency: "KM",
    plans: [950, 1950, 3900],
    maintenance: [39, 95, 195],
    eurPlans: [490, 990, 1990],
    eurMaintenance: [19, 49, 99],
  },
  rs: {
    currency: "RSD",
    plans: [57000, 116000, 233000],
    maintenance: [2200, 5700, 11600],
    eurPlans: [490, 990, 1990],
    eurMaintenance: [19, 49, 99],
  },
};

function displayFor(
  market: Country,
  nets: [number, number, number],
  currency: string,
  eurNets?: [number, number, number],
): PriceDisplay[] {
  const rate = VAT_RATE[market] ?? VAT_RATE.other;
  return nets.map((net, i) => {
    const gross =
      currency === "RSD" ? ceil100(net * (1 + rate)) : charm90(net * (1 + rate));
    return {
      gross: `${fmtAmount(gross)} ${currency}`,
      vatPct: vatPercent(market),
      // Rough EUR orientation for non-EUR markets — kept deliberately round.
      eurHint: eurNets
        ? `≈ ${fmtAmount(Math.ceil((eurNets[i] * (1 + rate)) / 10) * 10)} €`
        : null,
    };
  });
}

/** Gross plan prices (Starter/Business/Premium) for a language version. */
export function planPrices(locale: string): PriceDisplay[] {
  const market = MARKET_BY_LOCALE[locale] ?? "de";
  const m = MARKET_PRICES[market] ?? MARKET_PRICES.de!;
  return displayFor(market, m.plans, m.currency, m.eurPlans);
}

/** Gross maintenance tiers (Basic/Business/Premium) for a language version. */
export function maintenancePrices(locale: string): PriceDisplay[] {
  const market = MARKET_BY_LOCALE[locale] ?? "de";
  const m = MARKET_PRICES[market] ?? MARKET_PRICES.de!;
  return displayFor(market, m.maintenance, m.currency, m.eurMaintenance);
}

const CURRENCY_CODE: Record<string, string> = { "€": "EUR", KM: "BAM", RSD: "RSD" };

/** Numeric gross plan prices + ISO currency for structured data (JSON-LD). */
export function planOffers(locale: string): Array<{ price: number; currency: string }> {
  const market = MARKET_BY_LOCALE[locale] ?? "de";
  const m = MARKET_PRICES[market] ?? MARKET_PRICES.de!;
  const rate = VAT_RATE[market] ?? VAT_RATE.other;
  return m.plans.map((net) => ({
    price:
      m.currency === "RSD" ? ceil100(net * (1 + rate)) : charm90(net * (1 + rate)),
    currency: CURRENCY_CODE[m.currency] ?? "EUR",
  }));
}
