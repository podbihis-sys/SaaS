/**
 * Authorizes Vercel Cron requests. Vercel sends `Authorization: Bearer
 * $CRON_SECRET` when the `CRON_SECRET` env var is set.
 */
export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}
