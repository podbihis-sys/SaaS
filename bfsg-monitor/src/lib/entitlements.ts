import { PLANS, type Plan, type PlanEntitlements } from "./constants";

/** Minimal shape of a profile row needed to resolve entitlements. */
export interface EntitlementProfile {
  plan?: string | null;
  plan_status?: string | null;
}

/** Subscription statuses that grant access to paid entitlements. */
const ACTIVE_STATUSES = new Set(["active", "trialing"]);

/**
 * Central entitlement resolver (§9). Returns the feature limits a profile is
 * entitled to. Paid plans whose subscription is not active (e.g. past_due,
 * canceled) fall back to free entitlements.
 */
export function getEntitlements(
  profile: EntitlementProfile | null | undefined,
): PlanEntitlements {
  const plan = normalizePlan(profile?.plan);
  const active = ACTIVE_STATUSES.has(profile?.plan_status ?? "");
  return active ? PLANS[plan] : PLANS.free;
}

/** Coerces an arbitrary string into a known Plan, defaulting to "free". */
export function normalizePlan(plan: string | null | undefined): Plan {
  return plan === "starter" || plan === "pro" ? plan : "free";
}
