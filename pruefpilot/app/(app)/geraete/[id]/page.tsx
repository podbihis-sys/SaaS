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
const formatDate = (iso: string) => DATE_FORMAT.format(new Date(`${iso}T00:00:00`));

const DOT_COLOR: Record<string, string> = {
  passed: "#10b981",
  passed_with_defects: "#f59e0b",
  failed: "#ef4444",
};

function InfoTile({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 font-medium text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

export default async function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="mx-auto max-w-3xl">
      <Link href="/geraete" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-blue-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
        Alle Geräte
      </Link>

      <div className="relative mt-3 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-600/25 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl animate-blob" aria-hidden="true" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight">{device.name}</h1>
              <p className="mt-1 text-sm text-blue-100/90">
                {category?.nameDe ?? device.category_id}
                {category ? ` · ${category.legalBasis}` : ""}
              </p>
            </div>
          </div>
          <StatusBadge status={device.status === "retired" ? "retired" : due.status} />
        </div>
        <div className="relative mt-5 flex flex-wrap gap-2">
          <span className="rounded-full glass-dark px-3 py-1.5 text-sm font-medium text-white">
            Nächste Prüfung: {formatDate(device.next_due_date)}
          </span>
          {device.status === "active" ? (
            <span className="rounded-full glass-dark px-3 py-1.5 text-sm font-medium text-white">
              {due.daysLeft < 0 ? `${Math.abs(due.daysLeft)} Tage überfällig` : due.daysLeft === 0 ? "heute fällig" : `in ${due.daysLeft} Tagen`}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/geraete/${device.id}/pruefung`} className="btn-primary !px-4 !py-2">Prüfung erfassen</Link>
        <Link href={`/geraete/${device.id}/bearbeiten`} className="btn-secondary !px-4 !py-2">Bearbeiten</Link>
        <Link href={`/geraete/${device.id}/etikett`} className="btn-secondary !px-4 !py-2">QR-Etikett</Link>
        <form action={toggleDeviceStatus}>
          <input type="hidden" name="deviceId" value={device.id} />
          <input type="hidden" name="currentStatus" value={device.status} />
          <button type="submit" className="btn-secondary !px-4 !py-2">
            {device.status === "active" ? "Stilllegen" : "Wieder aktivieren"}
          </button>
        </form>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <InfoTile label="Prüfintervall" value={`${device.interval_months} Monate`} />
        <InfoTile label="Standort" value={device.location ?? "—"} />
        <InfoTile label="Seriennummer" value={device.serial_number ?? "—"} />
        <InfoTile label="Geräte-Code" value={device.public_code} mono />
        {device.notes ? (
          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">Notizen</p>
            <p className="mt-1 whitespace-pre-wrap text-slate-700">{device.notes}</p>
          </div>
        ) : null}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Prüfhistorie</h2>
        {inspections.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-white p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200/70">
            Noch keine Prüfung dokumentiert.{" "}
            <Link href={`/geraete/${device.id}/pruefung`} className="font-medium text-blue-700 hover:underline">Erste Prüfung erfassen</Link>
          </div>
        ) : (
          <ol className="relative mt-5 space-y-4 border-l-2 border-slate-200 pl-6">
            {inspections.map((inspection) => (
              <li key={inspection.id} className="relative">
                <span
                  className="absolute -left-[1.92rem] top-3 h-3.5 w-3.5 rounded-full ring-4 ring-slate-50"
                  style={{ backgroundColor: DOT_COLOR[inspection.result] ?? "#94a3b8" }}
                  aria-hidden="true"
                />
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-900">{formatDate(inspection.inspected_at)}</span>
                    <ResultBadge result={inspection.result} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Prüfer: {inspection.inspector_name}</p>
                  {inspection.comment ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{inspection.comment}</p>
                  ) : null}
                  {documentUrls.has(inspection.id) ? (
                    <a href={documentUrls.get(inspection.id)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m1 8H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l5 5v7a2 2 0 0 1-2 2z" /></svg>
                      Nachweis öffnen (PDF)
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-3 text-xs text-slate-500">Einträge sind unveränderlich — Korrekturen als neue Prüfung mit Bemerkung erfassen.</p>
      </section>
    </div>
  );
}
