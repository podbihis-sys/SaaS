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

const STAT_CARDS: Array<{ status: DueStatus; label: string; num: string; chip: string; bar: string }> = [
  { status: "overdue", label: "Überfällig", num: "text-red-600", chip: "bg-red-100 text-red-600", bar: "bg-red-500" },
  { status: "due_30", label: "Fällig ≤ 30 Tage", num: "text-amber-600", chip: "bg-amber-100 text-amber-600", bar: "bg-amber-500" },
  { status: "due_60", label: "Fällig ≤ 60 Tage", num: "text-yellow-700", chip: "bg-yellow-100 text-yellow-700", bar: "bg-yellow-400" },
  { status: "ok", label: "Im Plan", num: "text-emerald-600", chip: "bg-emerald-100 text-emerald-600", bar: "bg-emerald-500" },
];

const STAT_ICONS: Record<DueStatus, React.ReactNode> = {
  overdue: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />,
  due_30: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
  due_60: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />,
  ok: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
};

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
  const withDue = devices.map((device) => ({ ...device, due: dueInfo(device.next_due_date, today) }));
  const counts = withDue.reduce<Record<DueStatus, number>>(
    (acc, device) => {
      acc[device.due.status] += 1;
      return acc;
    },
    { overdue: 0, due_30: 0, due_60: 0, ok: 0 },
  );
  const total = devices.length || 1;

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

      {/* Stat-Karten */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <Link
            key={card.status}
            href={`/geraete?status=${card.status}`}
            className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className={`mt-2 text-3xl font-extrabold tracking-tight ${card.num}`}>{counts[card.status]}</p>
              </div>
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.chip}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                  {STAT_ICONS[card.status]}
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Nächste Fälligkeiten */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Nächste Fälligkeiten</h2>
              <Link href="/geraete" className="text-sm font-medium text-blue-700 hover:underline">Alle anzeigen</Link>
            </div>
            {withDue.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
                  </svg>
                </span>
                <p className="mt-4 font-medium text-slate-700">Noch keine Geräte erfasst.</p>
                <Link href="/geraete/neu" className="btn-primary mt-5">Erstes Gerät anlegen</Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {withDue.slice(0, 8).map((device) => (
                  <li key={device.id}>
                    <Link href={`/geraete/${device.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50">
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
            )}
          </div>
        </div>

        {/* Statusverteilung */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Statusverteilung</h2>
          <p className="mt-1 text-sm text-slate-500">{devices.length} aktive Geräte</p>
          <div className="mt-5 space-y-4">
            {STAT_CARDS.map((card) => {
              const pct = Math.round((counts[card.status] / total) * 100);
              return (
                <div key={card.status}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{card.label}</span>
                    <span className="font-semibold text-slate-900">{counts[card.status]}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${card.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
