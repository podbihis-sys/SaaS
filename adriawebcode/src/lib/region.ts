import type { Country, LeadInput } from "./quote";

export interface RegionCheck {
  /** Country the lead selected in the form. */
  claimed: Country;
  /** Country used for pricing, derived from the company address (Firmensitz). */
  effective: Country;
  /** True when the address clearly names a different country than the selection. */
  mismatch: boolean;
  /** Human-readable evidence for the notice and the owner notification. */
  reasons: string[];
}

/** Country names for readable evidence, keyed by ISO country code. */
const COUNTRY_NAME: Record<Country, string> = {
  de: "Deutschland",
  at: "Österreich",
  ch: "Schweiz",
  hr: "Kroatien",
  ba: "Bosnien & Herzegowina",
  rs: "Serbien",
  me: "Montenegro",
  other: "—",
};

/**
 * Signals that identify the company's registered seat (Firmensitz) from the
 * free-text address: the country name in several languages plus a curated set
 * of unambiguous large cities. Order matters — the first match wins — so the
 * more specific Balkan patterns are checked before the broad DACH ones.
 *
 * The website's domain ending, the phone prefix and the visitor IP are
 * deliberately NOT used: an international company may run a .de domain while
 * being based in Bosnia (or the reverse), and the seat is what determines the
 * fair local price.
 */
const ADDRESS_SIGNALS: Array<{ country: Country; re: RegExp }> = [
  {
    country: "ba",
    re: /(bosnien|herzegowina|bosnia|herzegovina|bosna|hercegovin|\bb\.?i\.?h\b|sarajevo|mostar|tuzla|zenica|banja\s*luka|bijeljina|br[čc]ko)/i,
  },
  {
    country: "hr",
    re: /(kroatien|croatia|hrvatsk|zagreb|split|rijeka|osijek|dubrovnik|zadar)/i,
  },
  {
    country: "rs",
    re: /(serbien|serbia|srbij|beograd|belgrade|novi\s*sad|kragujevac|subotica|\bni[šs]\b)/i,
  },
  {
    country: "me",
    re: /(montenegro|crna\s*gora|crnoj\s*gori|podgorica|nik[šs]i[ćc]|budva|herceg\s*novi|kotor)/i,
  },
  {
    country: "at",
    re: /(österreich|oesterreich|austria|austrij|\bwien\b|vienna|salzburg|innsbruck|\bgraz\b|\blinz\b|klagenfurt)/i,
  },
  {
    country: "ch",
    re: /(schweiz|switzerland|suisse|svizzera|[šs]vicarsk|[šs]vajcarsk|z[üu]rich|gen[èe]ve|\bgenf\b|\bbasel\b|lausanne|luzern|winterthur)/i,
  },
  {
    country: "de",
    re: /(deutschland|germany|allemagne|njema[čc]k|nema[čc]k|\bberlin\b|m[üu]nchen|hamburg|frankfurt|k[öo]ln|stuttgart|d[üu]sseldorf|dortmund|leipzig|dresden|hannover|n[üu]rnberg|bremen)/i,
  },
];

/**
 * Detects the company's country from its free-text address. Returns null when
 * no clear signal is present, in which case the selected country is trusted.
 */
export function detectCountryFromAddress(address: string): Country | null {
  const text = (address ?? "").toLowerCase();
  if (!text) return null;
  for (const { country, re } of ADDRESS_SIGNALS) {
    if (re.test(text)) return country;
  }
  return null;
}

/**
 * Prices by the company's registered seat (Firmensitz): if the address clearly
 * names a country different from the one selected in the form, the quote is
 * calculated for the address country and the lead is flagged so the visitor
 * gets an on-screen notice. This is symmetric — a German seat that selected a
 * Balkan market is corrected up, a Balkan seat that selected DACH is corrected
 * down — and it never punishes an international company for its domain ending.
 * When the address gives no clear signal, the selection is trusted as-is.
 */
export function checkRegion(input: LeadInput): RegionCheck {
  const claimed = input.country;
  const addressCountry = detectCountryFromAddress(input.address);

  if (!addressCountry) {
    return { claimed, effective: claimed, mismatch: false, reasons: [] };
  }

  const reasons = [`Firmensitz laut Adresse: ${COUNTRY_NAME[addressCountry]}`];

  // Selection differs from the seat → correct the price and flag it. An "other"
  // selection is priced by the detected seat but not treated as a mismatch.
  if (addressCountry !== claimed && claimed !== "other") {
    return { claimed, effective: addressCountry, mismatch: true, reasons };
  }
  if (claimed === "other") {
    return { claimed, effective: addressCountry, mismatch: false, reasons };
  }

  return { claimed, effective: claimed, mismatch: false, reasons: [] };
}

export { COUNTRY_NAME };
