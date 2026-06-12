"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, type AuthFormState } from "../actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(register, {});

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-2 text-center text-2xl font-bold">Kostenlos testen</h1>
      <p className="mb-6 text-center text-sm text-slate-600">
        14 Tage voller Funktionsumfang. Keine Kreditkarte erforderlich.
      </p>
      <form action={formAction} className="card space-y-4">
        <div>
          <label className="label" htmlFor="email">
            E-Mail-Adresse
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Passwort (mindestens 8 Zeichen)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className="input"
          />
        </div>
        {state.error ? <p className="field-error">{state.error}</p> : null}
        {state.message ? <p className="text-sm text-green-700">{state.message}</p> : null}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Konto wird angelegt…" : "Konto anlegen"}
        </button>
        <p className="text-center text-sm text-slate-600">
          Bereits registriert?{" "}
          <Link href="/login" className="text-blue-700 underline">
            Anmelden
          </Link>
        </p>
      </form>
    </main>
  );
}
