/**
 * Seiten-Inhalts-CMS: editierbare Texte je Seite (Über uns, Kontakt, Qualität,
 * Startseite). Gespeichert als key/value in bit_content; öffentliche Seiten
 * lesen mit `c(map, key, fallback)` – fehlt ein Wert, gilt der eingebaute Text.
 */

export interface ContentField {
  key: string;
  label: string;
  page: string;
  multiline?: boolean;
}

export const CONTENT_FIELDS: ContentField[] = [
  // Startseite
  { key: "home.hero.badge", label: "Hero – Badge", page: "Startseite" },
  { key: "home.hero.title", label: "Hero – Überschrift", page: "Startseite" },
  { key: "home.hero.subtitle", label: "Hero – Untertext", page: "Startseite", multiline: true },
  { key: "home.cta.title", label: "Abschluss-CTA – Überschrift", page: "Startseite" },
  { key: "home.cta.text", label: "Abschluss-CTA – Text", page: "Startseite", multiline: true },
  // Über uns
  { key: "unternehmen.title", label: "Überschrift", page: "Über uns" },
  { key: "unternehmen.intro", label: "Einleitung", page: "Über uns", multiline: true },
  { key: "unternehmen.entwicklung", label: "Abschnitt „Unsere Entwicklung“", page: "Über uns", multiline: true },
  // Qualität
  { key: "qualitaet.title", label: "Überschrift", page: "Qualität" },
  { key: "qualitaet.intro", label: "Einleitung", page: "Qualität", multiline: true },
  // Kontakt
  { key: "kontakt.title", label: "Überschrift", page: "Kontakt" },
  { key: "kontakt.intro", label: "Einleitung", page: "Kontakt", multiline: true },
];

export type ContentMap = Record<string, string>;

/** Wert aus der Content-Map mit Fallback auf den eingebauten Text. */
export function c(map: ContentMap, key: string, fallback: string): string {
  const v = map[key];
  return v && v.trim() ? v : fallback;
}
