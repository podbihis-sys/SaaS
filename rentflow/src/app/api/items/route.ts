import { NextRequest } from "next/server";
import { z } from "zod";
import { createServerSupabase, getCurrentProfile } from "@/lib/supabase/server";
import { getEntitlements } from "@/lib/entitlements";
import { badRequest, json, serverError, unauthorized } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const itemSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().max(100).optional(),
  quantity: z.number().int().min(1).default(1),
  price_per_day: z.number().min(0),
  deposit_amount: z.number().min(0).default(0),
});

/** POST /api/items — create an inventory item (entitlement-gated). */
export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Ungültiger Request-Body");
  }
  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validierungsfehler", parsed.error.flatten());

  const supabase = await createServerSupabase();

  // Enforce the plan's item limit.
  const ent = getEntitlements(profile);
  if (ent.maxItems !== null) {
    const { count } = await supabase
      .from("items")
      .select("id", { count: "exact", head: true });
    if ((count ?? 0) >= ent.maxItems) {
      return badRequest(
        `Artikel-Limit deines Tarifs erreicht (${ent.maxItems}). Bitte upgraden.`,
      );
    }
  }

  const { data, error } = await supabase
    .from("items")
    .insert({ ...parsed.data, user_id: profile.user_id })
    .select("*")
    .single();

  if (error) {
    console.error("item insert error", error);
    return serverError("Artikel konnte nicht angelegt werden.");
  }
  return json({ item: data }, { status: 201 });
}
