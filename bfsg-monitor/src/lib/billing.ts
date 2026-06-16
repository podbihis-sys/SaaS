import type { Plan } from "./constants";

export type BillingCycle = "monthly" | "yearly";
export type PaidPlan = "starter" | "pro";

export interface PlanDisplay {
  name: string;
  tagline: string;
  /** Display price in EUR — must match the configured Stripe prices. */
  priceMonthly: number;
  priceYearly: number;
  features: string[];
}

export const PLAN_DISPLAY: Record<Plan, PlanDisplay> = {
  free: {
    name: "Free",
    tagline: "Einmaliger Schnell-Check",
    priceMonthly: 0,
    priceYearly: 0,
    features: ["1 Domain", "Einmaliger Scan der Startseite", "Score & Mängelliste"],
  },
  starter: {
    name: "Starter",
    tagline: "Für eine Website",
    priceMonthly: 29,
    priceYearly: 290,
    features: [
      "1 Domain",
      "Wöchentliches Monitoring",
      "PDF-Nachweisdokument",
      "E-Mail-Alerts bei Verschlechterung",
    ],
  },
  pro: {
    name: "Pro",
    tagline: "Für Agenturen & mehrere Domains",
    priceMonthly: 99,
    priceYearly: 990,
    features: [
      "Bis zu 10 Domains",
      "Tägliches Monitoring",
      "PDF mit eigenem Logo",
      "Priorisierter Support",
    ],
  },
};

/** Maps (plan, cycle) → Stripe Price ID from env. */
export function priceIdFor(plan: PaidPlan, cycle: BillingCycle): string | undefined {
  const table: Record<PaidPlan, Record<BillingCycle, string | undefined>> = {
    starter: {
      monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
      yearly: process.env.STRIPE_PRICE_STARTER_YEARLY,
    },
    pro: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
      yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
    },
  };
  return table[plan][cycle];
}

/** Reverse lookup: Stripe Price ID → plan (defaults to "free"). */
export function planFromPriceId(priceId: string | null | undefined): Plan {
  if (!priceId) return "free";
  if (
    priceId === process.env.STRIPE_PRICE_STARTER_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_STARTER_YEARLY
  ) {
    return "starter";
  }
  if (
    priceId === process.env.STRIPE_PRICE_PRO_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_PRO_YEARLY
  ) {
    return "pro";
  }
  return "free";
}
