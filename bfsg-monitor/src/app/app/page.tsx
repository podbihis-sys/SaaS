import type { Metadata } from "next";

import { DISCLAIMERS } from "@/lib/constants";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Überblick über die Barrierefreiheit deiner Domains.
        </p>
      </header>

      <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
        Noch keine Domain hinzugefügt. Domain-Verwaltung, Scans und Berichte
        folgen in den nächsten Phasen.
      </div>

      <p className="text-xs text-muted-foreground">
        {DISCLAIMERS.automatedCoverage}
      </p>
    </div>
  );
}
