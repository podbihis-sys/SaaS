import type { Plan } from "@/types/database";

export type Interval = "monthly" | "yearly";

interface PriceConfig {
  plan: Exclude<Plan, "free">;
  interval: Interval;
  priceId: string | undefined;
}

/** Platform subscription prices, configured via ENV (prompt §9a/§13). */
export const PRICES: PriceConfig[] = [
  { plan: "solo", interval: "monthly", priceId: process.env.STRIPE_PRICE_SOLO_MONTHLY },
  { plan: "solo", interval: "yearly", priceId: process.env.STRIPE_PRICE_SOLO_YEARLY },
  { plan: "pro", interval: "monthly", priceId: process.env.STRIPE_PRICE_PRO_MONTHLY },
  { plan: "pro", interval: "yearly", priceId: process.env.STRIPE_PRICE_PRO_YEARLY },
];

export function priceIdFor(plan: "solo" | "pro", interval: Interval): string | undefined {
  return PRICES.find((p) => p.plan === plan && p.interval === interval)?.priceId;
}

/** Reverse lookup used by the webhook to derive the plan from a subscription's price. */
export function planForPriceId(priceId: string | undefined | null): Plan {
  if (!priceId) return "free";
  return PRICES.find((p) => p.priceId === priceId)?.plan ?? "free";
}
