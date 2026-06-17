import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * GET /api/connect/onboard/refresh
 * Stripe redirects here if an Account Link expired mid-onboarding. We mint a
 * fresh link and bounce the user back into the flow.
 */
export async function GET(_request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(`${APP_URL}/login`);

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_connect_account_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.stripe_connect_account_id) {
    return NextResponse.redirect(`${APP_URL}/app/billing`);
  }

  try {
    const link = await getStripe().accountLinks.create({
      account: profile.stripe_connect_account_id,
      refresh_url: `${APP_URL}/api/connect/onboard/refresh`,
      return_url: `${APP_URL}/app/billing?connect=done`,
      type: "account_onboarding",
    });
    return NextResponse.redirect(link.url);
  } catch (err) {
    console.error("connect refresh error", err);
    return NextResponse.redirect(`${APP_URL}/app/billing?connect=error`);
  }
}
