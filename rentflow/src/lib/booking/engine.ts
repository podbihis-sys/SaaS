import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import type { Booking } from "@/types/database";

/**
 * Server-side wrappers around the transactional booking RPCs (0003).
 * These run with the service role; the SQL functions enforce the invariant.
 */

export async function checkAvailability(
  itemId: string,
  startDate: string,
  endDate: string,
): Promise<number> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("check_availability", {
    p_item_id: itemId,
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) throw new BookingError(mapPgError(error), error.message);
  return data ?? 0;
}

export interface CreateHoldInput {
  itemId: string;
  startDate: string;
  endDate: string;
  quantity: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  holdMinutes?: number;
}

/**
 * Creates a pending booking hold transactionally. Throws BookingError with
 * code "not_available" when the slot is taken — callers should surface a 409.
 */
export async function createBookingHold(input: CreateHoldInput): Promise<Booking> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("create_booking_hold", {
    p_item_id: input.itemId,
    p_start_date: input.startDate,
    p_end_date: input.endDate,
    p_quantity: input.quantity,
    p_customer_name: input.customerName,
    p_customer_email: input.customerEmail,
    p_customer_phone: input.customerPhone ?? null,
    p_hold_minutes: input.holdMinutes ?? 15,
  });
  if (error) throw new BookingError(mapPgError(error), error.message);
  return data as unknown as Booking;
}

export type BookingErrorCode =
  | "not_available"
  | "invalid_date_range"
  | "invalid_quantity"
  | "item_not_found"
  | "item_inactive"
  | "unknown";

export class BookingError extends Error {
  constructor(
    public code: BookingErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "BookingError";
  }
}

/**
 * Map Postgres errors raised by the RPCs to typed codes. The unique-violation
 * (23505) and exclusion-violation (23P01) both mean the slot was taken — this
 * is the backstop EXCLUDE constraint firing when two writers race.
 */
function mapPgError(error: { code?: string; message?: string }): BookingErrorCode {
  const msg = error.message ?? "";
  if (error.code === "23P01" || error.code === "23505" || msg.includes("not_available")) {
    return "not_available";
  }
  if (msg.includes("invalid_date_range")) return "invalid_date_range";
  if (msg.includes("invalid_quantity")) return "invalid_quantity";
  if (msg.includes("item_not_found")) return "item_not_found";
  if (msg.includes("item_inactive")) return "item_inactive";
  return "unknown";
}
