"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { FREE_SCAN_LIMITS } from "@/lib/constants";
import { requestScan, ScanWorkerError } from "@/lib/scan-worker";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

export interface FreeScanState {
  error?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export async function runFreeScan(
  _prev: FreeScanState,
  formData: FormData,
): Promise<FreeScanState> {
  const normalized = normalizeUrl(String(formData.get("url") ?? "").trim());
  if (!normalized) {
    return { error: "Bitte gib eine gültige URL ein (z. B. https://ihre-firma.de)." };
  }

  const target = new URL(normalized);
  const ip = await clientIp();
  const admin = createAdminClient();

  // Anti-abuse: per-IP daily cap + same-domain cooldown.
  const dayAgo = new Date(Date.now() - DAY_MS).toISOString();
  const { count: ipCount } = await admin
    .from("free_scan_log")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", dayAgo);
  if ((ipCount ?? 0) >= FREE_SCAN_LIMITS.perIpPerDay) {
    return { error: "Tageslimit für kostenlose Scans erreicht. Bitte später erneut versuchen." };
  }

  const cooldownAgo = new Date(
    Date.now() - FREE_SCAN_LIMITS.sameDomainCooldownMinutes * 60 * 1000,
  ).toISOString();
  const { count: domainCount } = await admin
    .from("free_scan_log")
    .select("id", { count: "exact", head: true })
    .eq("domain", target.hostname)
    .gte("created_at", cooldownAgo);
  if ((domainCount ?? 0) > 0) {
    return { error: "Diese Domain wurde gerade erst geprüft. Bitte etwas später erneut." };
  }

  await admin.from("free_scan_log").insert({ ip, domain: target.hostname });

  let summary;
  try {
    summary = await requestScan(target.toString(), 1);
  } catch (err) {
    return {
      error:
        err instanceof ScanWorkerError
          ? err.message
          : "Der Scan konnte nicht durchgeführt werden.",
    };
  }

  const { data, error } = await admin
    .from("scans")
    .insert({
      type: "free",
      status: "done",
      target_url: target.toString(),
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
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Das Ergebnis konnte nicht gespeichert werden." };
  }

  redirect(`/check/${data.id}`);
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

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
