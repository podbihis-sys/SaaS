import { NextResponse } from "next/server";
import { getCompany } from "@/lib/data";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const company = await getCompany();
  if (!company) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }
  if (!company.stripe_customer_id) {
    return NextResponse.redirect(new URL("/abo", request.url), 303);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const session = await getStripe().billingPortal.sessions.create({
    customer: company.stripe_customer_id,
    return_url: `${appUrl}/dashboard`,
  });
  return NextResponse.redirect(session.url, 303);
}
