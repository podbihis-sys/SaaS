/**
 * Hilfsfunktionen für SEO-konforme <title>- und Meta-Description-Längen.
 * Semrush/Google: Title ≲ 580 px (~60 Zeichen), Description ≲ 160 Zeichen.
 */

export const BRAND = "BIT Bierther GmbH";

const TITLE_MAX = 60;
const DESC_MAX = 155;

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
