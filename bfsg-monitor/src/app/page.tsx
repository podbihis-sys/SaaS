import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { DISCLAIMERS, LAW, WCAG } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <span className="inline-block rounded-full border px-3 py-1 text-xs text-muted-foreground">
        {WCAG.standard} {WCAG.level} · {LAW.name}
      </span>

      <div className="space-y-4">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Ist Ihre Website barrierefrei?
        </h1>
        <p className="text-balance text-lg text-muted-foreground">
          BFSG-Monitor prüft Ihre Domain automatisch auf WCAG-Probleme, liefert
          eine priorisierte Mängelliste und überwacht Ihre Barrierefreiheit
          laufend — mit Frühwarnung per E-Mail.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/check" className={cn(buttonVariants({ size: "lg" }))}>
          Kostenlos prüfen
        </Link>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Anmelden
        </Link>
      </div>

      <p className="max-w-xl text-xs text-muted-foreground">
        {DISCLAIMERS.automatedCoverage} {DISCLAIMERS.noLegalAdvice}
      </p>
    </main>
  );
}
