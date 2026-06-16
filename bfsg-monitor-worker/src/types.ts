import type { Impact } from "./config";

export type ImpactCounts = Record<Impact, number>;

export interface PageScan {
  url: string;
  score: number;
  totalIssues: number;
  counts: ImpactCounts;
  /** Set when the page could not be scanned (navigation/axe failure). */
  error?: string;
}

export interface ScanSummary {
  url: string;
  score: number;
  totalIssues: number;
  counts: ImpactCounts;
  pagesScanned: number;
  pages: PageScan[];
  startedAt: string;
  finishedAt: string;
}
