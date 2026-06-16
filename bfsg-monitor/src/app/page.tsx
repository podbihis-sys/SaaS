import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { DISCLAIMERS, LAW, WCAG } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: "1",
    title: "Domain eingeben & scannen",
    body: `Wir prüfen Ihre Seite automatisch gegen ${WCAG.standard} ${WCAG.level} (axe-core) — ohne Anmeldung.`,
  },
  {
    n: "2",
    title: "Priorisierten Bericht erhalten",
    body: "Score von 0–100, Mängel nach Schweregrad sortiert, mit Lösungshinweisen und PDF-Nachweis.",
  },
  {
    n: "3",
    title: "Laufend überwachen",
    body: "BFSG-Monitor scannt regelmäßig und warnt per E-Mail, sobald sich die Barrierefreiheit verschlechtert.",
  },
];

const LIMITS = [
  DISCLAIMERS.automatedCoverage,
  "Wir scannen, berichten und überwachen — kein Overlay, kein Auto-Fix, keine Veränderung Ihrer Website.",
  DISCLAIMERS.noGuarantee,
  DISCLAIMERS.noLegalAdvice,
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "BFSG-Monitor",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "29", priceCurrency: "EUR" },
            description:
              "Automatischer WCAG-Check und laufendes Monitoring der Barrierefreiheit Ihrer Website.",
          }),
        }}
      />

      <section className="flex flex-col items-center gap-6 text-center">
        <span className="inline-block rounded-full border px-3 py-1 text-xs text-muted-foreground">
          {WCAG.standard} {WCAG.level} · {LAW.name}
        </span>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Ist Ihre Website barrierefrei?
        </h1>
        <p className="max-w-2xl text-balance text-lg text-muted-foreground">
          BFSG-Monitor prüft Ihre Domain automatisch auf WCAG-Probleme, liefert
          eine priorisierte Mängelliste und überwacht Ihre Barrierefreiheit
          laufend — mit Frühwarnung per E-Mail.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/check" className={cn(buttonVariants({ size: "lg" }))}>
            Kostenlos prüfen
          </Link>
          <Link
            href="/pricing"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Preise ansehen
          </Link>
        </div>
      </section>

      <section className="mt-20 space-y-8">
        <h2 className="text-center text-2xl font-semibold">So funktioniert&apos;s</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="rounded-xl border p-5">
              <div className="mb-2 flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {step.n}
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">
          Was BFSG-Monitor leistet — und was nicht
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {LIMITS.map((limit) => (
            <li key={limit} className="flex gap-2">
              <span aria-hidden>•</span>
              <span>{limit}</span>
            </li>
          ))}
        </ul>
        <Link href="/check" className={cn(buttonVariants({ size: "lg" }), "mt-2")}>
          Jetzt kostenlos prüfen
        </Link>
      </section>
    </main>
  );
}
