"use client";

import { useActionState } from "react";
import { BUNDESLAENDER } from "@/lib/holidays";
import { updateCompany, type SettingsFormState } from "./actions";

interface SettingsFormProps {
  defaults: {
    name: string;
    contactEmail: string;
    bundesland: string | null;
  };
}

export function SettingsForm({ defaults }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(
    updateCompany,
    {},
  );

  return (
    <form action={formAction} className="card space-y-4">
      <div>
        <label className="label" htmlFor="name">
          Betriebsname
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={200}
          defaultValue={defaults.name}
          className="input"
        />
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
          defaultValue={defaults.contactEmail}
          className="input"
        />
        <p className="mt-1 text-xs text-slate-500">
          An diese Adresse gehen Fälligkeits-Erinnerungen und Eskalationen.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="bundesland">
          Bundesland
        </label>
        <select
          id="bundesland"
          name="bundesland"
          defaultValue={defaults.bundesland ?? ""}
          className="input"
        >
          <option value="">Ohne Angabe (nur bundesweite Feiertage)</option>
          {BUNDESLAENDER.map((land) => (
            <option key={land.code} value={land.code}>
              {land.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">
          Steuert die Feiertage für die Arbeitstag-Verschiebung der letzten Erinnerung.
          Fällt eine Fälligkeit auf Wochenende oder Feiertag, geht die letzte Info am
          letzten Arbeitstag davor raus.
        </p>
      </div>

      {state.error ? <p className="field-error">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm font-medium text-emerald-600">Gespeichert.</p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Speichern…" : "Änderungen speichern"}
      </button>
    </form>
  );
}
