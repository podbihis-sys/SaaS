"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PLAN_DISPLAY, type BillingCycle } from "@/lib/billing";
import type { Plan } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { openPortal, startCheckout } from "./actions";

const PLAN_ORDER: Plan[] = ["free", "starter", "pro"];

export function PlanCards({
  currentPlan,
  hasSubscription,
}: {
  currentPlan: Plan;
  hasSubscription: boolean;
}) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => setCycle("monthly")}
          aria-pressed={cycle === "monthly"}
          className={cn(
            "rounded-full px-3 py-1",
            cycle === "monthly" ? "bg-primary text-primary-foreground" : "border",
          )}
        >
          Monatlich
        </button>
        <button
          type="button"
          onClick={() => setCycle("yearly")}
          aria-pressed={cycle === "yearly"}
          className={cn(
            "rounded-full px-3 py-1",
            cycle === "yearly" ? "bg-primary text-primary-foreground" : "border",
          )}
        >
          Jährlich · 2 Monate gratis
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLAN_ORDER.map((plan) => {
          const display = PLAN_DISPLAY[plan];
          const isCurrent = plan === currentPlan;
          const price = cycle === "monthly" ? display.priceMonthly : display.priceYearly;

          return (
            <div
              key={plan}
              className={cn(
                "flex flex-col rounded-xl border p-5",
                isCurrent && "border-primary ring-1 ring-primary",
              )}
            >
              <h3 className="text-lg font-semibold">{display.name}</h3>
              <p className="text-sm text-muted-foreground">{display.tagline}</p>
              <p className="my-3 text-3xl font-bold">
                {price === 0 ? "0 €" : `${price} €`}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / {cycle === "monthly" ? "Monat" : "Jahr"}
                </span>
              </p>
              <ul className="mb-5 space-y-1 text-sm text-muted-foreground">
                {display.features.map((feature) => (
                  <li key={feature}>· {feature}</li>
                ))}
              </ul>

              <div className="mt-auto">
                {plan === "free" ? (
                  <span className="text-sm text-muted-foreground">
                    {isCurrent ? "Aktueller Plan" : "Im Free-Plan enthalten"}
                  </span>
                ) : isCurrent ? (
                  <form action={openPortal}>
                    <Button type="submit" variant="outline" className="w-full">
                      Abo verwalten
                    </Button>
                  </form>
                ) : (
                  <form action={startCheckout}>
                    <input type="hidden" name="plan" value={plan} />
                    <input type="hidden" name="cycle" value={cycle} />
                    <Button type="submit" className="w-full">
                      {display.name} wählen
                    </Button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasSubscription && (
        <div className="text-center">
          <form action={openPortal}>
            <Button type="submit" variant="ghost">
              Zahlungsdaten & Rechnungen verwalten
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
