/**
 * Arbeitstag-Logik für fälligkeitsnahe Erinnerungen.
 *
 * Ein Arbeitstag ist Montag–Freitag und kein gesetzlicher Feiertag. Die Feiertage
 * werden als ISO-Daten-Set übergeben (siehe lib/holidays.ts), damit diese Funktionen
 * rein und gut testbar bleiben.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function assertIso(value: string): void {
  if (!ISO_DATE.test(value)) {
    throw new Error(`Ungültiges Datum (erwartet JJJJ-MM-TT): ${value}`);
  }
}

function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + days * 86_400_000).toISOString().slice(0, 10);
}

/** Samstag oder Sonntag. */
export function isWeekend(isoDate: string): boolean {
  assertIso(isoDate);
  const day = new Date(`${isoDate}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

/** Montag–Freitag und kein Feiertag aus dem übergebenen Set. */
export function isWorkday(isoDate: string, holidays: ReadonlySet<string>): boolean {
  return !isWeekend(isoDate) && !holidays.has(isoDate);
}

/**
 * Letzter Arbeitstag am oder vor dem gegebenen Datum.
 * Fällt das Datum selbst auf einen Arbeitstag, wird es unverändert zurückgegeben.
 * Bei Wochenende/Feiertag wird so weit zurückgegangen, bis ein Arbeitstag erreicht ist.
 */
export function lastWorkdayOnOrBefore(isoDate: string, holidays: ReadonlySet<string>): string {
  assertIso(isoDate);
  let cursor = isoDate;
  // 14 Tage Sicherheitsobergrenze: selbst Feiertagsbrücken über Jahreswechsel sind kürzer.
  for (let step = 0; step < 14; step += 1) {
    if (isWorkday(cursor, holidays)) return cursor;
    cursor = addDays(cursor, -1);
  }
  return cursor;
}
