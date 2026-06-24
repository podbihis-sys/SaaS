/**
 * Shape of the scan worker's JSON response. Mirrors
 * `bfsg-monitor-worker/src/types.ts` — keep the two in sync.
 */

export type Impact = "critical" | "serious" | "moderate" | "minor";

export type ImpactCounts = Record<Impact, number>;

export interface Issue {
  id: string;
  impact: Impact;
  help: string;
  description: string;
  helpUrl: string;
  nodes: number;
}

export interface ScanSummary {
  url: string;
  score: number;
  totalIssues: number;
  counts: ImpactCounts;
  issues: Issue[];
  pagesScanned: number;
  pages: unknown[];
  startedAt: string;
  finishedAt: string;
}
