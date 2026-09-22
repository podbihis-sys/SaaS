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
import { displayCartItem } from "../_lib/cart-display";
import { COMPANY } from "../_data/catalog";

interface FormState {
  company: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

const EMPTY_FORM: FormState = { company: "", name: "", email: "", phone: "", message: "" };

const STRINGS = {
  de: {
    products: "/bit/produkte",
    productHref: (category: string, slug: string) => `/bit/produkte/${category}/${slug}`,
    thanksTitle: "Vielen Dank für Ihre Anfrage!",
    thanksText:
      "Wir haben Ihre Anfrage erhalten und melden uns mit einem individuellen Angebot – in der Regel innerhalb von 24 Stunden.",
    reference: "Ihre Anfragenummer",
    continue: "Weiter zum Sortiment",
    title: "Warenkorb & Anfrage",
    intro: "Prüfen Sie Ihre Positionen und senden Sie alles in einer einzigen, unverbindlichen Anfrage.",
    empty: "Ihr Warenkorb ist leer",
    emptyHint: "Fügen Sie Artikel in den gewünschten Größen hinzu, um eine Anfrage zu stellen.",
    toProducts: "Zum Sortiment",
    thArticle: "Artikel", thSize: "Größe", thQty: "Menge",
    less: "Weniger", more: "Mehr",
    qtyFor: (name: string) => `Menge für ${name}`,
    length: "Länge", lengths: "Längen", roll: "Rolle", rolls: "Rollen", pack: "Gebinde",
    total: "gesamt", pieces: "Stück",
    remove: (name: string) => `${name} aus dem Warenkorb entfernen`,
    clear: "Warenkorb leeren",
    addMore: "Weitere Artikel hinzufügen",
    sendTitle: "Anfrage senden",
    positions: (n: number) => `${n} Position(en) · unverbindlich`,
    company: "Firma", name: "Name", email: "E-Mail", phone: "Telefon", message: "Nachricht",
    placeholder: "Mengen, Toleranzen, Wunschtermin …",
    sending: "Anfrage wird gesendet …", sendingBtn: "Wird gesendet …", send: "Anfrage absenden",
    consent: (phone: string) =>
      `Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Angaben zur Bearbeitung der Anfrage zu. Oder rufen Sie an: ${phone}.`,
    errSend: "Die Anfrage konnte nicht gesendet werden.", errUnknown: "Unbekannter Fehler.",
    required: "(Pflichtfeld)",
    noteLabel: "Anmerkung zu diesem Artikel",
    notePlaceholder: "z. B. Bedruckung mit Logo, Sonderlänge, Farbwunsch …",
    numLocale: "de-DE",
  },
  en: {
    products: "/bit/en/products",
    productHref: (category: string, slug: string) => `/bit/en/products/${category}/${slug}`,
    thanksTitle: "Thank you for your inquiry!",
    thanksText:
      "We have received your inquiry and will get back to you with an individual quote – usually within 24 hours.",
    reference: "Your inquiry number",
    continue: "Continue to products",
    title: "Cart & inquiry",
    intro: "Review your items and send everything in a single, non-binding inquiry.",
    empty: "Your cart is empty",
    emptyHint: "Add articles in the required sizes to submit an inquiry.",
    toProducts: "Browse products",
    thArticle: "Article", thSize: "Size", thQty: "Quantity",
    less: "Less", more: "More",
    qtyFor: (name: string) => `Quantity for ${name}`,
    length: "length", lengths: "lengths", roll: "roll", rolls: "rolls", pack: "pack",
    total: "in total", pieces: "pcs",
    remove: (name: string) => `Remove ${name} from cart`,
    clear: "Empty cart",
    addMore: "Add more articles",
    sendTitle: "Send inquiry",
    positions: (n: number) => `${n} item(s) · non-binding`,
    company: "Company", name: "Name", email: "Email", phone: "Phone", message: "Message",
    placeholder: "Quantities, tolerances, requested date …",
    sending: "Sending inquiry …", sendingBtn: "Sending …", send: "Send inquiry",
    consent: (phone: string) =>
      `By submitting you agree to the processing of your details for handling the inquiry. Or call us: ${phone}.`,
    errSend: "The inquiry could not be sent.", errUnknown: "Unknown error.",
    required: "(required)",
    noteLabel: "Note on this article",
    notePlaceholder: "e.g. printing with logo, special length, colour request …",
    numLocale: "en-GB",
  },
} as const;

/** Warenkorb + Anfrageformular – deutsche und englische Ausgabe. */
export function CartPageView({ locale = "de" }: { locale?: "de" | "en" }) {
  const t = STRINGS[locale];
  const { items, updateQuantity, updateNote, removeItem, clear } = useCart();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const fmt = (n: number) => n.toLocaleString(t.numLocale, { maximumFractionDigits: 2 });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      // Die Positionsangaben gehen als interne Mail an BIT und bleiben deutsch.
      const res = await fetch("/bit/api/anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => {
            const { name, size, color } = displayCartItem(item, locale);
            const { code, unit, quantity, metersPerRoll, unitsPerPack, note } = item;
            return {
            name: code && code !== name ? `${name} (${code})` : name,
            size,
            color,
            note: note?.trim() || undefined,
            unit: metersPerRoll
              ? unit === "Länge" || unit === "Length" || metersPerRoll === 1.22
                ? `Länge (${metersPerRoll.toLocaleString("de-DE", { maximumFractionDigits: 2 })} m/Länge, gesamt ${(quantity * metersPerRoll).toLocaleString("de-DE", { maximumFractionDigits: 2 })} m)`
                : `Rolle (${metersPerRoll} m/Rolle, gesamt ${quantity * metersPerRoll} m)`
              : unitsPerPack
                ? `Gebinde (${unitsPerPack} Stück/Gebinde, gesamt ${quantity * unitsPerPack} Stück)`
                : unit,
            quantity,
            };
          }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.errSend);
      setReference(data.reference);
      setStatus("done");
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errUnknown);
      setStatus("error");
    }
  }

  // Erfolgsansicht
  if (status === "done") {
    return (
      <div className="container py-20">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
          <h1 className="mt-5 text-2xl font-bold text-slate-900">{t.thanksTitle}</h1>
          <p className="mt-3 text-slate-600">{t.thanksText}</p>
          <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">{t.reference}</span>
            <div className="mt-1 text-lg font-semibold tracking-wide text-[#1e4a7a]">{reference}</div>
          </div>
          <Link
            href={t.products}
            className="mt-8 inline-flex rounded-xl bg-[#1e4a7a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#163a61]"
          >
            {t.continue}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.title}</h1>
      <p className="mt-2 text-slate-600">{t.intro}</p>

      {items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-20 text-center">
          <ShoppingCart className="h-12 w-12 text-slate-300" />
          <p className="mt-4 text-lg font-medium text-slate-700">{t.empty}</p>
          <p className="mt-1 text-sm text-slate-500">{t.emptyHint}</p>
          <Link
            href={t.products}
            className="mt-6 rounded-xl bg-[#1e4a7a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#163a61]"
          >
            {t.toProducts}
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
                    <th className="px-5 py-3 font-medium">{t.thArticle}</th>
                    <th className="px-3 py-3 font-medium">{t.thSize}</th>
                    <th className="px-3 py-3 font-medium">{t.thQty}</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const isLength =
                      item.unit === "Länge" || item.unit === "Length" || item.metersPerRoll === 1.22;
                    const shown = displayCartItem(item, locale);
                    return (
                    <tr key={item.id}>
                      <td className="px-5 py-4">
                        <Link
                          href={t.productHref(item.category, item.slug)}
                          className="font-medium text-slate-900 hover:text-[#1e4a7a]"
                        >
                          {shown.name}
                        </Link>
                        {item.code && item.code !== shown.name && (
                          <span className="ml-1.5 rounded bg-[#0f2742] px-1.5 py-0.5 font-mono text-[11px] font-medium text-white/90">
                            {item.code}
                          </span>
                        )}
                        {shown.color && (
                          <div className="mt-0.5 text-xs text-slate-500">{shown.color}</div>
                        )}
                        {/* Anmerkung je Position (Kundenvorgabe) */}
                        <textarea
                          value={item.note ?? ""}
                          onChange={(e) => updateNote(item.id, e.target.value)}
                          aria-label={`${t.noteLabel}: ${shown.name}`}
                          placeholder={t.notePlaceholder}
                          rows={2}
                          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#1e4a7a] focus:ring-1 focus:ring-[#1e4a7a]"
                        />
                      </td>
                      <td className="px-3 py-4 text-slate-700">{shown.size}</td>
                      <td className="px-3 py-4">
                        <div className="inline-flex items-center rounded-lg border border-slate-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label={t.less}
                            className="px-2 py-1.5 text-slate-600 hover:bg-slate-50"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            aria-label={t.qtyFor(shown.name)}
                            onChange={(e) =>
                              updateQuantity(item.id, parseInt(e.target.value || "1", 10))
                            }
                            className="w-12 border-x border-slate-200 py-1 text-center text-slate-900 outline-none"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label={t.more}
                            className="px-2 py-1.5 text-slate-600 hover:bg-slate-50"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {item.metersPerRoll
                            ? `${
                                isLength
                                  ? item.quantity === 1 ? t.length : t.lengths
                                  : item.quantity === 1 ? t.roll : t.rolls
                              } · ${fmt(item.quantity * item.metersPerRoll)} m ${t.total}`
                            : item.unitsPerPack
                              ? `${t.pack} · ${item.quantity * item.unitsPerPack} ${t.pieces} ${t.total}`
                              : item.unit}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-right">
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label={t.remove(shown.name)}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={clear} className="text-sm text-slate-500 hover:text-red-600">
                {t.clear}
              </button>
              <Link href={t.products} className="text-sm font-medium text-[#1e4a7a] hover:underline">
                {t.addMore}
              </Link>
            </div>
          </div>

          {/* Inquiry form */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
            >
              <h2 className="text-lg font-semibold text-slate-900">{t.sendTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {t.positions(items.reduce((s, i) => s + i.quantity, 0))}
              </p>

              <div className="mt-5 space-y-3">
                <Field id="anfrage-firma" label={t.company} autoComplete="organization" value={form.company} onChange={(v) => setForm({ ...form, company: v })} required={false} requiredLabel={t.required} />
                <Field id="anfrage-name" label={t.name} autoComplete="name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required requiredLabel={t.required} />
                <Field id="anfrage-email" label={t.email} type="email" autoComplete="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required requiredLabel={t.required} />
                <Field id="anfrage-telefon" label={t.phone} type="tel" autoComplete="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required={false} requiredLabel={t.required} />
                <div>
                  <label htmlFor="anfrage-nachricht" className="text-sm font-medium text-slate-700">
                    {t.message}
                  </label>
                  <textarea
                    id="anfrage-nachricht"
                    name="anfrage-nachricht"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                    placeholder={t.placeholder}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e4a7a] focus:ring-1 focus:ring-[#1e4a7a]"
                  />
                </div>
              </div>

              {status === "error" && (
                <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                  {error}
                </p>
              )}
              <p role="status" aria-live="polite" className="bit-sr-only">
                {status === "sending" ? t.sending : ""}
              </p>

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-5 w-full rounded-xl bg-[#38bdf8] px-4 py-3.5 text-sm font-semibold text-slate-900 hover:bg-[#0ea5e9] disabled:opacity-60"
              >
                {status === "sending" ? t.sendingBtn : t.send}
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">{t.consent(COMPANY.phone)}</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  requiredLabel,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  requiredLabel: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
        {required && (
          <>
            {" "}
            <span aria-hidden="true">*</span>
            <span className="bit-sr-only">{requiredLabel}</span>
          </>
        )}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e4a7a] focus:ring-1 focus:ring-[#1e4a7a]"
      />
    </div>
  );
}
