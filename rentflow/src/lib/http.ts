import { NextResponse } from "next/server";

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function conflict(message: string) {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function unauthorized(message = "Nicht autorisiert") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function serverError(message = "Interner Fehler") {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Verify a Vercel Cron / manual cron call. Accepts `Authorization: Bearer <CRON_SECRET>`.
 * Vercel Cron sends this header automatically when CRON_SECRET is configured.
 */
export function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
