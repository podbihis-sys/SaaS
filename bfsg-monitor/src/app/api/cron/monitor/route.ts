import { NextResponse } from "next/server";

import { isAuthorizedCron } from "@/lib/cron-auth";
import { getEntitlements } from "@/lib/entitlements";
import { sendScoreAlert } from "@/lib/resend";
import { requestScan } from "@/lib/scan-worker";
import type { ScanSummary } from "@/lib/scan-types";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FREQUENCY_DAYS = { weekly: 7, daily: 1 } as const;
const REGRESSION_THRESHOLD = 5;
const MAX_PER_RUN = 20;
const FULL_SCAN_PAGES = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Scheduled monitoring: for each monitoring-enabled domain that is due (per the
 * owner's plan frequency), run a scan, persist it, and email the owner if the
 * score regressed. Invoked daily by Vercel Cron; due-ness is decided per domain.
 */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: domains } = await admin
    .from("domains")
    .select("id, user_id, url, label")
    .eq("monitoring_enabled", true)
    .limit(200);

  if (!domains?.length) {
    return NextResponse.json({ processed: 0, alerts: 0 });
  }

  let processed = 0;
  let alerts = 0;

  for (const domain of domains) {
    if (processed >= MAX_PER_RUN) break;

    const { data: profile } = await admin
      .from("profiles")
      .select("plan, plan_status, email")
      .eq("user_id", domain.user_id)
      .single();

    const monitoring = getEntitlements(profile).monitoring;
    if (monitoring === "none") continue;

    const { data: lastScans } = await admin
      .from("scans")
      .select("score, created_at")
      .eq("domain_id", domain.id)
      .order("created_at", { ascending: false })
      .limit(1);
    const last = lastScans?.[0];

    if (last) {
      const age = Date.now() - new Date(last.created_at).getTime();
      if (age < FREQUENCY_DAYS[monitoring] * DAY_MS) continue; // not due yet
    }

    let summary: ScanSummary;
    try {
      summary = await requestScan(domain.url, FULL_SCAN_PAGES);
    } catch {
      continue;
    }
    processed++;

    await admin.from("scans").insert({
      user_id: domain.user_id,
      domain_id: domain.id,
      type: "monitor",
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

    if (
      last?.score != null &&
      summary.score < last.score - REGRESSION_THRESHOLD &&
      profile?.email
    ) {
      try {
        await sendScoreAlert({
          to: profile.email,
          domainLabel: domain.label || domain.url,
          url: domain.url,
          oldScore: last.score,
          newScore: summary.score,
          link: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/app/domains/${domain.id}`,
        });
        alerts++;
      } catch {
        // email failures must not abort the run
      }
    }
  }

  return NextResponse.json({ processed, alerts });
}
