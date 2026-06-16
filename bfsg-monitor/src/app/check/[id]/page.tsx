import Link from "next/link";
import { notFound } from "next/navigation";

import { ScanSummaryView } from "@/components/scan-summary";
import { buttonVariants } from "@/components/ui/button";
import { DISCLAIMERS } from "@/lib/constants";
import type { ScanSummary } from "@/lib/scan-types";
import { createAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";

export default async function FreeScanResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: scan } = await admin
    .from("scans")
    .select("id, type, target_url, raw_result")
    .eq("id", id)
    .maybeSingle();

  if (!scan || scan.type !== "free" || !scan.raw_result) {
    notFound();
  }

  const summary = scan.raw_result as unknown as ScanSummary;

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <div className="space-y-1 text-center">
        <p className="text-sm text-muted-foreground">Ergebnis für</p>
        <h1 className="text-2xl font-semibold break-all">{scan.target_url}</h1>
      </div>

      <ScanSummaryView summary={summary} />

      <div className="space-y-3 rounded-lg border bg-card p-6 text-center">
        <p className="font-medium">Behalten Sie Ihre Barrierefreiheit im Blick.</p>
        <p className="text-sm text-muted-foreground">
          Mit einem Konto überwachen Sie Ihre Domain laufend, scannen alle
          Unterseiten und erhalten ein PDF-Nachweisdokument.
        </p>
        <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
          Konto anlegen
        </Link>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {DISCLAIMERS.automatedCoverage} {DISCLAIMERS.noLegalAdvice}
      </p>
    </main>
  );
}
