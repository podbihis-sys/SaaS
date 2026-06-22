/**
 * Hilfsfunktionen für SEO-konforme <title>- und Meta-Description-Längen.
 * Semrush/Google: Title ≲ 580 px (~60 Zeichen), Description ≲ 160 Zeichen.
 */

export const BRAND = "BIT Bierther GmbH";

const TITLE_MAX = 55;
const DESC_MAX = 148;

/** Kürzt am Wortende und hängt bei Bedarf ein Auslassungszeichen an. */
export function clampText(input: string, max: number): string {
  const s = (input ?? "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  const base = sp > max * 0.55 ? cut.slice(0, sp) : cut;
  return base.replace(/[\s.,;:–-]+$/u, "") + "…";
}

/**
 * Baut einen Seitentitel mit optionalem Marken-Suffix und hält dabei die
 * Pixelgrenze ein. `core` sollte schon „sprechend“ sein (siehe Aufrufer, die
 * sehr kurze Produktnamen vorab mit Kategorie anreichern).
 */
export function seoTitle(core: string, opts: { brand?: boolean } = {}): string {
  const c = (core ?? "").replace(/\s+/g, " ").trim().replace(/[\s:.]+$/u, "");
  if (opts.brand) {
    const full = `${c} · ${BRAND}`;
    if (full.length <= TITLE_MAX + 4) return full;
  }
  return clampText(c, TITLE_MAX);
}

/** Kürzt eine Meta-Description auf eine suchmaschinenfreundliche Länge. */
export function clampDesc(input: string, max: number = DESC_MAX): string {
  return clampText(input, max);
}

/**
 * Baut die H1 einer Produktseite. Sehr kurze Namen werden mit Kategorie bzw.
 * Tagline angereichert, damit die H1 sprechend ist. Wird sowohl in der Seite
 * (sichtbare H1) als auch in der Metadaten-Funktion (Dedup gegen den Title)
 * verwendet, damit beide garantiert konsistent sind.
 */
export function productH1(name: string, categoryName?: string, tagline?: string): string {
  const n = (name ?? "").trim();
  const short = n.length < 28 || n.split(/\s+/).length < 3;
  if (!short) return n;
  const catWord = categoryName ? categoryName.toLowerCase().replace(/e?n$/u, "") : "";
  if (categoryName && catWord && !n.toLowerCase().includes(catWord)) return `${n} – ${categoryName}`;
  const tag = (tagline ?? "").trim();
  if (tag && !n.toLowerCase().includes(tag.toLowerCase().slice(0, 6))) return `${n} – ${tag}`;
  return categoryName ? `${n} – ${categoryName}` : n;
}

/**
 * Stellt sicher, dass der Seitentitel nicht identisch mit der H1 ist
 * (Seobility/Semrush: „Duplicate content in h1 and title"). Bei Kollision wird
 * der Marken-Suffix angehängt und der Title dabei ≤ 60 Zeichen gehalten.
 */
export function distinctTitle(title: string, h1: string): string {
  const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
  if (norm(title) !== norm(h1)) return title;
  return `${clampText(title, 60 - (BRAND.length + 3))} · ${BRAND}`;
}
