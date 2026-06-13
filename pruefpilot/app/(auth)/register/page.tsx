"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, type AuthFormState } from "../actions";
import { AuthShell } from "@/components/auth-shell";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(register, {});

  return (
    <AuthShell title="Kostenlos testen" subtitle="14 Tage voller Funktionsumfang. Keine Kreditkarte erforderlich.">
      <form action={formAction} className="card space-y-4 shadow-xl shadow-blue-950/5">
        <div>
          <label className="label" htmlFor="email">E-Mail-Adresse</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Passwort (mindestens 8 Zeichen)</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="input" />
        </div>
        {state.error ? <p className="field-error">{state.error}</p> : null}
        {state.message ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.message}</p> : null}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Konto wird angelegt…" : "Konto anlegen"}
        </button>
        <p className="text-center text-xs text-slate-500">
          Mit der Registrierung bestätigen Sie die Kenntnisnahme der{" "}
          <a href="/datenschutz" className="underline hover:text-slate-700">Datenschutzerklärung</a>.
        </p>
        <p className="text-center text-sm text-slate-600">
          Bereits registriert?{" "}
          <Link href="/login" className="font-medium text-blue-700 hover:underline">Anmelden</Link>
        </p>
      </form>
    </AuthShell>
  );
}
