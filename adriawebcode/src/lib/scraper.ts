export interface SiteAnalysis {
  url: string;
  reachable: boolean;
  https: boolean;
  title: string | null;
  metaDescription: string | null;
  hasViewport: boolean;
  hasOgTags: boolean;
  hasH1: boolean;
  hasFavicon: boolean;
  hasStructuredData: boolean;
  hasHreflang: boolean;
  imageCount: number;
  imagesWithAlt: number;
  htmlSizeKb: number;
  responseTimeMs: number;
  generator: string | null;
  techStack: string[];
  score: number;
  issues: string[];
}

const FETCH_TIMEOUT_MS = 12_000;
const MAX_HTML_BYTES = 2_000_000;

function extract(regex: RegExp, html: string): string | null {
  const match = html.match(regex);
  return match ? match[1].replace(/\s+/g, " ").trim() : null;
}

function detectTech(html: string, headers: Headers): string[] {
  const tech: string[] = [];
  const lower = html.toLowerCase();
  if (lower.includes("wp-content") || lower.includes("wp-includes")) tech.push("WordPress");
  if (lower.includes("cdn.shopify.com")) tech.push("Shopify");
  if (lower.includes("wix.com") || lower.includes("wixstatic")) tech.push("Wix");
  if (lower.includes("squarespace")) tech.push("Squarespace");
  if (lower.includes("jimdo")) tech.push("Jimdo");
  if (lower.includes("joomla")) tech.push("Joomla");
  if (lower.includes("typo3")) tech.push("TYPO3");
  if (lower.includes("_next/static") || lower.includes("__next")) tech.push("Next.js");
  if (lower.includes("data-reactroot") || lower.includes("react")) {
    if (!tech.includes("Next.js") && lower.includes("data-reactroot")) tech.push("React");
  }
  if (lower.includes("jquery")) tech.push("jQuery");
  if (lower.includes("bootstrap")) tech.push("Bootstrap");
  if (lower.includes("elementor")) tech.push("Elementor");
  const server = headers.get("server");
  if (server && !tech.length) tech.push(server);
  return [...new Set(tech)];
}

export async function analyzeSite(rawUrl: string): Promise<SiteAnalysis> {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  const base: SiteAnalysis = {
    url,
    reachable: false,
    https: url.startsWith("https://"),
    title: null,
    metaDescription: null,
    hasViewport: false,
    hasOgTags: false,
    hasH1: false,
    hasFavicon: false,
    hasStructuredData: false,
    hasHreflang: false,
    imageCount: 0,
    imagesWithAlt: 0,
    htmlSizeKb: 0,
    responseTimeMs: 0,
    generator: null,
    techStack: [],
    score: 0,
    issues: [],
  };

  // Basic SSRF guard: refuse obviously internal targets before fetching.
  try {
    const host = new URL(url).hostname.toLowerCase();
    const blocked =
      host === "localhost" ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      /^\d+\.\d+\.\d+\.\d+$/.test(host) ||
      host.includes("[");
    if (blocked || !host.includes(".")) return base;
  } catch {
    return base;
  }

  const started = Date.now();
  let html = "";
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AdriaWebCodeBot/1.0; +https://adriawebcode.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timer);
    base.responseTimeMs = Date.now() - started;
    if (!res.ok) return base;

    const buffer = await res.arrayBuffer();
    html = new TextDecoder("utf-8", { fatal: false }).decode(
      buffer.slice(0, MAX_HTML_BYTES),
    );
    base.htmlSizeKb = Math.round(buffer.byteLength / 1024);
    base.reachable = true;
    base.https = res.url.startsWith("https://");
    base.techStack = detectTech(html, res.headers);
  } catch {
    base.responseTimeMs = Date.now() - started;
    return base;
  }

  base.title = extract(/<title[^>]*>([^<]*)<\/title>/i, html);
  base.metaDescription =
    extract(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i, html) ??
    extract(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i, html);
  base.hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  base.hasOgTags = /<meta[^>]+property=["']og:/i.test(html);
  base.hasH1 = /<h1[\s>]/i.test(html);
  base.hasFavicon = /<link[^>]+rel=["'][^"']*icon[^"']*["']/i.test(html);
  base.hasStructuredData = /application\/ld\+json/i.test(html);
  base.hasHreflang = /hreflang=/i.test(html);
  base.generator = extract(
    /<meta[^>]+name=["']generator["'][^>]+content=["']([^"']*)["']/i,
    html,
  );

  const imgTags = html.match(/<img[^>]*>/gi) ?? [];
  base.imageCount = imgTags.length;
  base.imagesWithAlt = imgTags.filter((t) => /alt=["'][^"']+["']/i.test(t)).length;

  // Score out of 100
  let score = 0;
  if (base.https) score += 15;
  else base.issues.push("no-https");
  if (base.title && base.title.length >= 10 && base.title.length <= 70) score += 10;
  else base.issues.push("bad-title");
  if (base.metaDescription && base.metaDescription.length >= 50) score += 15;
  else base.issues.push("no-meta-description");
  if (base.hasViewport) score += 10;
  else base.issues.push("not-mobile-optimized");
  if (base.hasH1) score += 10;
  else base.issues.push("no-h1");
  if (base.hasOgTags) score += 10;
  else base.issues.push("no-og-tags");
  if (base.hasStructuredData) score += 10;
  else base.issues.push("no-structured-data");
  if (base.hasHreflang) score += 5;
  if (base.imageCount === 0 || base.imagesWithAlt / Math.max(base.imageCount, 1) > 0.7)
    score += 5;
  else base.issues.push("missing-alt-texts");
  if (base.responseTimeMs < 1500) score += 10;
  else base.issues.push("slow-response");
  if (base.htmlSizeKb > 0 && base.htmlSizeKb < 400) score += 5;
  else if (base.htmlSizeKb >= 400) base.issues.push("heavy-page");

  base.score = Math.min(100, score);
  return base;
}
