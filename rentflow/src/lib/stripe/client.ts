import "server-only";
import Stripe from "stripe";

/**
 * Single Stripe SDK instance for the PLATFORM account.
 *
 * Two money streams (prompt §6, Guardrail #1):
 *  - Platform subscriptions: calls on this instance directly.
 *  - Tenant payments (deposit/rental): the SAME instance but every call passes
 *    `{ stripeAccount: <connected_account_id> }` so it becomes a DIRECT CHARGE
 *    on the tenant's connected account. The platform is NEVER in the money flow.
 */
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  cached = new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    appInfo: { name: "RentFlow", version: "0.1.0" },
  });
  return cached;
}

/** Stripe-Account header options for direct charges on a connected account. */
export function onConnectedAccount(accountId: string): { stripeAccount: string } {
  return { stripeAccount: accountId };
}

/** Optional application fee in basis points (default 0 → no fee, full amount to tenant). */
export function applicationFeeAmount(amountInCents: number): number | undefined {
  const bps = Number(process.env.PLATFORM_FEE_BPS ?? "0");
  if (!bps || bps <= 0) return undefined;
  return Math.round((amountInCents * bps) / 10_000);
}
