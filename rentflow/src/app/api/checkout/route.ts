import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/client";
import { priceIdFor } from "@/lib/stripe/plans";
import { platformCheckoutSchema } from "@/lib/validation";
import { badRequest, json, serverError, unauthorized } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * POST /api/checkout — start a PLATFORM subscription (Solo/Pro) with a 14-day
 * trial (prompt §9a). This is the platform's own revenue; entirely separate
 * from tenant payments (Guardrail #1).
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Ungültiger Request-Body");
  }
  const parsed = platformCheckoutSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validierungsfehler", parsed.error.flatten());

  const priceId = priceIdFor(parsed.data.plan, parsed.data.interval);
  if (!priceId) return serverError("Preis nicht konfiguriert");

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("user_id", user.id)
    .maybeSingle();

  const stripe = getStripe();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 14, metadata: { user_id: user.id } },
      payment_method_types: ["card", "sepa_debit"],
      ...(profile?.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : { customer_email: profile?.email ?? user.email ?? undefined }),
      client_reference_id: user.id,
      metadata: { user_id: user.id },
      success_url: `${APP_URL}/app/billing?checkout=success`,
      cancel_url: `${APP_URL}/app/billing?checkout=cancelled`,
      allow_promotion_codes: true,
    });
    return json({ url: session.url });
  } catch (err) {
    console.error("platform checkout error", err);
    return serverError("Checkout konnte nicht gestartet werden.");
  }
}
