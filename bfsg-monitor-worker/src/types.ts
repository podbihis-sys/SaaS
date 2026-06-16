import type { Impact } from "./config";

export type ImpactCounts = Record<Impact, number>;

/** A single axe-core rule violation (a prioritised fix-list entry). */
export interface Issue {
  /** axe rule id, e.g. "color-contrast". */
  id: string;
  impact: Impact;
  /** Short, actionable summary. */
  help: string;
  /** Longer description of the rule. */
  description: string;
  /** Deque help page for the rule. */
  helpUrl: string;
  /** Number of affected elements (instances). */
  nodes: number;
}

export interface PageScan {
  url: string;
  score: number;
  totalIssues: number;
  counts: ImpactCounts;
  issues: Issue[];
  /** Set when the page could not be scanned (navigation/axe failure). */
  error?: string;
}

export interface ScanSummary {
  url: string;
  score: number;
  totalIssues: number;
  counts: ImpactCounts;
  /** Issues aggregated across all scanned pages, prioritised first. */
  issues: Issue[];
  pagesScanned: number;
  pages: PageScan[];
  startedAt: string;
  finishedAt: string;
}
