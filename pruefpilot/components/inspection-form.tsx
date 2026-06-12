"use client";

import { useActionState } from "react";
import { recordInspection, type DeviceFormState } from "@/app/(app)/geraete/actions";
import { INSPECTION_RESULT_LABELS, INSPECTION_RESULT_VALUES } from "@/lib/inspections";

interface InspectionFormProps {
  deviceId: string;
  defaultDate: string;
}

function FieldErrors({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="field-error">{errors[0]}</p>;
}

export function InspectionForm({ deviceId, defaultDate }: InspectionFormProps) {
  const [state, formAction, pending] = useActionState<DeviceFormState, FormData>(
    recordInspection,
    {},
  );

  return (
    <form action={formAction} className="card max-w-xl space-y-4">
      <input type="hidden" name="deviceId" value={deviceId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="inspectedAt">
            Prüfdatum
          </label>
          <input
            id="inspectedAt"
            name="inspectedAt"
            type="date"
            required
            defaultValue={defaultDate}
            max={defaultDate}
            className="input"
          />
          <FieldErrors errors={state.fieldErrors?.inspectedAt} />
        </div>
        <div>
          <label className="label" htmlFor="inspectorName">
            Prüfer (Name oder Firma)
          </label>
          <input id="inspectorName" name="inspectorName" required maxLength={200} className="input" />
          <FieldErrors errors={state.fieldErrors?.inspectorName} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="result">
          Ergebnis
        </label>
        <select id="result" name="result" required defaultValue="passed" className="input">
          {INSPECTION_RESULT_VALUES.map((value) => (
            <option key={value} value={value}>
              {INSPECTION_RESULT_LABELS[value]}
            </option>
          ))}
        </select>
        <FieldErrors errors={state.fieldErrors?.result} />
      </div>

      <div>
        <label className="label" htmlFor="comment">
          Bemerkung (optional)
        </label>
        <textarea id="comment" name="comment" rows={3} maxLength={2000} className="input" />
        <FieldErrors errors={state.fieldErrors?.comment} />
      </div>

      <div>
        <label className="label" htmlFor="document">
          Prüfprotokoll als PDF (optional, max. 8 MB)
        </label>
        <input id="document" name="document" type="file" accept="application/pdf" className="input" />
        <FieldErrors errors={state.fieldErrors?.document} />
      </div>

      {state.error ? <p className="field-error">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Speichern…" : "Prüfung speichern"}
      </button>
      <p className="text-xs text-slate-500">
        Bei bestandener Prüfung wird die nächste Fälligkeit automatisch auf Prüfdatum + Intervall
        gesetzt. Einträge sind nachträglich nicht änderbar (lückenlose Dokumentation).
      </p>
    </form>
  );
}
