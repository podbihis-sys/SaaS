"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface FormState {
  company: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

const EMPTY: FormState = { company: "", name: "", email: "", phone: "", message: "" };

/**
 * Allgemeines Kontaktformular (ohne Warenkorb). Barrierefrei: Labels sind per
 * htmlFor/id verknüpft, Fehler werden per role="alert" angekündigt, sichtbare
 * Fokus-Indikatoren.
 */
export function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/bit/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Die Nachricht konnte nicht gesendet werden.");
      setReference(data.reference);
      setStatus("done");
      setForm(EMPTY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-bold text-slate-900">Vielen Dank für Ihre Nachricht!</h3>
        <p className="mt-2 text-slate-600">
          Wir melden uns in der Regel innerhalb von 24 Stunden bei Ihnen.
        </p>
        <p className="mt-4 text-sm text-slate-500">
          Ihre Referenz: <span className="font-semibold text-[#1e4a7a]">{reference}</span>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h2 className="text-lg font-semibold text-slate-900">Nachricht senden</h2>
      <p className="mt-1 text-sm text-slate-600">
        Wir antworten in der Regel innerhalb von 24 Stunden. Felder mit * sind Pflichtfelder.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field id="kontakt-firma" label="Firma" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
        <Field id="kontakt-name" label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field id="kontakt-email" label="E-Mail *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
        <Field id="kontakt-telefon" label="Telefon" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
      </div>
      <div className="mt-3">
        <label htmlFor="kontakt-nachricht" className="text-sm font-medium text-slate-700">
          Nachricht *
        </label>
        <textarea
          id="kontakt-nachricht"
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={5}
          placeholder="Ihr Anliegen, gewünschte Artikel, Mengen, Termine …"
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e4a7a] focus:ring-1 focus:ring-[#1e4a7a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1e4a7a]"
        />
      </div>

      {status === "error" && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-5 w-full rounded-xl bg-[#1e4a7a] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#163a61] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4a7a] sm:w-auto sm:px-8"
      >
        {status === "sending" ? "Wird gesendet …" : "Nachricht absenden"}
      </button>
      <p className="mt-3 text-xs text-slate-500">
        Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Angaben zur Bearbeitung der Anfrage zu.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
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
