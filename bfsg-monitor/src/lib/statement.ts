import { DISCLAIMERS, LAW, WCAG } from "./constants";

export type Conformance =
  | "weitgehend konform"
  | "teilweise konform"
  | "nicht konform";

export function conformanceFromScore(score: number | null | undefined): Conformance {
  if (score == null) return "nicht konform";
  if (score >= 90) return "weitgehend konform";
  if (score >= 50) return "teilweise konform";
  return "nicht konform";
}

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);
}

export interface StatementInput {
  companyName: string;
  contactEmail: string;
  url: string;
  knownLimitations: string;
  conformance: Conformance;
}

/** Builds a German "Erklärung zur Barrierefreiheit" draft (HTML). */
export function buildStatementHtml(input: StatementInput): string {
  const date = new Date().toLocaleDateString("de-DE");
  const company = esc(input.companyName);
  const email = esc(input.contactEmail);
  const url = esc(input.url);
  const limitations = input.knownLimitations.trim()
    ? `<p>${esc(input.knownLimitations)}</p>`
    : `<p>Es sind derzeit keine spezifischen nicht barrierefreien Inhalte dokumentiert.</p>`;

  return `
<article>
  <h1>Erklärung zur Barrierefreiheit</h1>
  <p>${company} ist bemüht, die Website <strong>${url}</strong> im Einklang mit dem
  ${LAW.name} barrierefrei zugänglich zu machen. Maßstab sind die Anforderungen
  nach ${WCAG.standard} Stufe ${WCAG.level} (EN 301 549).</p>

  <h2>Stand der Vereinbarkeit mit den Anforderungen</h2>
  <p>Diese Website ist aufgrund der nachstehend aufgeführten Punkte
  <strong>${input.conformance}</strong> mit ${WCAG.standard} ${WCAG.level}.</p>

  <h2>Nicht barrierefreie Inhalte</h2>
  ${limitations}
  <p>${DISCLAIMERS.automatedCoverage}</p>

  <h2>Erstellung dieser Erklärung</h2>
  <p>Diese Erklärung wurde am ${date} erstellt. Grundlage war eine automatisierte
  Prüfung mit BFSG-Monitor, ergänzt um Angaben des Betreibers.</p>

  <h2>Feedback und Kontakt</h2>
  <p>Mängel bei der Barrierefreiheit dieser Website können Sie melden an:
  <a href="mailto:${email}">${email}</a>.</p>

  <h2>Durchsetzungsverfahren</h2>
  <p>Sollten Sie auf Ihre Meldung keine zufriedenstellende Antwort erhalten,
  können Sie sich an die zuständige Schlichtungs- bzw. Durchsetzungsstelle wenden.</p>

  <hr />
  <p><em>${DISCLAIMERS.noLegalAdvice} Diese Erklärung ist ein automatisch
  generierter Entwurf und sollte vor der Veröffentlichung rechtlich geprüft
  werden.</em></p>
</article>`.trim();
}
