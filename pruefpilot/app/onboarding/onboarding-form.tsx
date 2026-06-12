"use client";

import { useActionState } from "react";
import { createCompany, type OnboardingFormState } from "./actions";

export function OnboardingForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, formAction, pending] = useActionState<OnboardingFormState, FormData>(
    createCompany,
    {},
  );

  return (
    <form action={formAction} className="card space-y-4">
      <div>
        <label className="label" htmlFor="name">
          Betriebsname
        </label>
        <input id="name" name="name" required maxLength={200} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="contactEmail">
          Kontakt-E-Mail für Erinnerungen
        </label>
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          required
          defaultValue={defaultEmail}
          className="input"
        />
        <p className="mt-1 text-xs text-slate-500">
          An diese Adresse gehen Fälligkeits-Erinnerungen und Eskalationen.
        </p>
      </div>
      {state.error ? <p className="field-error">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Wird angelegt…" : "Betrieb anlegen"}
      </button>
    </form>
  );
}
