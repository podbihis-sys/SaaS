"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { calcRentalPrice } from "@/lib/booking/pricing";
import { formatEur } from "@/lib/utils";

export interface WidgetItem {
  id: string;
  name: string;
  description: string | null;
  price_per_day: number;
  deposit_amount: number;
  quantity: number;
}

export function BookingWidget({ slug, items }: { slug: string; items: WidgetItem[] }) {
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [available, setAvailable] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const item = items.find((i) => i.id === itemId);

  const price = useMemo(() => {
    if (!item || !start || !end || start > end) return null;
    try {
      return calcRentalPrice({
        pricePerDay: item.price_per_day,
        depositAmount: item.deposit_amount,
        startDate: start,
        endDate: end,
        quantity,
      });
    } catch {
      return null;
    }
  }, [item, start, end, quantity]);

  async function checkAvailability() {
    setError(null);
    setAvailable(null);
    if (!itemId || !start || !end) {
      setError("Bitte Artikel und Zeitraum wählen.");
      return;
    }
    setChecking(true);
    try {
      const res = await fetch("/api/booking/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId, start_date: start, end_date: end, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fehler");
      setAvailable(data.available);
      if (!data.ok) setError("Im gewählten Zeitraum nicht in dieser Menge verfügbar.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler bei der Prüfung.");
    } finally {
      setChecking(false);
    }
  }

  async function submit() {
    setError(null);
    if (!name || !email) {
      setError("Bitte Name und E-Mail angeben.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          item_id: itemId,
          start_date: start,
          end_date: end,
          quantity,
          customer_name: name,
          customer_email: email,
          customer_phone: phone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Buchung fehlgeschlagen");
      if (data.checkout_url) {
        window.location.href = data.checkout_url; // → Stripe Checkout (connected account)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Buchung fehlgeschlagen.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <p className="text-muted-foreground">Derzeit sind keine Artikel buchbar.</p>;
  }

  return (
    <div className="space-y-4 rounded-lg border p-5">
      <div>
        <label className="mb-1 block text-sm font-medium">Artikel</label>
        <select
          className="w-full rounded-md border bg-background px-3 py-2"
          value={itemId}
          onChange={(e) => {
            setItemId(e.target.value);
            setAvailable(null);
          }}
        >
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name} — {formatEur(i.price_per_day)}/Tag
            </option>
          ))}
        </select>
        {item?.description ? (
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Von</label>
          <input
            type="date"
            className="w-full rounded-md border bg-background px-3 py-2"
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              setAvailable(null);
            }}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Bis</label>
          <input
            type="date"
            className="w-full rounded-md border bg-background px-3 py-2"
            value={end}
            min={start || undefined}
            onChange={(e) => {
              setEnd(e.target.value);
              setAvailable(null);
            }}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Menge</label>
        <input
          type="number"
          min={1}
          className="w-28 rounded-md border bg-background px-3 py-2"
          value={quantity}
          onChange={(e) => {
            setQuantity(Math.max(1, Number(e.target.value)));
            setAvailable(null);
          }}
        />
      </div>

      <Button type="button" variant="outline" onClick={checkAvailability} disabled={checking}>
        {checking ? "Prüfe…" : "Verfügbarkeit prüfen"}
      </Button>

      {available !== null ? (
        <p className="text-sm">
          Verfügbar im Zeitraum: <strong>{available}</strong> Stück
        </p>
      ) : null}

      {price ? (
        <div className="rounded-md bg-muted p-3 text-sm">
          <div className="flex justify-between">
            <span>
              Miete ({price.days} {price.days === 1 ? "Tag" : "Tage"})
            </span>
            <span>{formatEur(price.rentalTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kaution (Rückerstattung bei Rückgabe)</span>
            <span>{formatEur(price.depositTotal)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t pt-1 font-semibold">
            <span>Jetzt zu zahlen</span>
            <span>{formatEur(price.rentalTotal + price.depositTotal)}</span>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 border-t pt-4">
        <input
          className="w-full rounded-md border bg-background px-3 py-2"
          placeholder="Dein Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          className="w-full rounded-md border bg-background px-3 py-2"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-md border bg-background px-3 py-2"
          placeholder="Telefon (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="button" className="w-full" onClick={submit} disabled={submitting}>
        {submitting ? "Weiter zur Zahlung…" : "Jetzt buchen & bezahlen"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Die Zahlung wird sicher über Stripe abgewickelt und geht direkt an den Verleih-Betrieb.
      </p>
    </div>
  );
}
