import type { Browser } from "playwright";

import { LIMITS } from "./config";

/**
 * Discovers same-origin pages to scan, starting from `start`. Returns at least
 * the start URL and at most `maxPages` (capped by LIMITS.maxPages).
 */
export async function discoverPages(
  browser: Browser,
  start: URL,
  maxPages: number,
): Promise<string[]> {
  const limit = Math.max(1, Math.min(maxPages, LIMITS.maxPages));
  const startUrl = normalize(start);
  if (limit === 1) return [startUrl];

  const context = await browser.newContext();
  const page = await context.newPage();
  const found = new Set<string>([startUrl]);

  try {
    await page.goto(startUrl, {
      waitUntil: "domcontentloaded",
      timeout: LIMITS.navTimeoutMs,
    });

    const hrefs = await page.$$eval("a[href]", (anchors) =>
      anchors.map((a) => (a as HTMLAnchorElement).href),
    );

    for (const href of hrefs) {
      if (found.size >= limit) break;
      try {
        const url = new URL(href);
        if (
          url.origin === start.origin &&
          (url.protocol === "http:" || url.protocol === "https:")
        ) {
          found.add(normalize(url));
        }
      } catch {
        // ignore unparseable hrefs
      }
    }
  } catch {
    // On failure, fall back to scanning the start URL only.
  } finally {
    await context.close();
  }

  return Array.from(found).slice(0, limit);
}

function normalize(url: URL): string {
  const clone = new URL(url.toString());
  clone.hash = "";
  return clone.toString();
}
