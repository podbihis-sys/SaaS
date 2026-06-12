import Link from "next/link";
import { notFound } from "next/navigation";
import { ResultBadge } from "@/components/result-badge";
import { StatusBadge } from "@/components/status-badge";
import { categoryById } from "@/lib/categories";
import { dueInfo, todayIso } from "@/lib/due";
import { createClient } from "@/lib/supabase/server";
import type { DeviceRow, InspectionRow } from "@/lib/types";
import { toggleDeviceStatus } from "../actions";

const DATE_FORMAT = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeZone: "Europe/Berlin" });

function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(`${iso}T00:00:00`));
}

export default async function DeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("devices").select("*").eq("id", id).maybeSingle();
  if (!data) {
    notFound();
  }
  const device = data as DeviceRow;
  const category = categoryById(device.category_id);
  const due = dueInfo(device.next_due_date, todayIso());

  const { data: inspectionRows } = await supabase
    .from("inspections")
    .select("*")
    .eq("device_id", device.id)
    .order("inspected_at", { ascending: false })
    .order("created_at", { ascending: false });
  const inspections = (inspectionRows ?? []) as InspectionRow[];
  const latest = inspections[0];

  // Signierte Download-URLs (10 Minuten gültig) nur für vorhandene Nachweise.
  const documentUrls = new Map<string, string>();
  for (const inspection of inspections) {
    if (!inspection.document_path) continue;
    const { data: signed } = await supabase.storage
      .from("inspection-docs")
      .createSignedUrl(inspection.document_path, 600);
    if (signed?.signedUrl) {
      documentUrls.set(inspection.id, signed.signedUrl);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{device.name}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {category?.nameDe ?? device.category_id}
            {category ? ` · ${category.legalBasis}` : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={device.status === "retired" ? "retired" : due.status} />
          {latest && latest.result !== "passed" ? (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              Letzte Prüfung: <ResultBadge result={latest.result} />
            </span>
          ) : null}
        </div>
      </div>

      <dl className="card mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Nächste Prüfung</dt>
          <dd className="mt-1 font-medium">
            {formatDate(device.next_due_date)}
            {device.status === "active" ? (
              <span className="ml-2 text-sm font-normal text-slate-500">
                {due.daysLeft < 0
                  ? `${Math.abs(due.daysLeft)} Tage überfällig`
                  : `in ${due.daysLeft} Tagen`}
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Prüfintervall</dt>
          <dd className="mt-1 font-medium">{device.interval_months} Monate</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Standort</dt>
          <dd className="mt-1">{device.location ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Seriennummer</dt>
          <dd className="mt-1">{device.serial_number ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Geräte-Code</dt>
          <dd className="mt-1 font-mono">{device.public_code}</dd>
        </div>
        {device.notes ? (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-slate-500">Notizen</dt>
            <dd className="mt-1 whitespace-pre-wrap">{device.notes}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/geraete/${device.id}/pruefung`} className="btn-primary">
          Prüfung erfassen
        </Link>
        <Link href={`/geraete/${device.id}/bearbeiten`} className="btn-secondary">
          Bearbeiten
        </Link>
        <Link href={`/geraete/${device.id}/etikett`} className="btn-secondary">
          QR-Etikett drucken
        </Link>
        <form action={toggleDeviceStatus}>
          <input type="hidden" name="deviceId" value={device.id} />
          <input type="hidden" name="currentStatus" value={device.status} />
          <button type="submit" className="btn-secondary">
            {device.status === "active" ? "Stilllegen" : "Wieder aktivieren"}
          </button>
        </form>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Prüfhistorie</h2>
        {inspections.length === 0 ? (
          <div className="card mt-4 text-sm text-slate-600">
            Noch keine Prüfung dokumentiert.{" "}
            <Link href={`/geraete/${device.id}/pruefung`} className="text-blue-700 underline">
              Erste Prüfung erfassen
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {inspections.map((inspection) => (
              <li key={inspection.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{formatDate(inspection.inspected_at)}</span>
                  <ResultBadge result={inspection.result} />
                </div>
                <p className="mt-1 text-sm text-slate-600">Prüfer: {inspection.inspector_name}</p>
                {inspection.comment ? (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                    {inspection.comment}
                  </p>
                ) : null}
                {documentUrls.has(inspection.id) ? (
                  <a
                    href={documentUrls.get(inspection.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm text-blue-700 underline"
                  >
                    Nachweis öffnen (PDF)
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-slate-500">
          Einträge sind unveränderlich — Korrekturen als neue Prüfung mit Bemerkung erfassen.
        </p>
      </section>
    </div>
  );
}
