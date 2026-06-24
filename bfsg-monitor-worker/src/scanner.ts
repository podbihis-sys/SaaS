import AxeBuilder from "@axe-core/playwright";
import { chromium, type Browser } from "playwright";

import { IMPACT_WEIGHTS, IMPACTS, LIMITS, WCAG_TAGS, type Impact } from "./config";
import { discoverPages } from "./crawler";
import type { ImpactCounts, Issue, PageScan, ScanSummary } from "./types";

function emptyCounts(): ImpactCounts {
  return { critical: 0, serious: 0, moderate: 0, minor: 0 };
}

/**
 * 0–100 score (100 = no detected issues). MVP heuristic: subtract weighted
 * penalties per issue instance, floored at 0. Tunable in one place.
 */
export function scoreFromCounts(counts: ImpactCounts): number {
  const penalty = IMPACTS.reduce(
    (sum, impact) => sum + IMPACT_WEIGHTS[impact] * counts[impact],
    0,
  );
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}

/** Runs axe-core (WCAG 2.1 A/AA) against a single page. */
export async function scanPage(browser: Browser, url: string): Promise<PageScan> {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: LIMITS.navTimeoutMs,
    });

    const results = await new AxeBuilder({ page })
      .withTags([...WCAG_TAGS])
      .analyze();

    const issues: Issue[] = results.violations.map((violation) => ({
      id: violation.id,
      impact: (violation.impact ?? "minor") as Impact,
      help: violation.help,
      description: violation.description,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.length || 1,
    }));

    const counts = emptyCounts();
    for (const issue of issues) {
      if (issue.impact in counts) counts[issue.impact] += issue.nodes;
    }

    const totalIssues = IMPACTS.reduce((sum, k) => sum + counts[k], 0);
    return { url, score: scoreFromCounts(counts), totalIssues, counts, issues };
  } catch (err) {
    return {
      url,
      score: 0,
      totalIssues: 0,
      counts: emptyCounts(),
      issues: [],
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    await context.close();
  }
}

/** Crawls (for full scans) and scans up to `maxPages`, then aggregates. */
export async function runScan(target: URL, maxPages: number): Promise<ScanSummary> {
  const startedAt = new Date().toISOString();
  const browser = await chromium.launch({ args: ["--no-sandbox"] });

  try {
    const urls = await discoverPages(browser, target, maxPages);
    const pages: PageScan[] = [];
    for (const url of urls) {
      pages.push(await scanPage(browser, url));
    }

    const counts = emptyCounts();
    for (const page of pages) {
      for (const k of IMPACTS) counts[k] += page.counts[k];
    }
    const totalIssues = IMPACTS.reduce((sum, k) => sum + counts[k], 0);

    const issueMap = new Map<string, Issue>();
    for (const page of pages) {
      for (const issue of page.issues) {
        const existing = issueMap.get(issue.id);
        if (existing) existing.nodes += issue.nodes;
        else issueMap.set(issue.id, { ...issue });
      }
    }
    const issues = [...issueMap.values()].sort(
      (a, b) =>
        IMPACT_WEIGHTS[b.impact] * b.nodes - IMPACT_WEIGHTS[a.impact] * a.nodes,
    );

    return {
      url: target.toString(),
      score: scoreFromCounts(counts),
      totalIssues,
      counts,
      issues,
      pagesScanned: pages.length,
      pages,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  } finally {
    await browser.close();
  }
}
