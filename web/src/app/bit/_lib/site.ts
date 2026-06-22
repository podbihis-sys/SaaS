/**
 * Basis-URL der Seite für Canonicals, Sitemap, OpenGraph-URLs und JSON-LD.
 *
 * Auflösungsreihenfolge:
 *  1. NEXT_PUBLIC_SITE_URL          – expliziter Override (z. B. https://www.bit-gmbh.de)
 *  2. Vercel-Produktion             – VERCEL_PROJECT_PRODUCTION_URL (stabile Prod-Domain)
 *  3. Vercel-Preview/Branch         – VERCEL_URL (deployment-eigene URL)
 *  4. http://localhost:3000         – lokale Entwicklung
 *
 * So sind Canonicals immer selbst-referenzierend auf der tatsächlich
 * ausgelieferten Domain. Das behebt den Seobility-Fehler „Canonical link →
 * External domain", wenn ein Vercel-(Preview-)Deployment gecrawlt wird, ohne
 * die Produktion zu gefährden (dort greift Schritt 1 oder 2).
 *
 * Hinweis: VERCEL_*-Variablen sind nur serverseitig verfügbar – diese Konstante
 * darf daher nur in Server-Komponenten / Metadata-Funktionen verwendet werden.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
