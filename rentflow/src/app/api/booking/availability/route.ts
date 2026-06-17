import { NextRequest } from "next/server";
import { checkAvailability, BookingError } from "@/lib/booking/engine";
import { availabilitySchema } from "@/lib/validation";
import { badRequest, json, serverError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/booking/availability → { available, requested, ok } */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Ungültiger Request-Body");
  }

  const parsed = availabilitySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validierungsfehler", parsed.error.flatten());
  }

  const { item_id, start_date, end_date, quantity } = parsed.data;
  try {
    const available = await checkAvailability(item_id, start_date, end_date);
    return json({ available, requested: quantity, ok: available >= quantity });
  } catch (err) {
    if (err instanceof BookingError) return badRequest(err.code);
    console.error("availability error", err);
    return serverError();
  }
}
