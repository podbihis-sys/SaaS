import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAuthorizedCron, json, serverError, unauthorized } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/expire-holds — releases pending holds whose TTL elapsed
 * (prompt §10). Protected by CRON_SECRET.
 */
async function handle(request: NextRequest) {
  if (!isAuthorizedCron(request)) return unauthorized();
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc("expire_holds");
    if (error) throw error;
    return json({ expired: data ?? 0 });
  } catch (err) {
    console.error("expire-holds error", err);
    return serverError();
  }
}

export const GET = handle;
export const POST = handle;
