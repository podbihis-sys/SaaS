/**
 * Rental price calculation (prompt §10).
 *
 * Day-granular, inclusive of both the start and end day:
 *   days = (endDate - startDate) in whole days + 1
 *
 * This is a PURE function with no I/O so it can be unit-tested in isolation and
 * kept consistent with the DB-side computation in create_booking_hold().
 */

export interface CalcRentalPriceInput {
  pricePerDay: number;
  depositAmount: number;
  /** ISO date string (YYYY-MM-DD) or Date — the day-of granularity is what matters. */
  startDate: string | Date;
  endDate: string | Date;
  quantity?: number;
}

export interface CalcRentalPriceResult {
  days: number;
  rentalTotal: number;
  depositTotal: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parse to a UTC midnight timestamp so DST / timezones never shift the day count. */
function toUtcDay(value: string | Date): number {
  if (value instanceof Date) {
    return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid date: ${value}`);
  }
  const [, y, m, d] = match;
  return Date.UTC(Number(y), Number(m) - 1, Number(d));
}

/** Round to 2 decimals, avoiding binary floating-point drift (e.g. 0.1 + 0.2). */
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calcRentalPrice(input: CalcRentalPriceInput): CalcRentalPriceResult {
  const quantity = input.quantity ?? 1;
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(`Invalid quantity: ${input.quantity}`);
  }
  if (input.pricePerDay < 0 || input.depositAmount < 0) {
    throw new Error("pricePerDay and depositAmount must be non-negative");
  }

  const start = toUtcDay(input.startDate);
  const end = toUtcDay(input.endDate);
  if (end < start) {
    throw new Error("endDate must not be before startDate");
  }

  const days = Math.round((end - start) / MS_PER_DAY) + 1; // inclusive of both days
  const rentalTotal = round2(days * input.pricePerDay * quantity);
  const depositTotal = round2(input.depositAmount * quantity);

  return { days, rentalTotal, depositTotal };
}
