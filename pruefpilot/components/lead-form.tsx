"use client";

import { useActionState } from "react";
import { submitLead, type LeadFormState } from "@/app/actions";

const COMPANY_SIZE_OPTIONS = [
  { value: "", label: "Betriebsgröße (optional)" },
  { value: "1-4", label: "1–4 Mitarbeiter" },
  { value: "5-19", label: "5–19 Mitarbeiter" },
  { value: "20-49", label: "20–49 Mitarbeiter" },
  { value: "50+", label: "50+ Mitarbeiter" },
];

export function LeadForm() {
  const [state, formAction, pending] = useActionState<LeadFormState, FormData>(submitLead, {});

  if (state.success) {
    return (
      <div className="card flex flex-col items-center border-emerald-200 bg-emerald-50 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="mt-4 text-lg font-semibold text-emerald-900">Vielen Dank — Sie sind vorgemerkt!</p>
        <p className="mt-1 text-sm text-emerald-700">
          Wir melden uns persönlich, sobald PrüfPilot für Gründungspartner öffnet.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="card space-y-3 text-left shadow-xl shadow-blue-950/10">
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="name"
          type="text"
          maxLength={200}
          placeholder="Name (optional)"
          aria-label="Name"
          className="input"
        />
        <select name="companySize" aria-label="Betriebsgröße" defaultValue="" className="input">
          {COMPANY_SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <input
        name="email"
        type="email"
        required
        maxLength={320}
        placeholder="ihre@firmen-adresse.de"
        aria-label="E-Mail-Adresse"
        className="input"
      />
      {state.error ? <p className="field-error">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Wird gespeichert…" : "Unverbindlich vormerken"}
      </button>
      <p className="text-xs text-slate-500">
        Keine Werbung, keine Weitergabe — nur die Einladung zum Start. Details in der{" "}
        <a href="/datenschutz" className="underline hover:text-slate-700">
          Datenschutzerklärung
        </a>
        .
      </p>
    </form>
  );
}
