import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { claimEvent } from "@/lib/stripe/events";
import { createServiceClient } from "@/lib/supabase/service";
import { sendBookingConfirmation } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/connect/webhook — events from CONNECTED accounts (prompt §9b).
 *  - account.updated                → sync connect_charges_enabled
 *  - checkout.session.completed     → confirm the booking (payment succeeded)
 *  - payment_intent.succeeded       → backstop confirmation + capture PI id
 * Idempotent via stripe_events.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const sig = request.headers.get("stripe-signature");
  const raw = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig ?? "", secret);
  } catch (err) {
    console.error("connect webhook signature verification failed", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let first: boolean;
  try {
    first = await claimEvent(event.id, event.type);
  } catch (err) {
    console.error("claimEvent failed", err);
    return NextResponse.json({ error: "ledger error" }, { status: 500 });
  }
  if (!first) return NextResponse.json({ received: true, duplicate: true });

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await supabase
          .from("profiles")
          .update({ connect_charges_enabled: account.charges_enabled === true })
          .eq("stripe_connect_account_id", account.id);
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.booking_id;
        if (bookingId && session.payment_status === "paid") {
          await confirmBooking(supabase, bookingId, session.payment_intent as string | null);
        }
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = pi.metadata?.booking_id;
        if (bookingId) await confirmBooking(supabase, bookingId, pi.id);
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error(`connect webhook handler error for ${event.type}`, err);
    return NextResponse.json({ error: "handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function confirmBooking(
  supabase: ReturnType<typeof createServiceClient>,
  bookingId: string,
  paymentIntentId: string | null,
) {
  // Only confirm a pending hold; ignore if already confirmed/expired/cancelled.
  const { data: updated } = await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      rental_payment_status: "paid",
      deposit_status: "charged",
      deposit_payment_intent_id: paymentIntentId,
      hold_expires_at: null,
    })
    .eq("id", bookingId)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (updated) {
    // Best-effort confirmation email; failures must not break the webhook.
    try {
      await sendBookingConfirmation(updated);
    } catch (err) {
      console.error("confirmation email failed", err);
    }
  }
}
