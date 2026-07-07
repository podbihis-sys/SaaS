import type { Country, LeadInput } from "./quote";

export interface RegionCheck {
  /** Country the lead selected in the form. */
  claimed: Country;
  /** Country used for pricing after anti-fraud correction. */
  effective: Country;
  /** True when a discount market was claimed but DACH signals dominate. */
  mismatch: boolean;
  /** Human-readable evidence for the owner notification. */
  reasons: string[];
}

const DISCOUNT_MARKETS = new Set<Country>(["hr", "ba", "rs", "me"]);

/** ccTLD → DACH country. */
const DACH_TLD: Record<string, Country> = { de: "de", at: "at", ch: "ch" };

/** International dialling prefixes for the DACH countries. */
const DACH_PHONE: Array<{ re: RegExp; country: Country }> = [
  { re: /^(?:\+|00)49/, country: "de" },
  { re: /^(?:\+|00)43/, country: "at" },
  { re: /^(?:\+|00)41/, country: "ch" },
];

const DACH_ADDRESS =
  /\b(deutschland|germany|allemagne|österreich|oesterreich|austria|schweiz|switzerland|suisse)\b/i;

function hostTld(rawUrl: string | undefined): string | null {
  if (!rawUrl) return null;
  try {
    const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const host = new URL(url).hostname.toLowerCase();
    const tld = host.split(".").pop() ?? "";
    return tld || null;
  } catch {
    return null;
  }
}

/**
 * Cross-checks the claimed market against objective signals so a DACH company
 * cannot obtain Balkan pricing by selecting a cheaper country in the form.
 * The quote is a non-binding lead magnet, so on a strong mismatch we quote at
 * DACH rates and flag the lead rather than silently trusting the dropdown.
 */
export function checkRegion(input: LeadInput, ipCountry: string | null): RegionCheck {
  const reasons: string[] = [];
  let dachCountry: Country | null = null;

  const tld = hostTld(input.websiteUrl);
  if (tld && DACH_TLD[tld]) {
    dachCountry = DACH_TLD[tld];
    reasons.push(`Domain-Endung .${tld}`);
  }

  const phone = (input.phone ?? "").replace(/[\s()\-./]/g, "");
  for (const { re, country } of DACH_PHONE) {
    if (re.test(phone)) {
      dachCountry = dachCountry ?? country;
      reasons.push(`Telefonvorwahl ${country.toUpperCase()}`);
      break;
    }
  }

  const ip = (ipCountry ?? "").toUpperCase();
  if (ip === "DE" || ip === "AT" || ip === "CH" || ip === "LI") {
    const c = (ip === "AT" ? "at" : ip === "CH" || ip === "LI" ? "ch" : "de") as Country;
    dachCountry = dachCountry ?? c;
    reasons.push(`IP-Standort ${ip}`);
  }

  if (DACH_ADDRESS.test(input.address)) {
    dachCountry = dachCountry ?? "de";
    reasons.push("Adresse verweist auf DACH");
  }

  const mismatch = DISCOUNT_MARKETS.has(input.country) && dachCountry !== null;

  return {
    claimed: input.country,
    effective: mismatch ? (dachCountry as Country) : input.country,
    mismatch,
    reasons,
  };
}
