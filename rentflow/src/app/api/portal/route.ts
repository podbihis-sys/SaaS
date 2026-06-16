import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/client";
import { badRequest, json, serverError, unauthorized } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** POST /api/portal — Stripe Customer Portal for self-service plan management. */
export async function POST(_request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return badRequest("Kein aktives Abo vorhanden.");
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${APP_URL}/app/billing`,
    });
    return json({ url: session.url });
  } catch (err) {
    console.error("portal error", err);
    return serverError();
  }
}
