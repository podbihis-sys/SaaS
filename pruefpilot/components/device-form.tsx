"use client";

import { useActionState, useState } from "react";
import { DEVICE_CATEGORIES, categoryById } from "@/lib/categories";
import type { DeviceFormState } from "@/app/(app)/geraete/actions";

interface DeviceFormProps {
  action: (previous: DeviceFormState, formData: FormData) => Promise<DeviceFormState>;
  submitLabel: string;
  deviceId?: string;
  defaults?: {
    name?: string;
    categoryId?: string;
    location?: string;
    serialNumber?: string;
    intervalMonths?: number;
    nextDueDate?: string;
    notes?: string;
  };
}

function FieldErrors({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="field-error">{errors[0]}</p>;
}

export function DeviceForm({ action, submitLabel, deviceId, defaults }: DeviceFormProps) {
  const [state, formAction, pending] = useActionState<DeviceFormState, FormData>(action, {});
  const [intervalMonths, setIntervalMonths] = useState<string>(
    String(defaults?.intervalMonths ?? categoryById(defaults?.categoryId ?? "")?.defaultIntervalMonths ?? 12),
  );

  return (
    <form action={formAction} className="card max-w-xl space-y-4">
      {deviceId ? <input type="hidden" name="deviceId" value={deviceId} /> : null}

      <div>
        <label className="label" htmlFor="name">
          Gerätebezeichnung
        </label>
        <input id="name" name="name" required maxLength={200} defaultValue={defaults?.name} className="input" />
        <FieldErrors errors={state.fieldErrors?.name} />
      </div>

      <div>
        <label className="label" htmlFor="categoryId">
          Prüfart / Kategorie
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={defaults?.categoryId ?? ""}
          className="input"
          onChange={(event) => {
            const category = categoryById(event.target.value);
            if (category) {
              setIntervalMonths(String(category.defaultIntervalMonths));
            }
          }}
        >
          <option value="" disabled>
            Bitte wählen…
          </option>
          {DEVICE_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nameDe} — {category.legalBasis}
            </option>
          ))}
        </select>
        <FieldErrors errors={state.fieldErrors?.categoryId} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="location">
            Standort (optional)
          </label>
          <input id="location" name="location" maxLength={200} defaultValue={defaults?.location} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="serialNumber">
            Seriennummer (optional)
          </label>
          <input
            id="serialNumber"
            name="serialNumber"
            maxLength={200}
            defaultValue={defaults?.serialNumber}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="intervalMonths">
          Prüfintervall (Monate)
        </label>
        <input
          id="intervalMonths"
          name="intervalMonths"
          type="number"
          min={1}
          max={120}
          required
          value={intervalMonths}
          onChange={(event) => setIntervalMonths(event.target.value)}
          className="input"
        />
        <p className="mt-1 text-xs text-slate-500">
          Empfehlung laut Kategorie — bitte für Ihren Betrieb prüfen (z. B. DGUV V3 risikoabhängig 6–24 Monate).
        </p>
        <FieldErrors errors={state.fieldErrors?.intervalMonths} />
      </div>

      <fieldset className="rounded-md border border-slate-200 p-4">
        <legend className="px-1 text-sm font-medium text-slate-700">Fälligkeit bestimmen</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="lastInspectedAt">
              Zuletzt geprüft am
            </label>
            <input id="lastInspectedAt" name="lastInspectedAt" type="date" className="input" />
            <p className="mt-1 text-xs text-slate-500">Nächste Fälligkeit = Datum + Intervall</p>
          </div>
          <div>
            <label className="label" htmlFor="nextDueDate">
              … oder nächste Fälligkeit direkt
            </label>
            <input
              id="nextDueDate"
              name="nextDueDate"
              type="date"
              defaultValue={defaults?.nextDueDate}
              className="input"
            />
          </div>
        </div>
        <FieldErrors errors={state.fieldErrors?.lastInspectedAt} />
        <FieldErrors errors={state.fieldErrors?.nextDueDate} />
      </fieldset>

      <div>
        <label className="label" htmlFor="notes">
          Notizen (optional)
        </label>
        <textarea id="notes" name="notes" rows={3} maxLength={2000} defaultValue={defaults?.notes} className="input" />
      </div>

      {state.error ? <p className="field-error">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Speichern…" : submitLabel}
      </button>
    </form>
  );
}
