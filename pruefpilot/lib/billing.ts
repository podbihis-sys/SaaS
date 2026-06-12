export interface BillingState {
  subscription_status: string;
  trial_ends_at: string;
}

/**
 * Zugriff: aktives/karenzzeitiges Abo immer; Trial nur bis trial_ends_at.
 * past_due behält Zugriff (Karenz), canceled/unpaid verlieren ihn.
 */
export function hasAccess(billing: BillingState, now: Date = new Date()): boolean {
  if (billing.subscription_status === "active" || billing.subscription_status === "past_due") {
    return true;
  }
  if (billing.subscription_status === "trialing") {
    return new Date(billing.trial_ends_at).getTime() > now.getTime();
  }
  return false;
}

export function trialDaysLeft(billing: BillingState, now: Date = new Date()): number {
  const ms = new Date(billing.trial_ends_at).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export function isTrialing(billing: BillingState): boolean {
  return billing.subscription_status === "trialing";
}
