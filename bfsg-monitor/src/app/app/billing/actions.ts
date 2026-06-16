"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { priceIdFor, type BillingCycle, type PaidPlan } from "@/lib/billing";
import { TRIAL_DAYS } from "@/lib/constants";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function appUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

/** Creates a Stripe Checkout session for the chosen plan and redirects to it. */
export async function startCheckout(formData: FormData): Promise<void> {
  const plan = String(formData.get("plan") ?? "") as PaidPlan;
  const cycle = String(formData.get("cycle") ?? "monthly") as BillingCycle;
  if (plan !== "starter" && plan !== "pro") {
    throw new Error("Ungültiger Plan.");
  }

  const price = priceIdFor(plan, cycle);
  if (!price) {
    throw new Error("Für diesen Plan ist kein Preis konfiguriert.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("user_id", user.id)
    .single();

  const stripe = getStripe();
  let customerId = profile?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", user.id);
  }

  const base = await appUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { user_id: user.id },
    },
    allow_promotion_codes: true,
    client_reference_id: user.id,
    success_url: `${base}/app/billing?status=success`,
    cancel_url: `${base}/app/billing?status=cancel`,
  });

  if (!session.url) {
    throw new Error("Checkout konnte nicht gestartet werden.");
  }
  redirect(session.url);
}

/** Opens the Stripe Customer Portal for the current user. */
export async function openPortal(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    redirect("/app/billing?status=no_customer");
  }

  const base = await appUrl();
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${base}/app/billing`,
  });
  redirect(session.url);
}
