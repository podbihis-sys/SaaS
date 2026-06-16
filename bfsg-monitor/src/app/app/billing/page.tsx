import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PLAN_DISPLAY } from "@/lib/billing";
import { DISCLAIMERS } from "@/lib/constants";
import { normalizePlan } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { PlanCards } from "./plan-cards";

export const metadata: Metadata = { title: "Abo & Rechnung" };

const STATUS_LABEL: Record<string, string> = {
  active: "aktiv",
  trialing: "Testphase",
  past_due: "Zahlung überfällig",
  canceled: "gekündigt",
  incomplete: "unvollständig",
  inactive: "inaktiv",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_status, current_period_end, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  const plan = normalizePlan(profile?.plan);
  const planStatus = profile?.plan_status ?? "inactive";
  const hasSubscription = Boolean(profile?.stripe_customer_id);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Abo & Rechnung</h1>
        <p className="text-muted-foreground">
          Aktueller Plan: <strong>{PLAN_DISPLAY[plan].name}</strong>
          {planStatus !== "inactive"
            ? ` · ${STATUS_LABEL[planStatus] ?? planStatus}`
            : ""}
        </p>
      </header>

      {status === "success" && (
        <Banner kind="ok">
          Vielen Dank! Dein Abo wird aktiviert — das kann einen Moment dauern.
        </Banner>
      )}
      {status === "cancel" && <Banner kind="muted">Checkout abgebrochen.</Banner>}
      {status === "no_customer" && (
        <Banner kind="muted">Es ist noch kein Abo vorhanden.</Banner>
      )}

      <PlanCards currentPlan={plan} hasSubscription={hasSubscription} />

      <p className="text-xs text-muted-foreground">{DISCLAIMERS.noGuarantee}</p>
    </div>
  );
}

function Banner({
  kind,
  children,
}: {
  kind: "ok" | "muted";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-md p-3 text-sm",
        kind === "ok"
          ? "bg-primary/10 text-foreground"
          : "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </div>
  );
}
