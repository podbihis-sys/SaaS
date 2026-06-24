"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getEntitlements } from "@/lib/entitlements";
import { requestScan } from "@/lib/scan-worker";
import type { ScanSummary } from "@/lib/scan-types";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

/** Pages a full scan crawls (worker hard-caps at 20). */
const FULL_SCAN_PAGES = 10;

export async function addDomain(formData: FormData): Promise<void> {
  const normalized = normalizeUrl(String(formData.get("url") ?? "").trim());
  const label = String(formData.get("label") ?? "").trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!normalized) redirect("/app/domains?error=url");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_status")
    .eq("user_id", user.id)
    .single();
  const { count } = await supabase
    .from("domains")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= getEntitlements(profile).maxDomains) {
    redirect("/app/domains?error=limit");
  }

  await supabase
    .from("domains")
    .insert({ user_id: user.id, url: normalized, label });
  revalidatePath("/app/domains");
  redirect("/app/domains");
}

export async function deleteDomain(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("domains").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/app/domains");
  redirect("/app/domains");
}

export async function scanDomain(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: domain } = await supabase
    .from("domains")
    .select("id, url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!domain) redirect("/app/domains");

  let summary: ScanSummary;
  try {
    summary = await requestScan(domain.url, FULL_SCAN_PAGES);
  } catch {
    redirect(`/app/domains/${id}?error=scan`);
  }

  // scans are service-role writes (no user INSERT policy); ownership verified above.
  const admin = createAdminClient();
  await admin.from("scans").insert({
    user_id: user.id,
    domain_id: domain.id,
    type: "full",
    status: "done",
    target_url: domain.url,
    score: summary.score,
    total_issues: summary.totalIssues,
    count_critical: summary.counts.critical,
    count_serious: summary.counts.serious,
    count_moderate: summary.counts.moderate,
    count_minor: summary.counts.minor,
    pages_scanned: summary.pagesScanned,
    raw_result: summary as unknown as Json,
    started_at: summary.startedAt,
    finished_at: summary.finishedAt,
  });

  revalidatePath(`/app/domains/${id}`);
  redirect(`/app/domains/${id}`);
}

function normalizeUrl(input: string): string | null {
  if (!input) return null;
  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}
