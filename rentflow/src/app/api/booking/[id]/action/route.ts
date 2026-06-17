import { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe, onConnectedAccount } from "@/lib/stripe/client";
import { sendDepositRefunded } from "@/lib/email/send";
import { badRequest, json, serverError, unauthorized } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const actionSchema = z.object({
  action: z.enum(["confirm", "returned", "cancel"]),
  /** For cancel: also refund the full payment (rental + deposit). */
  refund: z.boolean().optional(),
});

/**
 * POST /api/booking/[id]/action — owner-only state transitions (prompt §10/§6):
 *  - confirm  : pending → confirmed (manual/offline confirmation)
 *  - returned : confirmed|active → returned, refunds the deposit on the
 *               connected account (deposit_status charged → refunded)
 *  - cancel   : → cancelled, optional full refund
 * Refunds always happen on the tenant's connected account (Guardrail #1/#3).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Ungültiger Request-Body");
  }
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validierungsfehler", parsed.error.flatten());

  const supabase = createServiceClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id) // ownership check
    .maybeSingle();

  if (!booking) return badRequest("Buchung nicht gefunden");

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_connect_account_id, email")
    .eq("user_id", user.id)
    .maybeSingle();

  try {
    switch (parsed.data.action) {
      case "confirm": {
        if (booking.status !== "pending") {
          return badRequest("Nur ausstehende Buchungen können bestätigt werden.");
        }
        await supabase
          .from("bookings")
          .update({ status: "confirmed", hold_expires_at: null })
          .eq("id", id);
        return json({ status: "confirmed" });
      }

      case "returned": {
        if (!["confirmed", "active"].includes(booking.status)) {
          return badRequest("Nur bestätigte/aktive Buchungen können zurückgegeben werden.");
        }
        // Refund the deposit on the connected account, if one was charged.
        const depositCents = Math.round(Number(booking.deposit_total ?? 0) * 100);
        if (
          depositCents > 0 &&
          booking.deposit_status === "charged" &&
          booking.deposit_payment_intent_id &&
          profile?.stripe_connect_account_id
        ) {
          await getStripe().refunds.create(
            { payment_intent: booking.deposit_payment_intent_id, amount: depositCents },
            onConnectedAccount(profile.stripe_connect_account_id),
          );
        }
        await supabase
          .from("bookings")
          .update({
            status: "returned",
            deposit_status: depositCents > 0 ? "refunded" : booking.deposit_status,
          })
          .eq("id", id);
        try {
          await sendDepositRefunded(booking);
        } catch (err) {
          console.error("deposit refund email failed", err);
        }
        return json({ status: "returned" });
      }

      case "cancel": {
        if (["returned", "cancelled", "expired"].includes(booking.status)) {
          return badRequest("Buchung kann nicht mehr storniert werden.");
        }
        // Optional full refund on cancel.
        if (
          parsed.data.refund &&
          booking.deposit_payment_intent_id &&
          profile?.stripe_connect_account_id
        ) {
          await getStripe().refunds.create(
            { payment_intent: booking.deposit_payment_intent_id },
            onConnectedAccount(profile.stripe_connect_account_id),
          );
        }
        await supabase
          .from("bookings")
          .update({
            status: "cancelled",
            hold_expires_at: null,
            deposit_status: parsed.data.refund ? "refunded" : booking.deposit_status,
          })
          .eq("id", id);
        return json({ status: "cancelled" });
      }
    }
  } catch (err) {
    console.error("booking action error", err);
    return serverError("Aktion fehlgeschlagen.");
  }
}
