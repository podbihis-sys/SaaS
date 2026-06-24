import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ScanSummaryView } from "@/components/scan-summary";
import { Button } from "@/components/ui/button";
import type { ScanSummary } from "@/lib/scan-types";
import { createClient } from "@/lib/supabase/server";

import { scanDomain } from "../actions";

export const metadata: Metadata = { title: "Domain" };

export default async function DomainDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: domain } = await supabase
    .from("domains")
    .select("id, url, label")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!domain) notFound();

  const { data: scans } = await supabase
    .from("scans")
    .select("id, score, created_at, raw_result")
    .eq("domain_id", domain.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const latest = scans?.[0];
  const latestSummary = latest?.raw_result
    ? (latest.raw_result as unknown as ScanSummary)
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">
            {domain.label || domain.url}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{domain.url}</p>
        </div>
        <form action={scanDomain}>
          <input type="hidden" name="id" value={domain.id} />
          <Button type="submit">Scan starten</Button>
        </form>
      </header>

      {error === "scan" && (
        <p className="rounded-md bg-muted p-3 text-sm text-destructive">
          Der Scan konnte nicht durchgeführt werden. Bitte später erneut versuchen.
        </p>
      )}

      {latestSummary ? (
        <section className="space-y-3">
          <h2 className="font-semibold">Letztes Ergebnis</h2>
          <ScanSummaryView summary={latestSummary} maxIssues={8} />
        </section>
      ) : (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Noch kein Scan. Starte den ersten Scan über „Scan starten“.
        </p>
      )}

      {scans && scans.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Verlauf</h2>
          <ul className="divide-y rounded-lg border">
            {scans.map((scan) => (
              <li key={scan.id} className="flex items-center justify-between p-3 text-sm">
                <span className="text-muted-foreground">
                  {new Date(scan.created_at).toLocaleString("de-DE")}
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-medium tabular-nums">Score {scan.score ?? "—"}</span>
                  <Link href={`/app/scans/${scan.id}`} className="underline">
                    Details
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
