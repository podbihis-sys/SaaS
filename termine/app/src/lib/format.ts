import type { ServiceCategory } from '@/api/types';

const WEEKDAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WEEKDAYS_LONG = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
];

/** Monday-first index, unlike `Date#getDay` which starts on Sunday. */
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

/**
 * Renders an instant in the office's timezone.
 *
 * Every appointment time in this app belongs to the place it is at. A user
 * on holiday in Lisbon must still read "09:15" for a 09:15 Berlin slot, so the
 * device's own timezone is never used for slot times.
 */
function partsInZone(iso: string, timeZone: string): Record<string, string> {
  const date = new Date(iso);
  const formatter = new Intl.DateTimeFormat('de-DE', {
    timeZone,
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    parts[part.type] = part.value;
  }
  return parts;
}

export function formatSlotDate(iso: string, timeZone: string): string {
  const p = partsInZone(iso, timeZone);
  return `${p.weekday}, ${p.day}.${p.month}.${p.year}`;
}

export function formatSlotTime(iso: string, timeZone: string): string {
  const p = partsInZone(iso, timeZone);
  return `${p.hour}:${p.minute} Uhr`;
}

export function formatSlotFull(iso: string, timeZone: string): string {
  const p = partsInZone(iso, timeZone);
  return `${p.weekday}, ${p.day}.${p.month}. um ${p.hour}:${p.minute} Uhr`;
}

/** "in 3 Tagen", "in 2 Std.", "gerade eben" — for freshness, not appointments. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const diffMs = new Date(iso).getTime() - now.getTime();
  const past = diffMs < 0;
  const minutes = Math.round(Math.abs(diffMs) / 60000);

  if (minutes < 1) return 'gerade eben';
  if (minutes < 60) return past ? `vor ${minutes} Min.` : `in ${minutes} Min.`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return past ? `vor ${hours} Std.` : `in ${hours} Std.`;

  const days = Math.round(hours / 24);
  if (days === 1) return past ? 'gestern' : 'morgen';
  return past ? `vor ${days} Tagen` : `in ${days} Tagen`;
}

export function formatDistance(km: number | null): string | null {
  if (km === null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace('.', ',')} km`;
}

/** Turns a weekday bitmask into "Mo–Fr", "Mo, Mi, Fr" or "täglich". */
export function formatWeekdayMask(mask: number): string {
  const days: number[] = [];
  for (let i = 0; i < 7; i += 1) {
    if (mask & (1 << i)) days.push(i);
  }
  if (days.length === 7) return 'täglich';
  if (days.length === 0) return 'nie';
  if (days.length === 5 && days.every((d) => d < 5)) return 'Mo–Fr';
  return days.map((d) => WEEKDAYS_SHORT[d]).join(', ');
}

export function weekdayLabel(index: number, long = false): string {
  return (long ? WEEKDAYS_LONG[index] : WEEKDAYS_SHORT[index]) ?? '';
}

/** "09:00:00" from the API becomes "09:00" on screen. */
export function trimSeconds(time: string | null): string | null {
  if (!time) return null;
  return time.slice(0, 5);
}

export function formatTimeWindow(from: string | null, to: string | null): string {
  const start = trimSeconds(from);
  const end = trimSeconds(to);
  if (start && end) return `${start}–${end} Uhr`;
  if (start) return `ab ${start} Uhr`;
  if (end) return `bis ${end} Uhr`;
  return 'ganztägig';
}

export function formatDateWindow(from: string | null, to: string | null): string {
  const fmt = (iso: string) => {
    const [year, month, day] = iso.split('-');
    return `${day}.${month}.${year}`;
  };
  if (from && to) return `${fmt(from)} – ${fmt(to)}`;
  if (from) return `ab ${fmt(from)}`;
  if (to) return `bis ${fmt(to)}`;
  return 'jederzeit';
}

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  anmeldung: 'Wohnsitz anmelden',
  abmeldung: 'Wohnsitz abmelden',
  ummeldung: 'Wohnsitz ummelden',
  personalausweis: 'Personalausweis',
  reisepass: 'Reisepass',
  fuehrungszeugnis: 'Führungszeugnis',
  meldebescheinigung: 'Meldebescheinigung',
  kfz_zulassung: 'KFZ-Zulassung',
  kfz_abmeldung: 'KFZ-Abmeldung',
  fuehrerschein: 'Führerschein',
  aufenthaltstitel: 'Aufenthaltstitel',
  verpflichtungserklaerung: 'Verpflichtungserklärung',
  eheschliessung: 'Eheschließung',
  geburtsurkunde: 'Urkunden',
  gewerbeanmeldung: 'Gewerbeanmeldung',
  beglaubigung: 'Beglaubigung',
  sonstiges: 'Sonstiges',
};

export function categoryLabel(category: ServiceCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}

/** ISO date (`2026-03-04`) in the device's own timezone, for date inputs. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
