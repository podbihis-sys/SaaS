import { NextResponse } from "next/server";
import { getCompany } from "@/lib/data";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const company = await getCompany();
  if (!company) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const stripe = getStripe();

  let customerId = company.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: company.contact_email,
      name: company.name,
      metadata: { company_id: company.id },
    });
    customerId = customer.id;
    const supabase = await createClient();
    const { error } = await supabase
      .from("companies")
      .update({ stripe_customer_id: customerId })
      .eq("id", company.id);
    if (error) {
      return NextResponse.json({ error: "Kunde konnte nicht gespeichert werden" }, { status: 500 });
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/abo?checkout=abgebrochen`,
    locale: "de",
  });

  if (!session.url) {
    return NextResponse.json({ error: "Checkout konnte nicht gestartet werden" }, { status: 500 });
  }
  return NextResponse.redirect(session.url, 303);
}
