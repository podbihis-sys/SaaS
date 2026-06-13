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

const TILES: Array<{
  status: DueStatus;
  label: string;
  ring: string;
  chip: string;
  value: string;
  icon: React.ReactNode;
}> = [
  {
    status: "overdue",
    label: "Überfällig",
    ring: "hover:border-red-300 hover:shadow-red-200/50",
    chip: "bg-red-100 text-red-600",
    value: "text-red-600",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />,
  },
  {
    status: "due_30",
    label: "Fällig ≤ 30 Tage",
    ring: "hover:border-amber-300 hover:shadow-amber-200/50",
    chip: "bg-amber-100 text-amber-600",
    value: "text-amber-600",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
  },
  {
    status: "due_60",
    label: "Fällig ≤ 60 Tage",
    ring: "hover:border-yellow-300 hover:shadow-yellow-200/50",
    chip: "bg-yellow-100 text-yellow-700",
    value: "text-yellow-700",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />,
  },
  {
    status: "ok",
    label: "Im Plan",
    ring: "hover:border-emerald-300 hover:shadow-emerald-200/50",
    chip: "bg-emerald-100 text-emerald-600",
    value: "text-emerald-600",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
  },
];

const DATE_FORMAT = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeZone: "Europe/Berlin" });
const fmt = (iso: string) => DATE_FORMAT.format(new Date(`${iso}T00:00:00`));

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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Ihr Prüfstatus auf einen Blick.</p>
        </div>
        <div className="flex gap-3">
          <a href="/api/reports/audit" className="btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" />
            </svg>
            Prüfbericht
          </a>
          <Link href="/geraete/neu" className="btn-primary">+ Gerät anlegen</Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map((tile) => (
          <Link
            key={tile.status}
            href={`/geraete?status=${tile.status}`}
            className={`group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${tile.ring}`}
          >
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tile.chip}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  {tile.icon}
                </svg>
              </span>
              <span className={`text-3xl font-extrabold tracking-tight ${tile.value}`}>{counts[tile.status]}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">{tile.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Nächste Fälligkeiten</h2>
      {withDue.length === 0 ? (
        <div className="card mt-4 flex flex-col items-center py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
            </svg>
          </span>
          <p className="mt-4 font-medium text-slate-700">Noch keine Geräte erfasst.</p>
          <p className="mt-1 text-sm text-slate-500">Legen Sie Ihr erstes Prüfobjekt an — das gesetzliche Intervall ist vorbelegt.</p>
          <Link href="/geraete/neu" className="btn-primary mt-5">Erstes Gerät anlegen</Link>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {withDue.slice(0, 10).map((device) => (
              <li key={device.id}>
                <Link
                  href={`/geraete/${device.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-slate-900">{device.name}</span>
                    <span className="block truncate text-sm text-slate-500">{categoryName(device.category_id)}</span>
                  </span>
                  <span className="flex flex-none items-center gap-3 text-sm text-slate-600">
                    <span className="hidden sm:inline">{fmt(device.next_due_date)}</span>
                    <StatusBadge status={device.due.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
