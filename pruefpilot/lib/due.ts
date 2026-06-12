export type DueStatus = "overdue" | "due_30" | "due_60" | "ok";

export interface DueInfo {
  status: DueStatus;
  daysLeft: number;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

function parseIsoDate(value: string): number {
  const match = ISO_DATE.exec(value);
  if (!match) {
    throw new Error(`Ungültiges Datum (erwartet JJJJ-MM-TT): ${value}`);
  }
  const [, year, month, day] = match;
  const ms = Date.UTC(Number(year), Number(month) - 1, Number(day));
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== Number(year) ||
    check.getUTCMonth() !== Number(month) - 1 ||
    check.getUTCDate() !== Number(day)
  ) {
    throw new Error(`Kein gültiger Kalendertag: ${value}`);
  }
  return ms;
}

export function daysUntil(date: string, today: string): number {
  return Math.round((parseIsoDate(date) - parseIsoDate(today)) / DAY_MS);
}

/**
 * Überfällig = Fälligkeitsdatum liegt strikt in der Vergangenheit.
 * Am Stichtag selbst (daysLeft = 0) gilt das Gerät als "fällig", nicht als überfällig.
 */
export function dueStatus(nextDueDate: string, today: string): DueStatus {
  const daysLeft = daysUntil(nextDueDate, today);
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 30) return "due_30";
  if (daysLeft <= 60) return "due_60";
  return "ok";
}

export function dueInfo(nextDueDate: string, today: string): DueInfo {
  return {
    status: dueStatus(nextDueDate, today),
    daysLeft: daysUntil(nextDueDate, today),
  };
}

/**
 * Monatsarithmetik mit Monatsende-Klemmung:
 * 2026-01-31 + 1 Monat = 2026-02-28 (bzw. 29 im Schaltjahr).
 */
export function nextDueFrom(lastInspected: string, intervalMonths: number): string {
  if (!Number.isInteger(intervalMonths) || intervalMonths < 1 || intervalMonths > 120) {
    throw new Error(`Ungültiges Intervall (1–120 Monate): ${intervalMonths}`);
  }
  const match = ISO_DATE.exec(lastInspected);
  if (!match) {
    throw new Error(`Ungültiges Datum (erwartet JJJJ-MM-TT): ${lastInspected}`);
  }
  parseIsoDate(lastInspected);
  const year = Number(match[1]);
  const month0 = Number(match[2]) - 1;
  const day = Number(match[3]);

  const totalMonths = month0 + intervalMonths;
  const targetYear = year + Math.floor(totalMonths / 12);
  const targetMonth0 = totalMonths % 12;
  const lastDayOfTarget = new Date(Date.UTC(targetYear, targetMonth0 + 1, 0)).getUTCDate();
  const targetDay = Math.min(day, lastDayOfTarget);

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${targetYear}-${pad(targetMonth0 + 1)}-${pad(targetDay)}`;
}

/**
 * Heutiges Datum in deutscher Zeitzone (nicht UTC): zwischen 22:00 und 24:00 MESZ
 * wäre das UTC-Datum sonst einen Tag zurück — für Fälligkeitsgrenzen relevant.
 */
export function todayIso(timeZone = "Europe/Berlin"): string {
  // Das sv-SE-Locale formatiert nativ als JJJJ-MM-TT.
  return new Intl.DateTimeFormat("sv-SE", { timeZone }).format(new Date());
}
