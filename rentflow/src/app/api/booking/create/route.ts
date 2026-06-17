import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createBookingHold, BookingError } from "@/lib/booking/engine";
import { getStripe, onConnectedAccount, applicationFeeAmount } from "@/lib/stripe/client";
import { bookingCreateSchema } from "@/lib/validation";
import { badRequest, conflict, json, serverError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * POST /api/booking/create
 * 1. Resolve the tenant by slug; require an onboarded, charge-enabled Connect acct.
 * 2. Create the pending hold TRANSACTIONALLY (create_booking_hold RPC, row lock).
 * 3. Only then create a Stripe Checkout session as a DIRECT CHARGE on the
 *    tenant's connected account (deposit + rental). Money never touches the
 *    platform (Guardrail #1). On payment, the Connect webhook confirms the booking.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Ungültiger Request-Body");
  }

  const parsed = bookingCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validierungsfehler", parsed.error.flatten());
  }
  const input = parsed.data;

  const supabase = createServiceClient();

  // 1. Resolve tenant + verify Connect readiness.
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, company_name, slug, stripe_connect_account_id, connect_charges_enabled")
    .eq("slug", input.slug)
    .maybeSingle();

  if (!profile) return badRequest("Betrieb nicht gefunden");
  if (!profile.stripe_connect_account_id || !profile.connect_charges_enabled) {
    return badRequest("Dieser Betrieb kann derzeit keine Zahlungen annehmen.");
  }

  // Item must belong to this tenant and be active.
  const { data: item } = await supabase
    .from("items")
    .select("id, name, user_id, active, price_per_day, deposit_amount")
    .eq("id", input.item_id)
    .eq("user_id", profile.user_id)
    .maybeSingle();

  if (!item || !item.active) return badRequest("Artikel nicht verfügbar");

  // 2. Transactional hold.
  let booking;
  try {
    booking = await createBookingHold({
      itemId: input.item_id,
      startDate: input.start_date,
      endDate: input.end_date,
      quantity: input.quantity,
      customerName: input.customer_name,
      customerEmail: input.customer_email,
      customerPhone: input.customer_phone ?? null,
    });
  } catch (err) {
    if (err instanceof BookingError) {
      if (err.code === "not_available") {
        return conflict("Der gewählte Zeitraum ist leider nicht mehr verfügbar.");
      }
      return badRequest(err.code);
    }
    console.error("booking hold error", err);
    return serverError();
  }

  // 3. Direct-charge Checkout on the connected account.
  const stripe = getStripe();
  const rentalCents = Math.round(Number(booking.rental_total ?? 0) * 100);
  const depositCents = Math.round(Number(booking.deposit_total ?? 0) * 100);
  const totalCents = rentalCents + depositCents;

  const lineItems: { price_data: { currency: string; unit_amount: number; product_data: { name: string } }; quantity: number }[] = [];
  if (rentalCents > 0) {
    lineItems.push({
      price_data: {
        currency: "eur",
        unit_amount: rentalCents,
        product_data: { name: `Miete: ${item.name} (${booking.start_date} – ${booking.end_date})` },
      },
      quantity: 1,
    });
  }
  if (depositCents > 0) {
    lineItems.push({
      price_data: {
        currency: "eur",
        unit_amount: depositCents,
        product_data: { name: `Kaution: ${item.name} (wird bei Rückgabe erstattet)` },
      },
      quantity: 1,
    });
  }
  if (lineItems.length === 0) {
    // Nothing to charge (free item, no deposit) — confirm immediately is out of
    // scope for MVP; require a non-zero amount so payment confirms the booking.
    return badRequest("Buchung erfordert einen Betrag größer 0.");
  }

  const fee = applicationFeeAmount(totalCents);

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: lineItems,
        customer_email: input.customer_email,
        success_url: `${APP_URL}/b/${input.slug}?status=success&booking=${booking.id}`,
        cancel_url: `${APP_URL}/b/${input.slug}?status=cancelled&booking=${booking.id}`,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        metadata: { booking_id: booking.id, tenant: profile.user_id },
        payment_intent_data: {
          metadata: { booking_id: booking.id, tenant: profile.user_id },
          ...(depositCents > 0 ? { description: "Inkl. Kaution (Rückerstattung bei Rückgabe)" } : {}),
          ...(fee ? { application_fee_amount: fee } : {}),
        },
      },
      onConnectedAccount(profile.stripe_connect_account_id),
    );

    // The payment_intent id is captured later by the Connect webhook on success.
    return json({ booking_id: booking.id, checkout_url: session.url });
  } catch (err) {
    console.error("stripe checkout error", err);
    // The pending hold will be released by /api/cron/expire-holds when its TTL lapses.
    return serverError("Zahlung konnte nicht initialisiert werden.");
  }
}
