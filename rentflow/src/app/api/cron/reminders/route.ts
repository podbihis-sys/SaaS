import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAuthorizedCron, json, serverError, unauthorized } from "@/lib/http";
import { addDays, todayInBerlin } from "@/lib/dates";
import {
  sendOverdueNotice,
  sendPickupReminder,
  sendReturnReminder,
} from "@/lib/email/send";
import type { Booking } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/reminders — daily reminders (prompt §10), Europe/Berlin:
 *  - promote confirmed → active when the rental has started
 *  - pickup reminder the day before start
 *  - return reminder the day before end
 *  - overdue notice to the tenant when the end date passed without return
 * Protected by CRON_SECRET. Idempotency for a daily schedule is acceptable here;
 * a per-booking "last reminded" marker is a documented follow-up.
 */
async function handle(request: NextRequest) {
  if (!isAuthorizedCron(request)) return unauthorized();

  const supabase = createServiceClient();
  const today = todayInBerlin();
  const tomorrow = addDays(today, 1);

  try {
    // Promote started bookings to active.
    await supabase
      .from("bookings")
      .update({ status: "active" })
      .eq("status", "confirmed")
      .lte("start_date", today)
      .gte("end_date", today);

    // Pickup reminders: bookings starting tomorrow.
    const { data: pickups } = await supabase
      .from("bookings")
      .select("*")
      .in("status", ["confirmed"])
      .eq("start_date", tomorrow);

    // Return reminders: bookings ending tomorrow.
    const { data: returns } = await supabase
      .from("bookings")
      .select("*")
      .in("status", ["confirmed", "active"])
      .eq("end_date", tomorrow);

    // Overdue: ended before today and not yet returned/cancelled.
    const { data: overdue } = await supabase
      .from("bookings")
      .select("*")
      .in("status", ["confirmed", "active"])
      .lt("end_date", today);

    let sent = 0;
    for (const b of (pickups ?? []) as Booking[]) {
      await safe(() => sendPickupReminder(b));
      sent++;
    }
    for (const b of (returns ?? []) as Booking[]) {
      await safe(() => sendReturnReminder(b));
      sent++;
    }

    // Tenant emails for overdue bookings (look up tenant email per booking).
    for (const b of (overdue ?? []) as Booking[]) {
      const { data: tenant } = await supabase
        .from("profiles")
        .select("email")
        .eq("user_id", b.user_id)
        .maybeSingle();
      await safe(() => sendOverdueNotice(b, tenant?.email ?? null));
      sent++;
    }

    return json({
      date: today,
      pickups: pickups?.length ?? 0,
      returns: returns?.length ?? 0,
      overdue: overdue?.length ?? 0,
      emails_attempted: sent,
    });
  } catch (err) {
    console.error("reminders error", err);
    return serverError();
  }
}

async function safe(fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (err) {
    console.error("reminder email failed", err);
  }
}

export const GET = handle;
export const POST = handle;
