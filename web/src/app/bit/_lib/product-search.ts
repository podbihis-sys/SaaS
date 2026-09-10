import type { Product } from "../_data/catalog";
import { getCategory } from "../_data/catalog";
import { getRolls } from "../_data/rolls";
import { getPacks } from "../_data/packs";

/**
 * Produktsuche für die Katalogansicht.
 *
 * „Logische" Suche: Groß-/Kleinschreibung, Umlaute und Trennzeichen spielen
 * keine Rolle (BP125HV ↔ BP 125 HV), mehrere Wörter werden UND-verknüpft,
 * gängige Synonyme werden erkannt (Teflon ↔ PTFE, Kynar ↔ PVDF), und Treffer
 * werden nach Feld gewichtet: Typbezeichnung vor Produktname vor Material und
 * Eigenschaften vor Beschreibung.
 */

export function normalizeSearch(s: string): string {
  return s
    .toLowerCase()
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/(\d)\s*:\s*(\d)/g, "$1:$2")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.:/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Nur Buchstaben und Ziffern – für Typbezeichnungen wie „BP 125 HV". */
function compact(s: string): string {
  return normalizeSearch(s).replace(/[^a-z0-9]/g, "");
}

/** Schreibweisen, die Kunden gleichbedeutend verwenden (DE + EN). */
const SYNONYM_GROUPS: string[][] = [
  ["schrumpf", "shrink", "heatshrink", "heat shrink", "heat-shrink"],
  ["teflon", "ptfe"],
  ["kynar", "pvdf"],
  ["silikon", "silicone", "silicon"],
  ["glasseide", "glasfaser", "fiberglass", "fibreglass", "glass fibre"],
  ["geflecht", "braid", "braided"],
  ["wellrohr", "corrugated", "conduit"],
  ["kabelbinder", "cable tie", "cabletie"],
  ["kleber", "adhesive", "innenkleber", "hotmelt", "glue"],
  ["halogenfrei", "halogen free", "halogen-free"],
  ["endkappe", "end cap", "endcap"],
  ["isolierschlauch", "isolier", "insulating", "insulation"],
  ["duennwandig", "thin wall", "thin-wall"],
  ["dickwandig", "thick wall", "heavy wall"],
  ["transparent", "klar", "clear", "glasklar"],
  ["schwarz", "black"],
  ["weiss", "white"],
  ["rot", "red"],
  ["blau", "blue"],
  ["gelb", "yellow"],
  ["gruen", "green"],
  ["bedruckt", "printed", "beschriftet"],
  ["edelstahl", "stainless"],
  ["uv", "uv-bestaendig", "uv bestaendig"],
  ["lebensmittel", "food"],
  ["hitze", "hitzebestaendig", "heat resistant", "temperatur"],
].map((g) => g.map(normalizeSearch));

/** Ein Suchwort um seine Synonyme erweitern. */
function expand(token: string): string[] {
  const out = new Set([token]);
  for (const group of SYNONYM_GROUPS) {
    const hit = group.some(
      (m) =>
        m === token ||
        (m.length >= 4 && token.startsWith(m)) ||
        (token.length >= 4 && m.startsWith(token)),
    );
    if (hit) group.forEach((m) => out.add(m));
  }
  return [...out];
}

interface Field {
  text: string;
  weight: number;
}

export interface SearchEntry<T extends Product> {
  product: T;
  fields: Field[];
  compactCode: string;
  compactName: string;
}

/**
 * Suchindex einmal je Produktliste aufbauen (memoisieren!). `extra` liefert
 * zusätzliche, gleich hoch wie der Name gewichtete Texte – z. B. den
 * englischen Produktnamen.
 */
export function buildSearchIndex<T extends Product>(
  products: T[],
  extra?: (p: T) => string[],
): SearchEntry<T>[] {
  return products.map((p) => {
    const rolls = getRolls(p.slug);
    const packs = rolls ? undefined : getPacks(p.slug);
    const types = [...(rolls ?? []).map((r) => r.typ), ...(packs ?? []).map((k) => k.typ)].filter(
      (t): t is string => !!t,
    );
    const fields: Field[] = [
      { text: normalizeSearch(p.code), weight: 10 },
      { text: normalizeSearch(p.name), weight: 8 },
      { text: normalizeSearch((extra?.(p) ?? []).join(" ")), weight: 8 },
      { text: normalizeSearch(getCategory(p.category)?.name ?? p.category), weight: 5 },
      { text: normalizeSearch(p.material), weight: 5 },
      { text: normalizeSearch(p.tagline), weight: 4 },
      { text: normalizeSearch([...p.features, ...p.applications].join(" ")), weight: 3 },
      { text: normalizeSearch(p.tech.map((t) => `${t.label} ${t.value}`).join(" ")), weight: 3 },
      {
        text: normalizeSearch(
          [...p.sizes, ...types, ...(p.colors ?? []), p.temperature ?? ""].join(" "),
        ),
        weight: 3,
      },
      { text: normalizeSearch(p.description), weight: 1 },
    ].filter((f) => f.text.length > 0);
    return { product: p, fields, compactCode: compact(p.code), compactName: compact(p.name) };
  });
}

/** Treffer für eine Sucheingabe, nach Relevanz sortiert; leere Eingabe = alle. */
export function searchIndex<T extends Product>(index: SearchEntry<T>[], query: string): T[] {
  const q = normalizeSearch(query);
  if (q.length < 2) return index.map((e) => e.product);
  const tokens = q.split(" ").filter(Boolean).map(expand);
  const cq = compact(query);

  const scored: { product: T; score: number; i: number }[] = [];
  index.forEach((e, i) => {
    let score = 0;
    let all = true;
    for (const alts of tokens) {
      let best = 0;
      for (const f of e.fields) {
        if (f.weight > best && alts.some((a) => f.text.includes(a))) best = f.weight;
      }
      if (best === 0) {
        all = false;
        break;
      }
      score += best;
    }
    // Zusammengeschriebene Typbezeichnung („bp125hv") gegen Typ und Name.
    if (cq.length >= 2) {
      if (e.compactCode === cq) score += 60;
      else if (e.compactCode.startsWith(cq)) score += 40;
      else if (e.compactCode.includes(cq)) score += 25;
      else if (e.compactName.includes(cq)) score += 15;
      if (!all && (e.compactCode.includes(cq) || e.compactName.includes(cq))) all = true;
    }
    if (all && score > 0) scored.push({ product: e.product, score, i });
  });

  return scored.sort((a, b) => b.score - a.score || a.i - b.i).map((s) => s.product);
}
