import type { SiteAnalysis } from "./scraper";

export type ProjectType = "new" | "redesign" | "shop" | "landing" | "seo";
export type PagesScope = "small" | "medium" | "large";
export type LanguagesScope = "one" | "two" | "many";
export type MaintenanceChoice = "none" | "basic" | "business" | "premium" | "unsure";
export type Country = "de" | "at" | "ch" | "hr" | "ba" | "rs" | "me" | "other";

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  company: string;
  address: string;
  country: Country;
  hasWebsite: boolean;
  websiteUrl?: string;
  projectType: ProjectType;
  pages: PagesScope;
  languages: LanguagesScope;
  maintenance: MaintenanceChoice;
  message?: string;
  locale: string;
}

export interface QuoteItem {
  key: string;
  amount: number;
}

export interface LocalCurrencyQuote {
  code: string;
  totalMin: number;
  totalMax: number;
  maintenanceMonthly: number;
}

export interface Quote {
  items: QuoteItem[];
  totalMin: number;
  totalMax: number;
  timelineWeeksMin: number;
  timelineWeeksMax: number;
  recommendedMaintenance: "basic" | "business" | "premium";
  maintenancePriceMonthly: number;
  currency: "EUR";
  regionFactor: number;
  /** Amounts converted to the market's local currency (BA → KM, RS → RSD). */
  localCurrency: LocalCurrencyQuote | null;
}

/**
 * Market-standard base prices in EUR (DACH benchmark). The Adriatic markets
 * get a regional factor so quotes stay competitive with local agencies.
 */
const BASE_PRICES: Record<ProjectType, number> = {
  landing: 890,
  new: 1890,
  redesign: 1590,
  shop: 3490,
  seo: 690,
};

const PAGE_FACTOR: Record<PagesScope, number> = {
  small: 1,
  medium: 1.35,
  large: 1.9,
};

const LANGUAGE_SURCHARGE: Record<LanguagesScope, number> = {
  one: 0,
  two: 390,
  many: 890,
};

/**
 * Aligned with typical local agency rates so quotes stay competitive:
 * Croatia ~30% below DACH, Bosnia/Serbia ~45% below, Montenegro in between.
 */
const REGION_FACTOR: Record<Country, number> = {
  de: 1,
  at: 1,
  ch: 1.15,
  hr: 0.68,
  ba: 0.55,
  rs: 0.55,
  me: 0.62,
  other: 1,
};

type MaintenanceTierPrices = { basic: number; business: number; premium: number };

const MAINTENANCE_PRICES_BY_COUNTRY: Record<Country, MaintenanceTierPrices> = {
  de: { basic: 39, business: 89, premium: 179 },
  at: { basic: 39, business: 89, premium: 179 },
  ch: { basic: 45, business: 99, premium: 199 },
  hr: { basic: 29, business: 59, premium: 119 },
  me: { basic: 29, business: 59, premium: 119 },
  ba: { basic: 19, business: 49, premium: 99 },
  rs: { basic: 19, business: 49, premium: 99 },
  other: { basic: 39, business: 89, premium: 179 },
};

/**
 * Local currencies of the target markets. Croatia and Montenegro use the
 * euro; Bosnia's KM is pegged at 1.95583, the Serbian dinar floats (~117).
 */
const LOCAL_CURRENCY: Partial<Record<Country, { code: string; rate: number; roundTo: number }>> = {
  ba: { code: "KM", rate: 1.95583, roundTo: 10 },
  rs: { code: "RSD", rate: 117, roundTo: 100 },
};

function round10(value: number): number {
  return Math.round(value / 10) * 10;
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function buildQuote(input: LeadInput, analysis: SiteAnalysis | null): Quote {
  const regionFactor = REGION_FACTOR[input.country] ?? 1;
  const items: QuoteItem[] = [];

  const base = BASE_PRICES[input.projectType] * PAGE_FACTOR[input.pages];
  items.push({ key: `base_${input.projectType}`, amount: round10(base * regionFactor) });

  const langSurcharge = LANGUAGE_SURCHARGE[input.languages];
  if (langSurcharge > 0) {
    items.push({ key: "multilingual", amount: round10(langSurcharge * regionFactor) });
  }

  // SEO package is included as a line item for build projects.
  if (input.projectType !== "seo") {
    items.push({ key: "seo_setup", amount: round10(290 * regionFactor) });
  }

  // Findings from the live analysis adjust the quote.
  if (analysis?.reachable) {
    if (analysis.issues.includes("not-mobile-optimized")) {
      items.push({ key: "responsive_rebuild", amount: round10(350 * regionFactor) });
    }
    if (!analysis.https) {
      items.push({ key: "https_migration", amount: round10(120 * regionFactor) });
    }
    if (
      input.projectType === "redesign" &&
      (analysis.techStack.includes("Wix") ||
        analysis.techStack.includes("Jimdo") ||
        analysis.techStack.includes("Squarespace"))
    ) {
      items.push({ key: "platform_migration", amount: round10(450 * regionFactor) });
    }
    if (
      analysis.issues.includes("no-meta-description") ||
      analysis.issues.includes("no-structured-data")
    ) {
      items.push({ key: "seo_cleanup", amount: round10(190 * regionFactor) });
    }
    if (analysis.issues.includes("heavy-page") || analysis.issues.includes("slow-response")) {
      items.push({ key: "performance_optimization", amount: round10(240 * regionFactor) });
    }
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const totalMin = round10(total * 0.95);
  const totalMax = round10(total * 1.2);

  const timeline: Record<ProjectType, [number, number]> = {
    landing: [1, 2],
    seo: [1, 3],
    redesign: [2, 4],
    new: [2, 4],
    shop: [4, 8],
  };
  let [weeksMin, weeksMax] = timeline[input.projectType];
  if (input.pages === "large") {
    weeksMin += 1;
    weeksMax += 2;
  }

  const recommendedMaintenance: Quote["recommendedMaintenance"] =
    input.maintenance === "basic" || input.maintenance === "business" || input.maintenance === "premium"
      ? input.maintenance
      : input.projectType === "shop"
        ? "premium"
        : input.projectType === "landing" || input.projectType === "seo"
          ? "basic"
          : "business";

  const maintenancePriceMonthly =
    MAINTENANCE_PRICES_BY_COUNTRY[input.country][recommendedMaintenance];

  const local = LOCAL_CURRENCY[input.country];
  const localCurrency: LocalCurrencyQuote | null = local
    ? {
        code: local.code,
        totalMin: roundTo(totalMin * local.rate, local.roundTo),
        totalMax: roundTo(totalMax * local.rate, local.roundTo),
        maintenanceMonthly: roundTo(maintenancePriceMonthly * local.rate, local.roundTo / 10),
      }
    : null;

  return {
    items,
    totalMin,
    totalMax,
    timelineWeeksMin: weeksMin,
    timelineWeeksMax: weeksMax,
    recommendedMaintenance,
    maintenancePriceMonthly,
    currency: "EUR",
    regionFactor,
    localCurrency,
  };
}

/** Human-readable labels for quote item keys, per locale. */
export const ITEM_LABELS: Record<string, Record<string, string>> = {
  base_new: {
    de: "Konzeption, Design & Entwicklung der neuen Website",
    en: "Concept, design & development of the new website",
    hr: "Koncept, dizajn i razvoj nove web stranice",
    bs: "Koncept, dizajn i razvoj nove web stranice",
    sr: "Koncept, dizajn i razvoj novog sajta",
  },
  base_redesign: {
    de: "Redesign & technische Modernisierung der bestehenden Website",
    en: "Redesign & technical modernisation of the existing website",
    hr: "Redizajn i tehnička modernizacija postojeće stranice",
    bs: "Redizajn i tehnička modernizacija postojeće stranice",
    sr: "Redizajn i tehnička modernizacija postojećeg sajta",
  },
  base_shop: {
    de: "Webshop / Buchungssystem – Design, Entwicklung & Zahlungsanbindung",
    en: "Online shop / booking system – design, development & payment integration",
    hr: "Web trgovina / sustav rezervacija – dizajn, razvoj i naplata",
    bs: "Web shop / sistem rezervacija – dizajn, razvoj i naplata",
    sr: "Veb prodavnica / sistem rezervacija – dizajn, razvoj i naplata",
  },
  base_landing: {
    de: "Landingpage / Onepager – Design & Entwicklung",
    en: "Landing page / one-pager – design & development",
    hr: "Landing stranica / onepager – dizajn i razvoj",
    bs: "Landing stranica / onepager – dizajn i razvoj",
    sr: "Landing stranica / onepager – dizajn i razvoj",
  },
  base_seo: {
    de: "SEO-Audit & Optimierungspaket",
    en: "SEO audit & optimisation package",
    hr: "SEO revizija i paket optimizacije",
    bs: "SEO revizija i paket optimizacije",
    sr: "SEO revizija i paket optimizacije",
  },
  multilingual: {
    de: "Mehrsprachigkeit inkl. hreflang & lokalem SEO",
    en: "Multilingual setup incl. hreflang & local SEO",
    hr: "Višejezičnost uklj. hreflang i lokalni SEO",
    bs: "Višejezičnost uklj. hreflang i lokalni SEO",
    sr: "Višejezičnost uklj. hreflang i lokalni SEO",
  },
  seo_setup: {
    de: "SEO-Grundeinrichtung (Meta, Sitemap, Indexierung, Ladezeit)",
    en: "SEO base setup (meta, sitemap, indexing, speed)",
    hr: "Osnovni SEO (meta, sitemap, indeksiranje, brzina)",
    bs: "Osnovni SEO (meta, sitemap, indeksiranje, brzina)",
    sr: "Osnovni SEO (meta, sitemap, indeksiranje, brzina)",
  },
  responsive_rebuild: {
    de: "Mobile-Optimierung (Ihre Website ist nicht responsiv)",
    en: "Mobile optimisation (your site is not responsive)",
    hr: "Mobilna optimizacija (vaša stranica nije responzivna)",
    bs: "Mobilna optimizacija (vaša stranica nije responzivna)",
    sr: "Mobilna optimizacija (vaš sajt nije responzivan)",
  },
  https_migration: {
    de: "Umstellung auf HTTPS / SSL",
    en: "Migration to HTTPS / SSL",
    hr: "Prelazak na HTTPS / SSL",
    bs: "Prelazak na HTTPS / SSL",
    sr: "Prelazak na HTTPS / SSL",
  },
  platform_migration: {
    de: "Migration von Baukasten-System auf moderne Technologie",
    en: "Migration from website builder to modern technology",
    hr: "Migracija s builder platforme na modernu tehnologiju",
    bs: "Migracija s builder platforme na modernu tehnologiju",
    sr: "Migracija s builder platforme na modernu tehnologiju",
  },
  seo_cleanup: {
    de: "SEO-Bereinigung (fehlende Meta-Daten & strukturierte Daten)",
    en: "SEO cleanup (missing meta & structured data)",
    hr: "SEO čišćenje (nedostaju meta i strukturirani podaci)",
    bs: "SEO čišćenje (nedostaju meta i strukturirani podaci)",
    sr: "SEO čišćenje (nedostaju meta i strukturirani podaci)",
  },
  performance_optimization: {
    de: "Performance-Optimierung (Ladezeit & Seitengröße)",
    en: "Performance optimisation (load time & page weight)",
    hr: "Optimizacija performansi (brzina i veličina stranice)",
    bs: "Optimizacija performansi (brzina i veličina stranice)",
    sr: "Optimizacija performansi (brzina i veličina sajta)",
  },
};

export const ISSUE_LABELS: Record<string, Record<string, string>> = {
  "no-https": {
    de: "Keine sichere HTTPS-Verbindung",
    en: "No secure HTTPS connection",
    hr: "Nema sigurne HTTPS veze",
    bs: "Nema sigurne HTTPS veze",
    sr: "Nema sigurne HTTPS veze",
  },
  "bad-title": {
    de: "Seitentitel fehlt oder ist nicht optimal",
    en: "Page title missing or suboptimal",
    hr: "Naslov stranice nedostaje ili nije optimalan",
    bs: "Naslov stranice nedostaje ili nije optimalan",
    sr: "Naslov stranice nedostaje ili nije optimalan",
  },
  "no-meta-description": {
    de: "Meta-Beschreibung fehlt (wichtig für Google)",
    en: "Meta description missing (important for Google)",
    hr: "Nedostaje meta opis (važno za Google)",
    bs: "Nedostaje meta opis (važno za Google)",
    sr: "Nedostaje meta opis (važno za Google)",
  },
  "not-mobile-optimized": {
    de: "Nicht für Mobilgeräte optimiert",
    en: "Not optimised for mobile devices",
    hr: "Nije optimizirano za mobilne uređaje",
    bs: "Nije optimizovano za mobilne uređaje",
    sr: "Nije optimizovano za mobilne uređaje",
  },
  "no-h1": {
    de: "Keine H1-Überschrift gefunden",
    en: "No H1 heading found",
    hr: "Nije pronađen H1 naslov",
    bs: "Nije pronađen H1 naslov",
    sr: "Nije pronađen H1 naslov",
  },
  "no-og-tags": {
    de: "Keine Social-Media-Vorschau (OG-Tags)",
    en: "No social media preview (OG tags)",
    hr: "Nema pregleda za društvene mreže (OG oznake)",
    bs: "Nema pregleda za društvene mreže (OG oznake)",
    sr: "Nema pregleda za društvene mreže (OG oznake)",
  },
  "no-structured-data": {
    de: "Keine strukturierten Daten (Schema.org)",
    en: "No structured data (Schema.org)",
    hr: "Nema strukturiranih podataka (Schema.org)",
    bs: "Nema strukturiranih podataka (Schema.org)",
    sr: "Nema strukturiranih podataka (Schema.org)",
  },
  "missing-alt-texts": {
    de: "Bilder ohne Alt-Texte (SEO & Barrierefreiheit)",
    en: "Images without alt texts (SEO & accessibility)",
    hr: "Slike bez alt tekstova (SEO i pristupačnost)",
    bs: "Slike bez alt tekstova (SEO i pristupačnost)",
    sr: "Slike bez alt tekstova (SEO i pristupačnost)",
  },
  "slow-response": {
    de: "Langsame Server-Antwortzeit",
    en: "Slow server response time",
    hr: "Spor odgovor servera",
    bs: "Spor odgovor servera",
    sr: "Spor odgovor servera",
  },
  "heavy-page": {
    de: "Sehr große Seite – bremst die Ladezeit",
    en: "Very heavy page – slows down loading",
    hr: "Vrlo velika stranica – usporava učitavanje",
    bs: "Vrlo velika stranica – usporava učitavanje",
    sr: "Vrlo velika stranica – usporava učitavanje",
  },
};
