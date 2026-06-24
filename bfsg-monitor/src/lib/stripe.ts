import Stripe from "stripe";

let client: Stripe | null = null;

/** Lazily-constructed Stripe client. Server-side only. */
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
    client = new Stripe(key);
  }
  return client;
}
