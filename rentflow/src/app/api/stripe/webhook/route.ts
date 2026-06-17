import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { claimEvent } from "@/lib/stripe/events";
import { planForPriceId } from "@/lib/stripe/plans";
import { createServiceClient } from "@/lib/supabase/service";
import type { PlanStatus } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/webhook — PLATFORM account events (subscriptions, prompt §9a).
 * Idempotent via stripe_events. Syncs plan/plan_status/current_period_end.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const sig = request.headers.get("stripe-signature");
  const raw = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig ?? "", secret);
  } catch (err) {
    console.error("platform webhook signature verification failed", err);
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
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id ?? session.client_reference_id ?? undefined;
        if (userId && session.customer) {
          await supabase
            .from("profiles")
            .update({ stripe_customer_id: session.customer as string })
            .eq("user_id", userId);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscription(supabase, sub);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase
          .from("profiles")
          .update({ plan: "free", plan_status: "canceled" })
          .eq("stripe_customer_id", sub.customer as string);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await supabase
          .from("profiles")
          .update({ plan_status: "past_due" })
          .eq("stripe_customer_id", invoice.customer as string);
        // A dunning email is a documented follow-up.
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`platform webhook handler error for ${event.type}`, err);
    return NextResponse.json({ error: "handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

const STATUS_MAP: Record<string, PlanStatus> = {
  active: "active",
  trialing: "trialing",
  past_due: "past_due",
  canceled: "canceled",
  unpaid: "past_due",
  incomplete: "inactive",
  incomplete_expired: "canceled",
  paused: "inactive",
};

async function syncSubscription(
  supabase: ReturnType<typeof createServiceClient>,
  sub: Stripe.Subscription,
) {
  const priceId = sub.items.data[0]?.price?.id;
  const plan = planForPriceId(priceId);
  const planStatus = STATUS_MAP[sub.status] ?? "inactive";
  // current_period_end lives on the subscription (acacia); newer APIs moved it
  // to items — fall back to the item value to stay forward-compatible.
  const periodEnd =
    sub.current_period_end ??
    (sub.items.data[0] as { current_period_end?: number } | undefined)?.current_period_end ??
    null;

  await supabase
    .from("profiles")
    .update({
      plan: planStatus === "active" || planStatus === "trialing" ? plan : "free",
      plan_status: planStatus,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    })
    .eq("stripe_customer_id", sub.customer as string);
}
