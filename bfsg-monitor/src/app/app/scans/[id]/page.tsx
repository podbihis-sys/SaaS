import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ScanSummaryView } from "@/components/scan-summary";
import { buttonVariants } from "@/components/ui/button";
import { getEntitlements } from "@/lib/entitlements";
import type { ScanSummary } from "@/lib/scan-types";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Scan-Bericht" };

export default async function ScanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: scan } = await supabase
    .from("scans")
    .select("id, target_url, raw_result, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!scan || !scan.raw_result) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_status")
    .eq("user_id", user.id)
    .single();
  const canPdf = getEntitlements(profile).pdf;

  const summary = scan.raw_result as unknown as ScanSummary;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">{scan.target_url}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(scan.created_at).toLocaleString("de-DE")}
          </p>
        </div>
        {canPdf && (
          <a
            href={`/api/reports/${scan.id}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            PDF-Bericht
          </a>
        )}
      </header>

      <ScanSummaryView summary={summary} maxIssues={25} />
    </div>
  );
}
