// Strukturierte Produktattribute, abgeleitet aus den (auto-generierten) Feldern
// in catalog.ts. Hier liegt die Logik für Produktfilter und die SEO-Landingpages,
// damit catalog.ts unangetastet bleibt (wird vom Scraper neu erzeugt).

import { CATEGORIES, PRODUCTS, type CategoryId, type Product } from "./catalog";

export type Wall = "dünnwandig" | "mittelwandig" | "dickwandig";

/** Wert einer technischen Zeile (label-unabhängig von Groß-/Kleinschreibung). */
export function techValue(p: Product, label: string): string | undefined {
  return p.tech.find((t) => t.label.toLowerCase() === label.toLowerCase())?.value;
}

/** Durchsuchbarer Text aus allen relevanten Feldern eines Produkts. */
function haystack(p: Product): string {
  return [
    p.material,
    p.name,
    p.description,
    techValue(p, "Besonderheiten") ?? "",
    ...p.features,
  ]
    .join(" ")
    .toLowerCase();
}

/** Wandstärke (dünn-/mittel-/dickwandig), sofern erkennbar. */
export function wallType(p: Product): Wall | null {
  const h = haystack(p);
  if (h.includes("dünnwandig")) return "dünnwandig";
  if (h.includes("mittelwandig")) return "mittelwandig";
  if (h.includes("dickwandig")) return "dickwandig";
  return null;
}

/** Schrumpfrate als Zahl (z. B. 3 für "3:1") + Anzeigelabel ("3:1"). */
export function shrinkRatio(p: Product): { value: number; label: string } | null {
  const raw = techValue(p, "Schrumpfrate");
  if (!raw) return null;
  const m = raw.match(/(\d+(?:[.,]\d+)?)\s*:\s*1/);
  const ratio = m?.[1];
  if (!ratio) return null;
  const value = parseFloat(ratio.replace(",", "."));
  if (Number.isNaN(value)) return null;
  return { value, label: `${ratio.replace(".", ",")}:1` };
}

/** Kleberbeschichtet / mit Innenkleber? */
export function hasAdhesive(p: Product): boolean {
  return /kleber/.test(haystack(p));
}

function parseNumber(s: string | undefined): number | null {
  if (!s) return null;
  const m = s.replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  const hit = m?.[0];
  return hit ? parseFloat(hit) : null;
}

/** Maximale Einsatztemperatur in °C. */
export function maxTemp(p: Product): number | null {
  const fromTech = parseNumber(techValue(p, "Betriebstemperatur max."));
  if (fromTech != null) return fromTech;
  if (p.temperature) {
    const afterBis = p.temperature.split(/bis/i)[1];
    return parseNumber(afterBis);
  }
  return null;
}

/** Innendurchmesser-Bereich (mm). */
export function diameterRange(p: Product): { min: number; max: number } | null {
  const min = parseNumber(techValue(p, "Durchmesser innen von (mm)"));
  const max = parseNumber(techValue(p, "Durchmesser innen bis (mm)"));
  if (min == null || max == null) return null;
  return { min, max };
}

/** mm-Zahl hübsch formatieren: 1,5 / 50 (deutsches Komma, ohne ",0"). */
export function formatMm(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1).replace(/\.0$/, "").replace(".", ",");
}

/** "Ø 1,5 – 50 mm" für die Produktkarte. */
export function diameterLabel(p: Product): string | null {
  const range = diameterRange(p);
  if (!range) return null;
  return `Ø ${formatMm(range.min)} – ${formatMm(range.max)} mm`;
}

// ---------------------------------------------------------------- Werkstoffe
/** Kanonische Werkstoffgruppen für den Material-Filter. */
export const MATERIAL_GROUPS = [
  "Polyolefin",
  "PVC",
  "Silikon",
  "PTFE",
  "FEP",
  "PVDF",
  "Elastomer",
  "PEEK",
] as const;
export type MaterialGroup = (typeof MATERIAL_GROUPS)[number];

/** Ordnet das (teils zusammengesetzte) Material einer Gruppe zu. */
export function materialGroups(p: Product): MaterialGroup[] {
  const m = `${p.material} ${techValue(p, "Werkstoff") ?? ""}`.toLowerCase();
  const out: MaterialGroup[] = [];
  for (const g of MATERIAL_GROUPS) {
    const needle = g.toLowerCase();
    if (g === "Silikon") {
      if (m.includes("silikon") || m.includes("vmq")) out.push(g);
    } else if (m.includes(needle)) {
      out.push(g);
    }
  }
  return out;
}

// ----------------------------------------------------------- SEO-Landingpages
export interface Taxon {
  slug: string;
  label: string;
  intro: string;
  products: Product[];
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/&/g, "und")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Kuratierte Eigenschaften mit Matcher + SEO-Einleitungstext. */
const PROPERTY_DEFS: { slug: string; label: string; match: RegExp; intro: string }[] = [
  {
    slug: "halogenfrei",
    label: "Halogenfrei",
    match: /halogenfrei/,
    intro:
      "Halogenfreie Schrumpf- und Isolierschläuche entwickeln im Brandfall keine korrosiven oder giftigen Gase und sind damit ideal für Anwendungen mit erhöhten Anforderungen an Personen- und Anlagenschutz – etwa im Schienenverkehr, in Gebäuden und in der Bahntechnik.",
  },
  {
    slug: "duennwandig",
    label: "Dünnwandig",
    match: /dünnwandig/,
    intro:
      "Dünnwandige Schrumpfschläuche bieten platzsparende, flexible Isolation bei niedriger Schrumpftemperatur – die richtige Wahl für die elektrische Isolation und Aderkennzeichnung von Leitungen und Steckverbindern.",
  },
  {
    slug: "mittelwandig",
    label: "Mittelwandig",
    match: /mittelwandig/,
    intro:
      "Mittelwandige Schrumpfschläuche verbinden gute Flexibilität mit erhöhtem mechanischem Schutz und eignen sich für Zugentlastung, Bündelung und den Schutz von Verbindungen in anspruchsvollen Umgebungen.",
  },
  {
    slug: "dickwandig",
    label: "Dickwandig",
    match: /dickwandig/,
    intro:
      "Dickwandige Schrumpfschläuche bieten maximalen mechanischen Schutz und Robustheit – oft mit Innenkleber für eine feuchtigkeits- und korrosionsdichte Abdichtung von Kabelverbindungen.",
  },
  {
    slug: "kleberbeschichtet",
    label: "Kleberbeschichtet (mit Innenkleber)",
    match: /kleber/,
    intro:
      "Kleberbeschichtete Schrumpfschläuche verfügen über einen thermoplastischen Schmelzkleber, der beim Schrumpfen aktiviert wird und eine feuchtigkeits- und korrosionsdichte Abdichtung erzeugt – perfekt für die Abdichtung von Kabelbäumen und Steckverbindungen.",
  },
  {
    slug: "flammhemmend",
    label: "Flammhemmend",
    match: /flammhemmend|schwer entflammbar|selbstverlöschend/,
    intro:
      "Flammhemmende und schwer entflammbare Schrumpfschläuche reduzieren die Brandausbreitung und erfüllen die Sicherheitsanforderungen in Automotive, Elektronik und Anlagenbau.",
  },
  {
    slug: "ul-zugelassen",
    label: "UL-zugelassen",
    match: /ul-zugelassen|ul 224|ul224|ul-224/,
    intro:
      "UL-zugelassene Schrumpfschläuche (u. a. nach UL 224) sind unabhängig geprüft und dokumentiert – Voraussetzung für viele internationale und sicherheitsrelevante Anwendungen.",
  },
  {
    slug: "hochtemperaturbestaendig",
    label: "Hochtemperaturbeständig",
    match: /hohe temperaturbeständigkeit|hochtemperatur/,
    intro:
      "Hochtemperaturbeständige Schläuche aus z. B. PTFE, FEP oder PEEK halten dauerhaft hohen Betriebstemperaturen stand und werden in Luft- und Raumfahrt, Medizintechnik und im Motorraum eingesetzt.",
  },
  {
    slug: "uv-bestaendig",
    label: "UV-beständig",
    match: /uv-beständig/,
    intro:
      "UV-beständige Schrumpfschläuche behalten ihre mechanischen Eigenschaften auch im Außeneinsatz und unter dauerhafter Sonneneinstrahlung – ideal für Photovoltaik und Außenverkabelung.",
  },
  {
    slug: "chemisch-bestaendig",
    label: "Chemisch beständig",
    match: /chemische beständigkeit|säurebeständig|dieselbeständig|antiadhäsiv/,
    intro:
      "Chemisch beständige Schläuche widerstehen aggressiven Medien wie Säuren, Kraftstoffen und Lösungsmitteln und schützen Bauteile zuverlässig in Industrie, Chemie und Automotive.",
  },
];

let propertyCache: Taxon[] | null = null;
export function propertyTaxa(): Taxon[] {
  if (propertyCache) return propertyCache;
  propertyCache = PROPERTY_DEFS.map((d) => ({
    slug: d.slug,
    label: d.label,
    intro: d.intro,
    products: PRODUCTS.filter((p) => d.match.test(haystack(p))),
  })).filter((t) => t.products.length > 0);
  return propertyCache;
}

export function getPropertyTaxon(slug: string): Taxon | undefined {
  return propertyTaxa().find((t) => t.slug === slug);
}

let applicationCache: Taxon[] | null = null;
export function applicationTaxa(): Taxon[] {
  if (applicationCache) return applicationCache;
  const map = new Map<string, Product[]>();
  for (const p of PRODUCTS) {
    for (const a of p.applications) {
      const list = map.get(a) ?? [];
      list.push(p);
      map.set(a, list);
    }
  }
  applicationCache = [...map.entries()]
    // Nur Anwendungen mit ≥ 2 Produkten -> keine dünnen, fast leeren Seiten.
    .filter(([, products]) => products.length >= 2)
    .map(([label, products]) => ({
      slug: slugify(label),
      label,
      intro: `${label}: Entdecken Sie alle Schrumpf-, Isolier- und Geflechtschläuche von BIT, die sich besonders für „${label}" eignen – mit allen verfügbaren Größen direkt anfragbar.`,
      products,
    }));
  return applicationCache;
}

export function getApplicationTaxon(slug: string): Taxon | undefined {
  return applicationTaxa().find((t) => t.slug === slug);
}

/** Findet die passende Eigenschafts-Themenseite zu einem Feature-/Textwert. */
export function propertyTaxonForText(text: string): Taxon | undefined {
  const t = text.toLowerCase();
  const def = PROPERTY_DEFS.find((d) => d.match.test(t));
  return def ? getPropertyTaxon(def.slug) : undefined;
}

export interface CategoryFacet {
  id: CategoryId;
  name: string;
  count: number;
}

/** Kategorien (mit Anzahl), in denen die übergebenen Produkte vorkommen. */
export function categoriesForProducts(products: Product[]): CategoryFacet[] {
  const counts = new Map<CategoryId, number>();
  for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  return CATEGORIES.filter((c) => counts.has(c.id)).map((c) => ({
    id: c.id,
    name: c.name,
    count: counts.get(c.id) ?? 0,
  }));
}

// ------------------------------------------------------------- Material-Taxa
let materialCache: Taxon[] | null = null;
export function materialTaxa(): Taxon[] {
  if (materialCache) return materialCache;
  materialCache = MATERIAL_GROUPS.map((g) => ({
    slug: slugify(g),
    label: g,
    intro: `Schrumpf-, Isolier- und Geflechtschläuche aus ${g} von BIT Bierther GmbH. ${g} überzeugt mit spezifischen mechanischen, thermischen und chemischen Eigenschaften – hier finden Sie alle ${g}-Artikel aus dem Sortiment, mit allen verfügbaren Größen direkt anfragbar.`,
    products: PRODUCTS.filter((p) => materialGroups(p).includes(g)),
  })).filter((t) => t.products.length > 0);
  return materialCache;
}

export function getMaterialTaxon(slug: string): Taxon | undefined {
  return materialTaxa().find((t) => t.slug === slug);
}

// ---------------------------------------------------------- Schrumpfraten-Taxa
let shrinkCache: Taxon[] | null = null;
export function shrinkTaxa(): Taxon[] {
  if (shrinkCache) return shrinkCache;
  const map = new Map<number, { label: string; products: Product[] }>();
  for (const p of PRODUCTS) {
    const s = shrinkRatio(p);
    if (!s) continue;
    const entry = map.get(s.value) ?? { label: s.label, products: [] };
    entry.products.push(p);
    map.set(s.value, entry);
  }
  shrinkCache = [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, e]) => ({
      slug: slugify(e.label),
      label: e.label,
      intro: `Schrumpfschläuche mit Schrumpfrate ${e.label} von BIT Bierther GmbH. Eine Schrumpfrate von ${e.label} bedeutet, dass sich der Schlauch beim Erwärmen auf einen Bruchteil seines Ausgangsdurchmessers zusammenzieht – ideal für das Ummanteln großer Durchmesserunterschiede. Hier alle Artikel mit ${e.label}.`,
      products: e.products,
    }))
    // Nur Raten mit ≥ 2 Produkten -> keine dünnen Seiten.
    .filter((t) => t.products.length >= 2);
  return shrinkCache;
}

export function getShrinkTaxon(slug: string): Taxon | undefined {
  return shrinkTaxa().find((t) => t.slug === slug);
}

// ------------------------------------------------------------ Kategorie-Taxa
// Indexierbare Kategorie-Landingpages für die volumenstärksten Head-Terms
// (z. B. „Schrumpfschlauch", „Wellrohr", „Kabelbinder"). Keyword-reiche,
// einzigartige Einleitungen – bewusst nicht aus catalog.ts (auto-generiert).
const CATEGORY_INTROS: Partial<Record<CategoryId, string>> = {
  schrumpfschlauch:
    "Schrumpfschläuche von BIT aus Polyolefin, PVC, PTFE, FEP, Kynar® (PVDF) und Silikon – halogenfrei, mit Kleber bzw. Innenkleber, dünnwandig oder dickwandig, transparent und farbig (schwarz, rot, blau, gelb, grün-gelb). Erhältlich in den Schrumpfraten 2:1, 3:1 und 4:1 und in Innendurchmessern von 1,5 bis über 100 mm – als Meterware, auf Rolle oder im Set. Alle Größen direkt anfragbar.",
  isolierschlauch:
    "Isolierschläuche und Bougierrohre aus PVC, Silikon, PTFE, FEP, Polyamid, PE, PUR und Viton® für die elektrische Isolation und den mechanischen Schutz von Leitungen – temperaturbeständig, flexibel und in vielen Innendurchmessern. Standardware in der Regel innerhalb von 24 Stunden lieferbar.",
  glasseidenschlauch:
    "Glasseidenschläuche mit PUR-, Acrylharz- oder Silikonbeschichtung sowie unbeschichtet – für die elektrische Isolation bei hohen thermischen Belastungen in Motoren, Transformatoren und Heizgeräten.",
  geflechtschlauch:
    "Geflechtschläuche aus Polyamid, Polypropylen und Polyester für zuverlässigen Kabelschutz und saubere Kabelbündelung – abriebfest, flexibel und teils selbstverlöschend. Ideal zum Bündeln und Schützen ganzer Leitungsstränge.",
  wellrohr:
    "Wellrohre geschlitzt und ungeschlitzt aus PP, PA6, PFA und TPE – flexibler, schlagfester Kabelschutz für Maschinenbau, Automotive und Elektroinstallation. Das geschlitzte Wellrohr lässt sich nachträglich über bereits konfektionierte Leitungen aufbringen.",
  kabelbinder:
    "Kabelbinder in vielen Ausführungen: UV-beständig (schwarz), wiederverschließbar, mit Metallzunge, aus Edelstahl sowie Klettkabelbinder. Für die dauerhafte Bündelung und Befestigung von Kabeln im Innen- und Außenbereich.",
  verarbeitungsgeraete:
    "Verarbeitungsgeräte für Schrumpf- und Isolierschläuche: Heißluftgebläse, Heißschneidegeräte zum thermischen Ablängen, Kabelbinder-Spannwerkzeuge und serientaugliche Schrumpfanlagen.",
  "weitere-produkte":
    "Weitere Produkte rund um Kabelbündelung, -befestigung und -verbindung: Spiralbänder, Löt- und Quetschverbinder mit Schrumpfschlauchisolation sowie Endkappen und Tauchkappen.",
  kantenclips:
    "Solar- und Kantenclips zur schnellen, werkzeuglosen Befestigung von Leitungen an Blechkanten und Modulrahmen – besonders für die Photovoltaik-Montage.",
};

export interface CategoryTaxon extends Taxon {
  id: CategoryId;
}

let categoryCache: CategoryTaxon[] | null = null;
export function categoryTaxa(): CategoryTaxon[] {
  if (categoryCache) return categoryCache;
  categoryCache = CATEGORIES.map((c) => ({
    id: c.id,
    slug: c.id,
    label: c.name,
    intro: CATEGORY_INTROS[c.id] ?? c.description,
    products: PRODUCTS.filter((p) => p.category === c.id),
  })).filter((t) => t.products.length > 0);
  return categoryCache;
}

export function getCategoryTaxon(slug: string): CategoryTaxon | undefined {
  return categoryTaxa().find((t) => t.slug === slug);
}
