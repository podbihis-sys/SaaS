import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Scans & Berichte" };

const TYPE_LABEL: Record<string, string> = {
  free: "Gratis-Check",
  full: "Voll-Scan",
  monitor: "Monitoring",
};

export default async function ScansPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: scans } = await supabase
    .from("scans")
    .select("id, type, target_url, score, total_issues, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Scans & Berichte</h1>
        <p className="text-muted-foreground">Deine letzten Scans.</p>
      </header>

      <ul className="divide-y rounded-lg border">
        {scans && scans.length > 0 ? (
          scans.map((scan) => (
            <li key={scan.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <Link href={`/app/scans/${scan.id}`} className="font-medium hover:underline">
                  {scan.target_url ?? "—"}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {TYPE_LABEL[scan.type] ?? scan.type} ·{" "}
                  {new Date(scan.created_at).toLocaleString("de-DE")}
                </p>
              </div>
              <span className="shrink-0 text-sm tabular-nums">
                Score <strong>{scan.score ?? "—"}</strong> · {scan.total_issues ?? 0} Probleme
              </span>
            </li>
          ))
        ) : (
          <li className="p-6 text-center text-sm text-muted-foreground">
            Noch keine Scans vorhanden.
          </li>
        )}
      </ul>
    </div>
  );
}
