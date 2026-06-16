/**
 * Central, intentionally-capsulated product constants for BFSG-Monitor.
 *
 * Legal / standard facts live here so they can be changed in ONE place — e.g.
 * when EN 301 549 v4.1.1 makes WCAG 2.2 the binding benchmark during 2026.
 * Do NOT scatter these literals across the codebase.
 */

/** Accessibility standard currently applied. */
export const WCAG = {
  /** Current legal benchmark for the BFSG via EN 301 549. */
  standard: "WCAG 2.1",
  level: "AA",
  /** axe-core rule tags the scan worker activates. */
  axeTags: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] as const,
  /**
   * WCAG 2.2 is "state of the art" but not yet mandatory. Flip the active
   * standard here once EN 301 549 v4.1.1 lands (expected in the course of 2026).
   */
  nextStandardCandidate: "WCAG 2.2",
} as const;

/** Key legal facts used in copy and reports. */
export const LAW = {
  name: "Barrierefreiheitsstärkungsgesetz (BFSG)",
  inForceSince: "2025-06-28",
  maxFineEur: 100_000,
} as const;

/**
 * Mandatory, non-negotiable product disclaimers (Guardrails §3/§4).
 * Render these wherever scores, reports, or statements are shown.
 */
export const DISCLAIMERS = {
  noLegalAdvice: "Hinweis: Diese Inhalte stellen keine Rechtsberatung dar.",
  automatedCoverage:
    "Automatisierte Tests erkennen nur einen Teil (~30–40 %) aller WCAG-Probleme. Eine ergänzende manuelle Prüfung ist erforderlich.",
  noGuarantee:
    "BFSG-Monitor ist ein Monitoring- und Frühwarnsystem und gewährleistet keine Rechtssicherheit oder vollständige Konformität.",
} as const;

/** Issue impact weights for the 0–100 score (shared with the scan worker). */
export const IMPACT_WEIGHTS = {
  critical: 10,
  serious: 6,
  moderate: 3,
  minor: 1,
} as const;
export type Impact = keyof typeof IMPACT_WEIGHTS;

/** Subscription plans. */
export type Plan = "free" | "starter" | "pro";

export type MonitoringFrequency = "none" | "weekly" | "daily";

export interface PlanEntitlements {
  maxDomains: number;
  monitoring: MonitoringFrequency;
  /** May generate/download the PDF evidence report. */
  pdf: boolean;
  /** May add their own logo to the PDF (Pro/agency). */
  brandedPdf: boolean;
}

/** Single source of truth for plan gating (§9). */
export const PLANS = {
  free: { maxDomains: 1, monitoring: "none", pdf: false, brandedPdf: false },
  starter: { maxDomains: 1, monitoring: "weekly", pdf: true, brandedPdf: false },
  pro: { maxDomains: 10, monitoring: "daily", pdf: true, brandedPdf: true },
} as const satisfies Record<Plan, PlanEntitlements>;

/** Anti-abuse limits for the public free scan (§10). */
export const FREE_SCAN_LIMITS = {
  perIpPerDay: 5,
  sameDomainCooldownMinutes: 60,
} as const;

/** Trial length for paid plans (§9). */
export const TRIAL_DAYS = 14;
