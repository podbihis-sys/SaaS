/**
 * Gesetzliche Feiertage in Deutschland — bundesweit plus landesspezifisch.
 *
 * Es werden ausschließlich LANDESWEIT geltende gesetzliche Feiertage abgebildet.
 * Rein kommunale Feiertage (z. B. Augsburger Friedensfest, Fronleichnam/Mariä
 * Himmelfahrt nur in einzelnen Gemeinden) bleiben bewusst außen vor, damit eine
 * Erinnerung nie fälschlich als "arbeitsfrei" eingestuft wird, wo tatsächlich
 * gearbeitet wird.
 *
 * Ohne Bundesland werden nur die neun bundesweiten Feiertage berücksichtigt —
 * diese sind in allen 16 Ländern arbeitsfrei und damit ein sicherer Standard.
 */

export const BUNDESLAND_CODES = [
  "BW",
  "BY",
  "BE",
  "BB",
  "HB",
  "HH",
  "HE",
  "MV",
  "NI",
  "NW",
  "RP",
  "SL",
  "SN",
  "ST",
  "SH",
  "TH",
] as const;

export type Bundesland = (typeof BUNDESLAND_CODES)[number];

export const BUNDESLAENDER: ReadonlyArray<{ code: Bundesland; name: string }> = [
  { code: "BW", name: "Baden-Württemberg" },
  { code: "BY", name: "Bayern" },
  { code: "BE", name: "Berlin" },
  { code: "BB", name: "Brandenburg" },
  { code: "HB", name: "Bremen" },
  { code: "HH", name: "Hamburg" },
  { code: "HE", name: "Hessen" },
  { code: "MV", name: "Mecklenburg-Vorpommern" },
  { code: "NI", name: "Niedersachsen" },
  { code: "NW", name: "Nordrhein-Westfalen" },
  { code: "RP", name: "Rheinland-Pfalz" },
  { code: "SL", name: "Saarland" },
  { code: "SN", name: "Sachsen" },
  { code: "ST", name: "Sachsen-Anhalt" },
  { code: "SH", name: "Schleswig-Holstein" },
  { code: "TH", name: "Thüringen" },
];

const pad = (n: number) => String(n).padStart(2, "0");

function iso(year: number, month1: number, day: number): string {
  return `${year}-${pad(month1)}-${pad(day)}`;
}

function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + days * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Ostersonntag nach dem anonymen gregorianischen Algorithmus (Meeus/Jones/Butcher).
 * Liefert das Datum als ISO-String (JJJJ-MM-TT).
 */
export function easterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = März, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return iso(year, month, day);
}

/**
 * Buß- und Bettag: der Mittwoch vor dem 23. November (liegt im Fenster 16.–22. November).
 */
function bussUndBettag(year: number): string {
  let candidate = iso(year, 11, 22);
  // Rückwärts laufen bis Mittwoch (UTC-Wochentag 3).
  while (new Date(`${candidate}T00:00:00Z`).getUTCDay() !== 3) {
    candidate = addDays(candidate, -1);
  }
  return candidate;
}

function normalizeRegion(region?: string | null): Bundesland | null {
  if (region && (BUNDESLAND_CODES as readonly string[]).includes(region)) {
    return region as Bundesland;
  }
  return null;
}

/**
 * Alle landesweit arbeitsfreien gesetzlichen Feiertage eines Jahres als ISO-Daten-Set.
 * `region` (Bundesland-Code) ergänzt die landesspezifischen Feiertage; ohne/unbekannt
 * werden nur die bundesweiten neun Feiertage geliefert.
 */
export function germanHolidays(year: number, region?: string | null): Set<string> {
  const easter = easterSunday(year);
  const result = new Set<string>([
    iso(year, 1, 1), // Neujahr
    addDays(easter, -2), // Karfreitag
    addDays(easter, 1), // Ostermontag
    iso(year, 5, 1), // Tag der Arbeit
    addDays(easter, 39), // Christi Himmelfahrt
    addDays(easter, 50), // Pfingstmontag
    iso(year, 10, 3), // Tag der Deutschen Einheit
    iso(year, 12, 25), // 1. Weihnachtstag
    iso(year, 12, 26), // 2. Weihnachtstag
  ]);

  const code = normalizeRegion(region);
  if (!code) return result;

  const fronleichnam = addDays(easter, 60);
  const heiligeDreiKoenige = iso(year, 1, 6);
  const frauentag = iso(year, 3, 8);
  const mariaeHimmelfahrt = iso(year, 8, 15);
  const weltkindertag = iso(year, 9, 20);
  const reformationstag = iso(year, 10, 31);
  const allerheiligen = iso(year, 11, 1);

  const add = (date: string) => result.add(date);

  if (["BW", "BY", "ST"].includes(code)) add(heiligeDreiKoenige);
  if (["BE", "MV"].includes(code)) add(frauentag);
  if (["BW", "BY", "HE", "NW", "RP", "SL"].includes(code)) add(fronleichnam);
  if (code === "SL") add(mariaeHimmelfahrt);
  if (code === "TH") add(weltkindertag);
  if (["BB", "HB", "HH", "MV", "NI", "SN", "ST", "SH", "TH"].includes(code)) add(reformationstag);
  if (["BW", "BY", "NW", "RP", "SL"].includes(code)) add(allerheiligen);
  if (code === "SN") add(bussUndBettag(year));

  return result;
}

/**
 * Feiertage über mehrere Jahre zusammenführen — praktisch für Jahreswechsel-Fenster
 * (z. B. Fälligkeit Anfang Januar, Rückrechnung in den Dezember des Vorjahres).
 */
export function germanHolidaysForYears(years: number[], region?: string | null): Set<string> {
  const all = new Set<string>();
  for (const year of years) {
    for (const date of germanHolidays(year, region)) all.add(date);
  }
  return all;
}
