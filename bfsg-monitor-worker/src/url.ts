import { BadRequest } from "./errors";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254", // cloud instance metadata
]);

/** Basic SSRF guard: only allow public http(s) URLs, reject local/private hosts. */
export function assertPublicUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new BadRequest("Ungültige URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new BadRequest("Nur http(s)-URLs werden unterstützt.");
  }

  const host = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(host) || isPrivateHost(host)) {
    throw new BadRequest("Private oder lokale Adressen sind nicht erlaubt.");
  }

  return parsed;
}

function isPrivateHost(host: string): boolean {
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  if (/^127\./.test(host)) return true;
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;
  return false;
}
