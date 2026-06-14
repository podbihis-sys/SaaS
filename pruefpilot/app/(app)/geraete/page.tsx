import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { categoryName } from "@/lib/categories";
import { dueInfo, todayIso, type DueStatus } from "@/lib/due";
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
    ? "rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm"
    : "rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700";
}

function dueText(status: DueStatus, daysLeft: number): string {
  if (status === "overdue") return `${Math.abs(daysLeft)} Tage überfällig`;
  if (daysLeft === 0) return "heute fällig";
  return `in ${daysLeft} Tagen`;
}

export default async function DevicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawFilter = typeof params.status === "string" ? params.status : undefined;
  const filter = STATUS_FILTERS.includes(rawFilter as StatusFilter) ? (rawFilter as StatusFilter) : undefined;

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
    .map((device) => ({ ...device, info: dueInfo(device.next_due_date, today) }))
    .filter((device) => {
      if (!filter || filter === "retired") return true;
      return device.info.status === filter;
    });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Geräte</h1>
          <p className="mt-1 text-sm text-slate-500">{devices.length} {devices.length === 1 ? "Eintrag" : "Einträge"} in dieser Ansicht.</p>
        </div>
        <Link href="/geraete/neu" className="btn-primary !px-4 !py-2">+ Gerät anlegen</Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/geraete" className={chip(!filter)}>Alle aktiven</Link>
        {STATUS_FILTERS.map((status) => (
          <Link key={status} href={`/geraete?status=${status}`} className={chip(filter === status)}>{FILTER_LABELS[status]}</Link>
        ))}
      </div>

      {devices.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </span>
          <p className="mt-4 font-medium text-slate-700">Keine Geräte in dieser Ansicht.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <Link
              key={device.id}
              href={`/geraete/${device.id}`}
              className="group flex flex-col rounded-3xl bg-white p-5 ring-1 ring-slate-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:ring-blue-200 hover:shadow-[0_14px_40px_-18px_rgba(2,6,23,0.25)]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>
                </span>
                <StatusBadge status={device.status === "retired" ? "retired" : device.info.status} />
              </div>
              <h3 className="mt-4 truncate font-semibold text-slate-900 group-hover:text-blue-700">{device.name}</h3>
              <p className="mt-0.5 truncate text-sm text-slate-500">{categoryName(device.category_id)}</p>
              <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
                <div>
                  <p className="text-xs text-slate-400">Nächste Prüfung</p>
                  <p className="text-sm font-medium text-slate-700">{fmt(device.next_due_date)}</p>
                </div>
                {device.status !== "retired" ? (
                  <p className="text-xs font-medium text-slate-500">{dueText(device.info.status, device.info.daysLeft)}</p>
                ) : (
                  <p className="text-xs font-medium text-slate-400">stillgelegt</p>
                )}
              </div>
              {device.location ? (
                <p className="mt-3 inline-flex items-center gap-1 text-xs text-slate-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-5.2-7-11a7 7 0 1 1 14 0c0 5.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
                  {device.location}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
