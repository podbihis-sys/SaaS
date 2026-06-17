"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

async function postAndRedirect(url: string, body?: unknown): Promise<string | null> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Aktion fehlgeschlagen");
  return data.url ?? null;
}

export function ConnectButton({ done }: { done: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setError(null);
    setLoading(true);
    try {
      const url = await postAndRedirect("/api/connect/onboard");
      if (url) window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={go} disabled={loading}>
        {loading ? "Öffne Stripe…" : done ? "Stripe-Daten aktualisieren" : "Connect-Onboarding starten"}
      </Button>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function SubscribeButtons() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(plan: "solo" | "pro", interval: "monthly" | "yearly") {
    setError(null);
    setLoading(`${plan}-${interval}`);
    try {
      const url = await postAndRedirect("/api/checkout", { plan, interval });
      if (url) window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => subscribe("solo", "monthly")} disabled={!!loading}>
          Solo · 79 €/Monat
        </Button>
        <Button variant="outline" onClick={() => subscribe("solo", "yearly")} disabled={!!loading}>
          Solo · 790 €/Jahr
        </Button>
        <Button onClick={() => subscribe("pro", "monthly")} disabled={!!loading}>
          Pro · 149 €/Monat
        </Button>
        <Button onClick={() => subscribe("pro", "yearly")} disabled={!!loading}>
          Pro · 1490 €/Jahr
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">14 Tage kostenlos testen. Jederzeit kündbar.</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function PortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setError(null);
    setLoading(true);
    try {
      const url = await postAndRedirect("/api/portal");
      if (url) window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="outline" onClick={go} disabled={loading}>
        {loading ? "Öffne Portal…" : "Abo verwalten"}
      </Button>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
