import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Payload embedded in the offer-acceptance link. Kept minimal so the URL stays
 * short; everything else the owner needs is already in the lead notification.
 */
export interface AcceptPayload {
  name: string;
  email: string;
  company: string;
  /** Fixed offer total in EUR. */
  total: number;
  /** Pre-formatted local-currency total, e.g. "2.440 KM" (optional). */
  localTotal?: string;
  locale: string;
  /** Resend id of the scheduled follow-up email, cancelled on acceptance. */
  followupId?: string;
  /** Issue timestamp (ms) — links expire after ACCEPT_LINK_TTL_DAYS. */
  ts: number;
}

export const ACCEPT_LINK_TTL_DAYS = 30;

function secret(): string | null {
  return process.env.OFFER_TOKEN_SECRET ?? null;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function sign(data: string, key: string): string {
  return b64url(createHmac("sha256", key).update(data).digest());
}

/** Returns a signed token, or null when OFFER_TOKEN_SECRET is not configured. */
export function createAcceptToken(payload: AcceptPayload): string | null {
  const key = secret();
  if (!key) return null;
  const data = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  return `${data}.${sign(data, key)}`;
}

/** Verifies signature and expiry; returns the payload or null. */
export function verifyAcceptToken(token: string): AcceptPayload | null {
  const key = secret();
  if (!key) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const expected = sign(data, key);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    ) as AcceptPayload;
    const ageDays = (Date.now() - payload.ts) / 86_400_000;
    if (!Number.isFinite(ageDays) || ageDays < 0 || ageDays > ACCEPT_LINK_TTL_DAYS) return null;
    return payload;
  } catch {
    return null;
  }
}
