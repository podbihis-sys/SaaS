"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useCart } from "../_lib/cart";
import { COMPANY } from "../_data/catalog";

interface FormState {
  company: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

const EMPTY_FORM: FormState = { company: "", name: "", email: "", phone: "", message: "" };

export default function CartPage() {
  const { items, updateQuantity, removeItem, clear } = useCart();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [reference, setReference] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/bit/api/anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map(({ name, size, color, unit, quantity, metersPerRoll, unitsPerPack }) => ({
            name,
            size,
            color,
            unit: metersPerRoll
              ? `Rolle (${metersPerRoll} m/Rolle, gesamt ${quantity * metersPerRoll} m)`
              : unitsPerPack
                ? `Gebinde (${unitsPerPack} Stück/Gebinde, gesamt ${quantity * unitsPerPack} Stück)`
                : unit,
            quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Die Anfrage konnte nicht gesendet werden.");
      setReference(data.reference);
      setStatus("done");
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
      setStatus("error");
    }
  }

  // Erfolgsansicht
  if (status === "done") {
    return (
      <div className="container py-20">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
          <h1 className="mt-5 text-2xl font-bold text-slate-900">Vielen Dank für Ihre Anfrage!</h1>
          <p className="mt-3 text-slate-600">
            Wir haben Ihre Anfrage erhalten und melden uns mit einem individuellen Angebot –
            in der Regel innerhalb von 24 Stunden.
          </p>
          <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">Ihre Anfragenummer</span>
            <div className="mt-1 text-lg font-semibold tracking-wide text-[#1e4a7a]">{reference}</div>
          </div>
          <Link
            href="/bit/produkte"
            className="mt-8 inline-flex rounded-xl bg-[#1e4a7a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#163a61]"
          >
            Weiter zum Sortiment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Warenkorb & Anfrage</h1>
      <p className="mt-2 text-slate-600">
        Prüfen Sie Ihre Positionen und senden Sie alles in einer einzigen, unverbindlichen Anfrage.
      </p>

      {items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-20 text-center">
          <ShoppingCart className="h-12 w-12 text-slate-300" />
          <p className="mt-4 text-lg font-medium text-slate-700">Ihr Warenkorb ist leer</p>
          <p className="mt-1 text-sm text-slate-500">
            Fügen Sie Artikel in den gewünschten Größen hinzu, um eine Anfrage zu stellen.
          </p>
          <Link
            href="/bit/produkte"
            className="mt-6 rounded-xl bg-[#1e4a7a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#163a61]"
          >
            Zum Sortiment
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
          {/* Items */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Artikel</th>
                    <th className="px-3 py-3 font-medium">Größe</th>
                    <th className="px-3 py-3 font-medium">Menge</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4">
                        <Link
                          href={`/bit/produkte/${item.slug}`}
                          className="font-medium text-slate-900 hover:text-[#1e4a7a]"
                        >
                          {item.name}
                        </Link>
                        {item.color && (
                          <div className="mt-0.5 text-xs text-slate-500">{item.color}</div>
                        )}
                      </td>
                      <td className="px-3 py-4 text-slate-700">{item.size}</td>
                      <td className="px-3 py-4">
                        <div className="inline-flex items-center rounded-lg border border-slate-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Weniger"
                            className="px-2 py-1.5 text-slate-600 hover:bg-slate-50"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            aria-label={`Menge – ${item.name}`}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, parseInt(e.target.value || "1", 10))
                            }
                            className="w-12 border-x border-slate-200 py-1 text-center text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1e4a7a]"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Mehr"
                            className="px-2 py-1.5 text-slate-600 hover:bg-slate-50"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {item.metersPerRoll
                            ? `${item.quantity === 1 ? "Rolle" : "Rollen"} · ${item.quantity * item.metersPerRoll} m gesamt`
                            : item.unitsPerPack
                              ? `Gebinde · ${item.quantity * item.unitsPerPack} Stück gesamt`
                              : item.unit}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-right">
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label="Entfernen"
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={clear} className="text-sm text-slate-500 hover:text-red-600">
                Warenkorb leeren
              </button>
              <Link href="/bit/produkte" className="text-sm font-medium text-[#1e4a7a] hover:underline">
                Weitere Artikel hinzufügen
              </Link>
            </div>
          </div>

          {/* Inquiry form */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
            >
              <h2 className="text-lg font-semibold text-slate-900">Anfrage senden</h2>
              <p className="mt-1 text-sm text-slate-500">
                {items.reduce((s, i) => s + i.quantity, 0)} Position(en) · unverbindlich
              </p>

              <div className="mt-5 space-y-3">
                <Field label="Firma" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
                <Field label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Field label="E-Mail *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                <Field label="Telefon" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <div>
                  <label htmlFor="feld-nachricht" className="text-sm font-medium text-slate-700">Nachricht</label>
                  <textarea
                    id="feld-nachricht"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                    placeholder="Mengen, Toleranzen, Wunschtermin …"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e4a7a] focus:ring-1 focus:ring-[#1e4a7a]"
                  />
                </div>
              </div>

              {status === "error" && (
                <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-5 w-full rounded-xl bg-[#38bdf8] px-4 py-3.5 text-sm font-semibold text-slate-900 hover:bg-[#0ea5e9] disabled:opacity-60"
              >
                {status === "sending" ? "Wird gesendet …" : "Anfrage absenden"}
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">
                Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Angaben zur Bearbeitung der
                Anfrage zu. Oder rufen Sie an: {COMPANY.phone}.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  const id = "feld-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e4a7a] focus:ring-1 focus:ring-[#1e4a7a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1e4a7a]"
      />
    </div>
  );
}
