import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { planFromPriceId } from "@/lib/billing";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stripe webhook. Verifies the signature against the raw body, then keeps
 * `profiles` in sync with the subscription state. Uses the service role.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature") ?? "";
  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `invalid_signature: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        const userId = session.client_reference_id ?? session.metadata?.user_id;

        if (customerId && userId) {
          const admin = createAdminClient();
          await admin
            .from("profiles")
            .update({ stripe_customer_id: customerId })
            .eq("user_id", userId);
        }
        if (typeof session.subscription === "string") {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          await syncSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("stripe webhook handler error", err);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function syncSubscription(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const priceId = sub.items.data[0]?.price.id;
  const active = sub.status === "active" || sub.status === "trialing";

  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({
      plan: active ? planFromPriceId(priceId) : "free",
      plan_status: sub.status,
      current_period_end: periodEnd(sub),
    })
    .eq("stripe_customer_id", customerId);
}

/**
 * Period end moved from the Subscription to its items in recent Stripe API
 * versions — read it from wherever it exists.
 */
function periodEnd(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0] as
    | (Stripe.SubscriptionItem & { current_period_end?: number })
    | undefined;
  const ts =
    item?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : null;
}
