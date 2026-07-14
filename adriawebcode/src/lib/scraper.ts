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

/**
 * Best-effort SSRF guard: reject hosts that are not clearly public. Blocks
 * localhost, private/link-local/loopback IPv4 (incl. decimal & hex encodings),
 * IPv6 literals, and cloud metadata IPs. DNS-rebinding is further mitigated by
 * the caller using redirect: "manual" and re-validating each hop.
 */
function isPublicHost(rawUrl: string): boolean {
  let host: string;
  let protocol: string;
  try {
    const parsed = new URL(rawUrl);
    host = parsed.hostname.toLowerCase();
    protocol = parsed.protocol;
  } catch {
    return false;
  }
  if (protocol !== "http:" && protocol !== "https:") return false;
  if (!host || host === "localhost") return false;
  if (host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".localhost"))
    return false;
  // IPv6 literal (URL keeps the brackets) — refuse all; we only expect public DNS names.
  if (host.includes(":") || rawUrl.includes("[")) return false;

  // Numeric hosts: dotted-quad, bare decimal (2130706433), or hex (0x7f000001).
  const asNumber = (() => {
    if (/^0x[0-9a-f]+$/.test(host)) return parseInt(host, 16);
    if (/^\d+$/.test(host)) return parseInt(host, 10);
    const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (m) {
      const o = m.slice(1).map(Number);
      if (o.some((n) => n > 255)) return NaN;
      return ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0;
    }
    return NaN;
  })();
  if (!Number.isNaN(asNumber)) {
    const ip = asNumber >>> 0;
    const a = (ip >>> 24) & 0xff;
    const b = (ip >>> 16) & 0xff;
    if (a === 10 || a === 127 || a === 0) return false; // private / loopback / this-network
    if (a === 172 && b >= 16 && b <= 31) return false; // 172.16.0.0/12
    if (a === 192 && b === 168) return false; // 192.168.0.0/16
    if (a === 169 && b === 254) return false; // link-local incl. 169.254.169.254 metadata
    if (a === 100 && b >= 64 && b <= 127) return false; // 100.64.0.0/10 CGNAT
    return true;
  }

  // A real hostname must contain a dot (rejects "intranet", container names, etc.).
  return host.includes(".");
}

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

export async function analyzeSite(rawUrl: string, redirectsLeft = 3): Promise<SiteAnalysis> {
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

  if (!isPublicHost(url)) return base;

  const started = Date.now();
  let html = "";
  try {
    const controller = new AbortController();
    // Single deadline that also covers the body read (not just the headers).
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    // redirect: "manual" so an attacker cannot 302 us onto an internal host
    // after the pre-fetch guard has already passed.
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AdriaWebCodeBot/1.0; +https://adriawebcode.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    base.responseTimeMs = Date.now() - started;

    // A redirect is reported as an opaque/`type: "opaqueredirect"` response or a
    // 3xx status; follow it once ourselves, re-validating the target host.
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      const next = location ? new URL(location, url).toString() : null;
      clearTimeout(timer);
      if (next && next !== url && redirectsLeft > 0 && isPublicHost(next)) {
        return analyzeSite(next, redirectsLeft - 1);
      }
      return base;
    }
    if (!res.ok || !res.body) {
      clearTimeout(timer);
      return base;
    }

    // Stream the body with a hard byte cap so a huge/slow response cannot
    // exhaust memory or run past the request deadline.
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    while (received < MAX_HTML_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        received += value.byteLength;
      }
    }
    await reader.cancel().catch(() => {});
    clearTimeout(timer);

    const merged = new Uint8Array(Math.min(received, MAX_HTML_BYTES));
    let offset = 0;
    for (const chunk of chunks) {
      const take = Math.min(chunk.byteLength, merged.byteLength - offset);
      if (take <= 0) break;
      merged.set(chunk.subarray(0, take), offset);
      offset += take;
    }
    html = new TextDecoder("utf-8", { fatal: false }).decode(merged);
    base.htmlSizeKb = Math.round(received / 1024);
    base.reachable = true;
    base.https = url.startsWith("https://");
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
