import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Webhook idempotency via the stripe_events ledger (prompt §9b).
 * Returns true if this is the FIRST time we see the event (insert succeeded);
 * false if it was already processed (duplicate delivery) — caller should no-op.
 */
export async function claimEvent(eventId: string, type: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("stripe_events").insert({ id: eventId, type });
  if (!error) return true;
  // Unique violation => already processed.
  if (error.code === "23505") return false;
  // Any other error: surface it so the webhook returns 500 and Stripe retries.
  throw error;
}
