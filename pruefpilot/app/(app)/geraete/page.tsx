import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { categoryName } from "@/lib/categories";
import { dueStatus, todayIso, type DueStatus } from "@/lib/due";
import { createClient } from "@/lib/supabase/server";
import type { DeviceRow } from "@/lib/types";

const STATUS_FILTERS = ["overdue", "due_30", "due_60", "ok", "retired"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const FILTER_LABELS: Record<StatusFilter, string> = {
  overdue: "Überfällig",
  due_30: "≤ 30 Tage",
  due_60: "≤ 60 Tage",
  ok: "OK",
  retired: "Stillgelegt",
};

const DATE_FORMAT = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeZone: "Europe/Berlin" });
const fmt = (iso: string) => DATE_FORMAT.format(new Date(`${iso}T00:00:00`));

function chip(active: boolean): string {
  return active
    ? "rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm"
    : "rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700";
}

export default async function DevicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawFilter = typeof params.status === "string" ? params.status : undefined;
  const filter = STATUS_FILTERS.includes(rawFilter as StatusFilter)
    ? (rawFilter as StatusFilter)
    : undefined;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("status", filter === "retired" ? "retired" : "active")
    .order("next_due_date", { ascending: true });

  if (error) {
    throw new Error(`Geräte konnten nicht geladen werden: ${error.message}`);
  }

  const today = todayIso();
  const devices = ((data ?? []) as DeviceRow[])
    .map((device) => ({ ...device, dueStatus: dueStatus(device.next_due_date, today) }))
    .filter((device) => {
      if (!filter || filter === "retired") return true;
      return device.dueStatus === filter;
    });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Geräte</h1>
          <p className="mt-1 text-sm text-slate-500">{devices.length} {devices.length === 1 ? "Eintrag" : "Einträge"} in dieser Ansicht.</p>
        </div>
        <Link href="/geraete/neu" className="btn-primary">+ Gerät anlegen</Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/geraete" className={chip(!filter)}>Alle aktiven</Link>
        {STATUS_FILTERS.map((status) => (
          <Link key={status} href={`/geraete?status=${status}`} className={chip(filter === status)}>
            {FILTER_LABELS[status]}
          </Link>
        ))}
      </div>

      {devices.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </span>
          <p className="mt-4 font-medium text-slate-700">Keine Geräte in dieser Ansicht.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Gerät</th>
                  <th className="px-5 py-3">Kategorie</th>
                  <th className="px-5 py-3">Standort</th>
                  <th className="px-5 py-3">Intervall</th>
                  <th className="px-5 py-3">Nächste Prüfung</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {devices.map((device) => (
                  <tr key={device.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <Link href={`/geraete/${device.id}`} className="font-medium text-blue-700 hover:underline">
                        {device.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{categoryName(device.category_id)}</td>
                    <td className="px-5 py-3.5 text-slate-600">{device.location ?? "—"}</td>
                    <td className="px-5 py-3.5 text-slate-600">{device.interval_months} Monate</td>
                    <td className="px-5 py-3.5 text-slate-600">{fmt(device.next_due_date)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={device.status === "retired" ? "retired" : device.dueStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
