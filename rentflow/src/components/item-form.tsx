"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ItemForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    quantity: 1,
    price_per_day: 0,
    deposit_amount: 0,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          category: form.category || undefined,
          quantity: Number(form.quantity),
          price_per_day: Number(form.price_per_day),
          deposit_amount: Number(form.deposit_amount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fehler");
      setOpen(false);
      setForm({ name: "", description: "", category: "", quantity: 1, price_per_day: 0, deposit_amount: 0 });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>Artikel anlegen</Button>;
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <input
        className="w-full rounded-md border bg-background px-3 py-2"
        placeholder="Name (z. B. Partyzelt 6×12 m)"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
      />
      <textarea
        className="w-full rounded-md border bg-background px-3 py-2"
        placeholder="Beschreibung (optional)"
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          className="rounded-md border bg-background px-3 py-2"
          placeholder="Kategorie"
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          Menge
          <input
            type="number"
            min={1}
            className="w-full rounded-md border bg-background px-3 py-2"
            value={form.quantity}
            onChange={(e) => set("quantity", Number(e.target.value))}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          €/Tag
          <input
            type="number"
            min={0}
            step="0.01"
            className="w-full rounded-md border bg-background px-3 py-2"
            value={form.price_per_day}
            onChange={(e) => set("price_per_day", Number(e.target.value))}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          Kaution €
          <input
            type="number"
            min={0}
            step="0.01"
            className="w-full rounded-md border bg-background px-3 py-2"
            value={form.deposit_amount}
            onChange={(e) => set("deposit_amount", Number(e.target.value))}
          />
        </label>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <Button onClick={submit} disabled={saving || !form.name}>
          {saving ? "Speichere…" : "Speichern"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Abbrechen
        </Button>
      </div>
    </div>
  );
}
