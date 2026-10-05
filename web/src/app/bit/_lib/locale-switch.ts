/**
 * Ordnet jeder Seite ihr Gegenstück in der anderen Sprache zu, damit der
 * Sprachumschalter (DE ⇄ EN) auf der AKTUELLEN Seite bleibt statt auf die
 * Startseite zu springen.
 *
 * Die Pfadsegmente unterscheiden sich zwischen DE und EN (kein reiner
 * Präfix-Tausch), deshalb eine explizite Paar-Tabelle für die statischen
 * Seiten plus Muster-Regeln für die dynamischen Detailrouten, deren Slugs in
 * beiden Sprachen identisch sind (Produkte, News, Karriere).
 */

/** DE-Pfad ↔ EN-Pfad. Reihenfolge egal; beide Richtungen werden abgeleitet. */
const PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["/bit", "/bit/en"],
  ["/bit/produkte", "/bit/en/products"],
  ["/bit/kompetenzen", "/bit/en/competences"],
  ["/bit/news", "/bit/en/news"],
  ["/bit/kontakt", "/bit/en/contact"],
  ["/bit/karriere", "/bit/en/career"],
  ["/bit/nachhaltigkeit", "/bit/en/sustainability"],
  ["/bit/warenkorb", "/bit/en/cart"],
  ["/bit/impressum", "/bit/en/imprint"],
  ["/bit/datenschutz", "/bit/en/privacy-policy"],
  ["/bit/service", "/bit/en/service"],
  ["/bit/service/downloads", "/bit/en/service/downloads"],
  // Unternehmen / About
  ["/bit/die-bit", "/bit/en/about-bit"],
  ["/bit/die-bit/soziales-engagement", "/bit/en/about-bit/our-commitment-to-charity"],
  ["/bit/die-bit/accueil", "/bit/en/about-bit/accueil"],
  ["/bit/die-bit/chi-siamo", "/bit/en/about-bit/chi-siamo"],
  ["/bit/die-bit/inicio", "/bit/en/about-bit/inicio"],
  // Branchen ↔ Industrial Sectors
  ["/bit/branchen", "/bit/en/industrial-sectors"],
  [
    "/bit/branchen/energietechnik-erneuerbare-energien",
    "/bit/en/industrial-sectors/power-engineering-and-energy-management",
  ],
  ["/bit/branchen/automotive", "/bit/en/industrial-sectors/automotive"],
  ["/bit/branchen/hausgeraete", "/bit/en/industrial-sectors/home-and-household-appliances"],
  [
    "/bit/branchen/medizintechnik",
    "/bit/en/industrial-sectors/medical-technology-and-engineering",
  ],
  [
    "/bit/branchen/maschinen-und-anlagenbau",
    "/bit/en/industrial-sectors/mechanical-and-plant-engineering",
  ],
  [
    "/bit/branchen/licht-und-beleuchtungstechnik",
    "/bit/en/industrial-sectors/lighting-and-illumination",
  ],
  ["/bit/branchen/sicherheitstechnik", "/bit/en/industrial-sectors/safety-equipment-and-engineering"],
  // Marketing-Produktseiten mit abweichenden Slugs
  ["/bit/schrumpfschlauch-farbig", "/bit/en/coloured-heat-shrink-tubing"],
  ["/bit/schrumpfschlauch-bedruckt", "/bit/en/heat-shrink-tubing-printed"],
];

const DE_TO_EN = new Map<string, string>(PAIRS.map(([de, en]) => [de, en]));
const EN_TO_DE = new Map<string, string>(PAIRS.map(([de, en]) => [en, de]));

/** DE-Produkt-Facetten ohne EN-Pendant → auf die EN-Produktübersicht leiten. */
const DE_PRODUCT_FACETS = new Set(["anwendung", "eigenschaft", "material", "schrumpfrate"]);

function stripTrailingSlash(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

/**
 * Liefert den Pfad derselben Inhaltsseite in der jeweils anderen Sprache.
 * Für nicht zuordenbare Seiten wird auf die Startseite der Zielsprache
 * zurückgefallen.
 */
export function otherLocaleHref(pathname: string): string {
  const path = stripTrailingSlash(pathname);
  const english = path === "/bit/en" || path.startsWith("/bit/en/");

  if (english) {
    const mapped = EN_TO_DE.get(path);
    if (mapped) return mapped;
    const products = path.match(/^\/bit\/en\/products\/(.+)$/);
    if (products) return `/bit/produkte/${products[1] ?? ""}`;
    const news = path.match(/^\/bit\/en\/news\/(.+)$/);
    if (news) return `/bit/news/${news[1] ?? ""}`;
    const career = path.match(/^\/bit\/en\/career\/(.+)$/);
    if (career) return `/bit/karriere/${career[1] ?? ""}`;
    return "/bit";
  }

  const mapped = DE_TO_EN.get(path);
  if (mapped) return mapped;
  const products = path.match(/^\/bit\/produkte\/(.+)$/);
  if (products) {
    const rest = products[1] ?? "";
    const firstSegment = rest.split("/")[0] ?? "";
    if (DE_PRODUCT_FACETS.has(firstSegment)) return "/bit/en/products";
    return `/bit/en/products/${rest}`;
  }
  const news = path.match(/^\/bit\/news\/(.+)$/);
  if (news) return `/bit/en/news/${news[1] ?? ""}`;
  const career = path.match(/^\/bit\/karriere\/(.+)$/);
  if (career) return `/bit/en/career/${career[1] ?? ""}`;
  return "/bit/en";
}
