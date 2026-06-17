import type { Plan, PlanStatus, Profile } from "@/types/database";

/**
 * Centralised plan entitlements (prompt §9 / §18). Single source of truth for
 * gating: max items, locations, branding toggle, reminder frequency.
 */

export interface Entitlements {
  plan: Plan;
  active: boolean;
  /** null === unlimited */
  maxItems: number | null;
  maxLocations: number | null;
  /** Whether the tenant may remove the "Powered by RentFlow" branding. */
  canRemoveBranding: boolean;
  reminderFrequency: "none" | "standard" | "daily";
  maxBookingsPerMonth: number | null;
}

const FREE: Omit<Entitlements, "plan" | "active"> = {
  maxItems: 3,
  maxLocations: 1,
  canRemoveBranding: false,
  reminderFrequency: "none",
  maxBookingsPerMonth: 20,
};

const SOLO: Omit<Entitlements, "plan" | "active"> = {
  maxItems: 40,
  maxLocations: 1,
  canRemoveBranding: false,
  reminderFrequency: "standard",
  maxBookingsPerMonth: null,
};

const PRO: Omit<Entitlements, "plan" | "active"> = {
  maxItems: null,
  maxLocations: null,
  canRemoveBranding: true,
  reminderFrequency: "daily",
  maxBookingsPerMonth: null,
};

/** Statuses that grant paid entitlements (trialing counts as active). */
const ACTIVE_STATUSES: PlanStatus[] = ["active", "trialing"];

export function getEntitlements(
  profile: Pick<Profile, "plan" | "plan_status"> | null | undefined,
): Entitlements {
  const plan: Plan = profile?.plan ?? "free";
  const active = plan === "free" || ACTIVE_STATUSES.includes(profile?.plan_status ?? "inactive");

  // A paid plan that is past_due/canceled falls back to free limits.
  const effective: Plan = active ? plan : "free";
  const base = effective === "pro" ? PRO : effective === "solo" ? SOLO : FREE;

  return { plan: effective, active, ...base };
}

/** Whether the public booking page must show the "Powered by RentFlow" badge. */
export function shouldShowBranding(profile: Pick<Profile, "plan" | "plan_status" | "branding_enabled">): boolean {
  const ent = getEntitlements(profile);
  if (!ent.canRemoveBranding) return true; // free/solo always show it
  return profile.branding_enabled; // pro may toggle it off
}
