import type { Metadata } from "next";

import { DISCLAIMERS, WCAG } from "@/lib/constants";

import { FreeScanForm } from "./free-scan-form";

export const metadata: Metadata = {
  title: "Kostenloser Barrierefreiheits-Check",
  description:
    "Prüfen Sie Ihre Website kostenlos auf WCAG-Probleme. Score, Mängelliste, keine Anmeldung.",
};

export default function CheckPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        Kostenloser Barrierefreiheits-Check
      </h1>
      <p className="text-balance text-muted-foreground">
        Geben Sie Ihre Domain ein — wir prüfen die Startseite automatisch gegen{" "}
        {WCAG.standard} {WCAG.level} und zeigen die wichtigsten Mängel.
      </p>

      <FreeScanForm />

      <p className="max-w-xl text-xs text-muted-foreground">
        {DISCLAIMERS.automatedCoverage} {DISCLAIMERS.noLegalAdvice}
      </p>
    </main>
  );
}
