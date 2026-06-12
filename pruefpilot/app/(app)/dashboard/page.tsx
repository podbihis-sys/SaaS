import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { categoryName } from "@/lib/categories";
import { dueInfo, todayIso, type DueStatus } from "@/lib/due";
import { createClient } from "@/lib/supabase/server";

interface DeviceListEntry {
  id: string;
  name: string;
  category_id: string;
  next_due_date: string;
}

const TILES: Array<{ status: DueStatus; label: string }> = [
  { status: "overdue", label: "Überfällig" },
  { status: "due_30", label: "Fällig ≤ 30 Tage" },
  { status: "due_60", label: "Fällig ≤ 60 Tage" },
  { status: "ok", label: "OK" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("devices")
    .select("id, name, category_id, next_due_date")
    .eq("status", "active")
    .order("next_due_date", { ascending: true });

  if (error) {
    throw new Error(`Geräte konnten nicht geladen werden: ${error.message}`);
  }

  const devices = (data ?? []) as DeviceListEntry[];
  const today = todayIso();
  const withDue = devices.map((device) => ({
    ...device,
    due: dueInfo(device.next_due_date, today),
  }));
  const counts = withDue.reduce<Record<DueStatus, number>>(
    (acc, device) => {
      acc[device.due.status] += 1;
      return acc;
    },
    { overdue: 0, due_30: 0, due_60: 0, ok: 0 },
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          <a href="/api/reports/audit" className="btn-secondary">
            Prüfbericht (PDF)
          </a>
          <Link href="/geraete/neu" className="btn-primary">
            + Gerät anlegen
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {TILES.map((tile) => (
          <Link
            key={tile.status}
            href={`/geraete?status=${tile.status}`}
            className="card hover:border-blue-300"
          >
            <p className="text-3xl font-bold">{counts[tile.status]}</p>
            <p className="mt-1 text-sm text-slate-600">{tile.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Nächste Fälligkeiten</h2>
      {withDue.length === 0 ? (
        <div className="card mt-4 text-center">
          <p className="text-slate-600">Noch keine Geräte erfasst.</p>
          <Link href="/geraete/neu" className="btn-primary mt-4">
            Erstes Gerät anlegen
          </Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {withDue.slice(0, 10).map((device) => (
            <li key={device.id}>
              <Link
                href={`/geraete/${device.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
              >
                <span>
                  <span className="font-medium">{device.name}</span>{" "}
                  <span className="text-sm text-slate-500">
                    · {categoryName(device.category_id)}
                  </span>
                </span>
                <span className="flex items-center gap-3 text-sm text-slate-600">
                  {device.next_due_date}
                  <StatusBadge status={device.due.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
