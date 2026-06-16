import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/client";
import { json, serverError, unauthorized } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * POST /api/connect/onboard
 * Creates (or reuses) the tenant's Standard connected account and returns an
 * Account Link to start/continue Stripe onboarding. charges_enabled is then
 * synced via the account.updated Connect webhook.
 */
export async function POST(_request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, email, company_name, stripe_connect_account_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) return serverError("Profil nicht gefunden");

  const stripe = getStripe();

  try {
    let accountId = profile.stripe_connect_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "standard",
        email: profile.email ?? user.email ?? undefined,
        business_profile: profile.company_name
          ? { name: profile.company_name }
          : undefined,
        metadata: { tenant: user.id },
      });
      accountId = account.id;
      await supabase
        .from("profiles")
        .update({ stripe_connect_account_id: accountId })
        .eq("user_id", user.id);
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${APP_URL}/api/connect/onboard/refresh`,
      return_url: `${APP_URL}/app/billing?connect=done`,
      type: "account_onboarding",
    });

    return json({ url: link.url });
  } catch (err) {
    console.error("connect onboard error", err);
    return serverError("Stripe-Onboarding konnte nicht gestartet werden.");
  }
}
