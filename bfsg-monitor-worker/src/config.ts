/**
 * Worker configuration. The WCAG tags and impact weights MUST mirror the web
 * app's `src/lib/constants.ts` so scores stay consistent across the product.
 */

/** axe-core rule tags = WCAG 2.1 A/AA (EN 301 549 benchmark for the BFSG). */
export const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] as const;

/** Penalty weight per issue impact, used for the 0–100 score. */
export const IMPACT_WEIGHTS = {
  critical: 10,
  serious: 6,
  moderate: 3,
  minor: 1,
} as const;

export type Impact = keyof typeof IMPACT_WEIGHTS;

export const IMPACTS: Impact[] = ["critical", "serious", "moderate", "minor"];

export const LIMITS = {
  /** Hard cap on pages per scan (full scans crawl same-origin links). */
  maxPages: 20,
  navTimeoutMs: 30_000,
} as const;

export const PORT = Number(process.env.PORT ?? 8080);

/** Shared secret expected in the `x-worker-secret` header. */
export const WORKER_SECRET = process.env.SCAN_WORKER_SECRET ?? "";
