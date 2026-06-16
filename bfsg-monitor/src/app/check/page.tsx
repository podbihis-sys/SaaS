import Link from "next/link";
import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";
import { DISCLAIMERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Kostenlos prüfen" };

// Placeholder for the public free-scan funnel (built out in Phase 3).
export default function CheckPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        Kostenloser Barrierefreiheits-Check
      </h1>
      <p className="text-muted-foreground">
        Der öffentliche Schnell-Check folgt in Phase 3. Lege bis dahin ein Konto
        an, um deine Domains zu hinterlegen.
      </p>
      <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
        Konto anlegen
      </Link>
      <p className="max-w-xl text-xs text-muted-foreground">
        {DISCLAIMERS.automatedCoverage}
      </p>
    </main>
  );
}
