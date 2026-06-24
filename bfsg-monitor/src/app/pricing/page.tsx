import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { PLAN_DISPLAY } from "@/lib/billing";
import { DISCLAIMERS } from "@/lib/constants";
import type { Plan } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Preise",
  description:
    "BFSG-Monitor: transparente Pläne für automatisiertes Barrierefreiheits-Monitoring. Free, Starter und Pro.",
};

const PLAN_ORDER: Plan[] = ["free", "starter", "pro"];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-16">
      <header className="space-y-3 text-center">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Preise
        </h1>
        <p className="text-balance text-muted-foreground">
          14 Tage kostenlos testen. Monatlich kündbar.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {PLAN_ORDER.map((plan) => {
          const display = PLAN_DISPLAY[plan];
          return (
            <div key={plan} className="flex flex-col rounded-xl border p-6">
              <h2 className="text-lg font-semibold">{display.name}</h2>
              <p className="text-sm text-muted-foreground">{display.tagline}</p>
              <p className="my-4 text-3xl font-bold">
                {display.priceMonthly === 0 ? "0 €" : `${display.priceMonthly} €`}
                <span className="text-sm font-normal text-muted-foreground"> / Monat</span>
              </p>
              <ul className="mb-6 space-y-1 text-sm text-muted-foreground">
                {display.features.map((feature) => (
                  <li key={feature}>· {feature}</li>
                ))}
              </ul>
              <Link
                href={plan === "free" ? "/check" : "/login"}
                className={cn(buttonVariants({ variant: plan === "starter" ? "default" : "outline" }), "mt-auto")}
              >
                {plan === "free" ? "Kostenlos prüfen" : `${display.name} starten`}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {DISCLAIMERS.automatedCoverage} {DISCLAIMERS.noLegalAdvice}
      </p>
    </main>
  );
}
