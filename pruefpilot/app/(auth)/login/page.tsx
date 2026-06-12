"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login, type AuthFormState } from "../actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(login, {});

  return (
    <form action={formAction} className="card space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="email">
          E-Mail-Adresse
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
        />
      </div>
      {state.error ? <p className="field-error">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Anmelden…" : "Anmelden"}
      </button>
      <p className="text-center text-sm text-slate-600">
        Noch kein Konto?{" "}
        <Link href="/register" className="text-blue-700 underline">
          Kostenlos registrieren
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-6 text-center text-2xl font-bold">Bei PrüfPilot anmelden</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
