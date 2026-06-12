import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Webhooks tragen keine Nutzersession — Statussync läuft über den Service-Role-Client,
// gefiltert ausschließlich über von Stripe signierte IDs.
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const customerId = typeof session.customer === "string" ? session.customer : null;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;
      if (customerId && subscriptionId) {
        // Nur die Abo-Verknüpfung speichern. Der Status kommt ausschließlich aus
        // customer.subscription.updated/.deleted — sonst überschreibt die
        // Zustellreihenfolge der Events den echten Zustand.
        const { error } = await admin
          .from("companies")
          .update({ stripe_subscription_id: subscriptionId })
          .eq("stripe_customer_id", customerId);
        if (error) {
          console.error("stripe webhook db error", event.type, error.message);
          return NextResponse.json({ error: "internal error" }, { status: 500 });
        }
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const status =
        event.type === "customer.subscription.deleted" ? "canceled" : subscription.status;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : null;
      if (customerId) {
        const { error } = await admin
          .from("companies")
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: status,
          })
          .eq("stripe_customer_id", customerId);
        if (error) {
          console.error("stripe webhook db error", event.type, error.message);
          return NextResponse.json({ error: "internal error" }, { status: 500 });
        }
      }
      break;
    }
    default:
      // Nicht abonnierte Events bestätigen, damit Stripe sie nicht erneut zustellt.
      break;
  }

  return NextResponse.json({ received: true });
}
