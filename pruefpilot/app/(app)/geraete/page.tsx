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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Geräte</h1>
        <Link href="/geraete/neu" className="btn-primary">
          + Gerät anlegen
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/geraete"
          className={`rounded-full border px-3 py-1 ${!filter ? "border-blue-700 text-blue-700" : "border-slate-300 text-slate-600"}`}
        >
          Alle aktiven
        </Link>
        {STATUS_FILTERS.map((status) => (
          <Link
            key={status}
            href={`/geraete?status=${status}`}
            className={`rounded-full border px-3 py-1 ${filter === status ? "border-blue-700 text-blue-700" : "border-slate-300 text-slate-600"}`}
          >
            {FILTER_LABELS[status]}
          </Link>
        ))}
      </div>

      {devices.length === 0 ? (
        <div className="card mt-6 text-center text-slate-600">Keine Geräte in dieser Ansicht.</div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Gerät</th>
                <th className="px-4 py-3">Kategorie</th>
                <th className="px-4 py-3">Standort</th>
                <th className="px-4 py-3">Intervall</th>
                <th className="px-4 py-3">Nächste Prüfung</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.map((device) => (
                <tr key={device.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/geraete/${device.id}`} className="font-medium text-blue-700 hover:underline">
                      {device.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{categoryName(device.category_id)}</td>
                  <td className="px-4 py-3">{device.location ?? "—"}</td>
                  <td className="px-4 py-3">{device.interval_months} Monate</td>
                  <td className="px-4 py-3">{device.next_due_date}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={device.status === "retired" ? "retired" : device.dueStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
