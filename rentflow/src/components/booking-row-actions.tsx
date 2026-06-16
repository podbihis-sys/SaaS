"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { BookingStatus } from "@/types/database";

export function BookingRowActions({ id, status }: { id: string; status: BookingStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "confirm" | "returned" | "cancel", refund?: boolean) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/booking/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, refund }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fehler");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "pending" ? (
        <Button size="sm" variant="outline" onClick={() => act("confirm")} disabled={busy}>
          Bestätigen
        </Button>
      ) : null}
      {(status === "confirmed" || status === "active") && (
        <Button size="sm" onClick={() => act("returned")} disabled={busy}>
          Zurückgegeben (Kaution erstatten)
        </Button>
      )}
      {!["returned", "cancelled", "expired"].includes(status) ? (
        <Button size="sm" variant="ghost" onClick={() => act("cancel", true)} disabled={busy}>
          Stornieren
        </Button>
      ) : null}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
