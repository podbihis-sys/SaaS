"use client";

import { useRef, useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Senden fehlgeschlagen.");
      setStatus("success");
      setMessage(
        "Vielen Dank für Ihre Nachricht! Wir melden uns so schnell wie möglich bei Ihnen.",
      );
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error
          ? err.message
          : "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut oder schreiben Sie uns direkt eine E-Mail.",
      );
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-5"
      noValidate
    >
      {/* Honeypot – für Menschen unsichtbar, von Bots oft ausgefüllt. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="company">Firma (bitte freilassen)</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-anthracite-800">
            Name <span className="text-moss-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded-xl border border-anthracite-200 bg-white px-4 py-3 text-anthracite-900 outline-none focus:border-moss-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-anthracite-800">
            E-Mail <span className="text-moss-600">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-anthracite-200 bg-white px-4 py-3 text-anthracite-900 outline-none focus:border-moss-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-anthracite-800">
          Telefon (optional)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="w-full rounded-xl border border-anthracite-200 bg-white px-4 py-3 text-anthracite-900 outline-none focus:border-moss-500"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-anthracite-800">
          Ihre Nachricht <span className="text-moss-600">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="w-full rounded-xl border border-anthracite-200 bg-white px-4 py-3 text-anthracite-900 outline-none focus:border-moss-500"
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          id="privacy"
          name="privacy"
          type="checkbox"
          required
          className="mt-1 h-5 w-5 rounded border-anthracite-300 text-moss-600 focus:ring-moss-500"
        />
        <label htmlFor="privacy" className="text-sm text-anthracite-600">
          Ich habe die{" "}
          <a href="/datenschutz" className="font-medium text-moss-700 underline">
            Datenschutzerklärung
          </a>{" "}
          gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung
          meiner Anfrage zu. <span className="text-moss-600">*</span>
        </label>
      </div>

      {/* Cloudflare Turnstile (nur aktiv, wenn Site-Key gesetzt ist). */}
      {turnstileSiteKey && (
        <div
          className="cf-turnstile"
          data-sitekey={turnstileSiteKey}
          data-theme="light"
        />
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-primary w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Wird gesendet …" : "Nachricht senden"}
      </button>

      {message && (
        <p
          role="status"
          aria-live="polite"
          className={`rounded-xl px-4 py-3 text-sm ${
            status === "success"
              ? "bg-moss-50 text-moss-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
