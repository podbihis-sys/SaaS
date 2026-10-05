"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

type Locale = "de" | "en";

interface FormState {
  company: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

const EMPTY: FormState = { company: "", name: "", email: "", phone: "", message: "" };

const STRINGS = {
  de: {
    heading: "Schreiben Sie uns",
    subline: "Füllen Sie das Formular aus – wir melden uns in der Regel innerhalb von 24 Stunden.",
    company: "Firma",
    name: "Name",
    email: "E-Mail",
    phone: "Telefon",
    message: "Ihre Nachricht",
    optional: "optional",
    submit: "Nachricht senden",
    sending: "Wird gesendet …",
    successTitle: "Vielen Dank für Ihre Nachricht!",
    successText: "Wir haben Ihre Anfrage erhalten und melden uns zeitnah bei Ihnen.",
    reference: "Ihre Referenz",
    another: "Weitere Nachricht senden",
    error: "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
  },
  en: {
    heading: "Send us a message",
    subline: "Fill in the form – we usually reply within 24 hours.",
    company: "Company",
    name: "Name",
    email: "Email",
    phone: "Phone",
    message: "Your message",
    optional: "optional",
    submit: "Send message",
    sending: "Sending …",
    successTitle: "Thank you for your message!",
    successText: "We have received your enquiry and will get back to you shortly.",
    reference: "Your reference",
    another: "Send another message",
    error: "The message could not be sent. Please try again.",
  },
} as const;

export function ContactForm({ locale = "de" }: { locale?: Locale }) {
  const t = STRINGS[locale];
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [reference, setReference] = useState<string | null>(null);

  const update = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const response = await fetch("/bit/api/anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items: [] }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setErrorMsg(data?.error || t.error);
        setStatus("error");
        return;
      }
      const data = (await response.json()) as { reference?: string };
      setReference(data.reference ?? null);
      setForm(EMPTY);
      setStatus("idle");
    } catch {
      setErrorMsg(t.error);
      setStatus("error");
    }
  }

  if (reference) {
    return (
      <div className="flex h-full min-h-[420px] flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#1e4a7a]" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-bold text-slate-900">{t.successTitle}</h3>
        <p className="mt-2 text-slate-600">{t.successText}</p>
        <p className="mt-4 text-sm text-slate-500">
          {t.reference}: <span className="font-mono font-semibold text-slate-700">{reference}</span>
        </p>
        <button
          type="button"
          onClick={() => setReference(null)}
          className="mx-auto mt-6 inline-flex rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white"
        >
          {t.another}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8"
    >
      <h3 className="text-xl font-bold text-slate-900">{t.heading}</h3>
      <p className="mt-2 text-sm text-slate-600">{t.subline}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label={t.company} hint={t.optional} value={form.company} onChange={update("company")} autoComplete="organization" />
        <Field label={t.phone} hint={t.optional} value={form.phone} onChange={update("phone")} type="tel" autoComplete="tel" />
        <Field label={t.name} required value={form.name} onChange={update("name")} autoComplete="name" />
        <Field label={t.email} required type="email" value={form.email} onChange={update("email")} autoComplete="email" />
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">
          {t.message} <span aria-hidden="true" className="text-[#1e4a7a]">*</span>
        </span>
        <textarea
          required
          rows={6}
          value={form.message}
          onChange={update("message")}
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#1e4a7a] focus:ring-2 focus:ring-[#1e4a7a]/20"
        />
      </label>

      {status === "error" && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e4a7a] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#163a61] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        {status === "sending" ? t.sending : t.submit}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  type = "text",
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label}{" "}
        {required ? (
          <span aria-hidden="true" className="text-[#1e4a7a]">*</span>
        ) : hint ? (
          <span className="text-xs font-normal text-slate-400">({hint})</span>
        ) : null}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#1e4a7a] focus:ring-2 focus:ring-[#1e4a7a]/20"
      />
    </label>
  );
}
