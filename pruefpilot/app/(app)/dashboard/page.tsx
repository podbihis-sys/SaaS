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

const STATS: Array<{ status: DueStatus; label: string; num: string; chip: string; ring: string; color: string }> = [
  { status: "overdue", label: "Überfällig", num: "text-red-600", chip: "bg-red-100 text-red-600", ring: "hover:ring-red-200", color: "#ef4444" },
  { status: "due_30", label: "Fällig ≤ 30 Tage", num: "text-amber-600", chip: "bg-amber-100 text-amber-600", ring: "hover:ring-amber-200", color: "#f59e0b" },
  { status: "due_60", label: "Fällig ≤ 60 Tage", num: "text-yellow-700", chip: "bg-yellow-100 text-yellow-700", ring: "hover:ring-yellow-200", color: "#eab308" },
  { status: "ok", label: "Im Plan", num: "text-emerald-600", chip: "bg-emerald-100 text-emerald-600", ring: "hover:ring-emerald-200", color: "#10b981" },
];

const STAT_ICONS: Record<DueStatus, React.ReactNode> = {
  overdue: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />,
  due_30: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
  due_60: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />,
  ok: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
};

const DATE_FORMAT = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeZone: "Europe/Berlin" });
const fmt = (iso: string) => DATE_FORMAT.format(new Date(`${iso}T00:00:00`));

function Donut({ counts, total }: { counts: Record<DueStatus, number>; total: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const segments = total > 0
    ? STATS.map((s) => {
        const len = (counts[s.status] / total) * c;
        const seg = { color: s.color, len, off: offset };
        offset += len;
        return seg;
      }).filter((s) => s.len > 0)
    : [];
  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 128 128" className="h-40 w-40 -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgb(241 245 249)" strokeWidth="14" />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${Math.max(s.len - 3, 0)} ${c}`}
            strokeDashoffset={-s.off}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900">{total}</span>
        <span className="text-xs text-slate-500">Geräte</span>
      </div>
    </div>
  );
}

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

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Ihr Prüfstatus auf einen Blick.</p>
        </div>
        <div className="flex gap-3">
          <a href="/api/reports/audit" className="btn-secondary !px-4 !py-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" /></svg>
            Prüfbericht
          </a>
          <Link href="/geraete/neu" className="btn-primary !px-4 !py-2">+ Gerät</Link>
        </div>
      </div>

      {/* Stat-Tiles */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <Link
            key={s.status}
            href={`/geraete?status=${s.status}`}
            className={`group rounded-3xl bg-white p-5 ring-1 ring-slate-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-18px_rgba(2,6,23,0.25)] ${s.ring}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <p className={`mt-2 text-3xl font-extrabold tracking-tight ${s.num}`}>{counts[s.status]}</p>
              </div>
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${s.chip}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">{STAT_ICONS[s.status]}</svg>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Nächste Fälligkeiten */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="font-semibold text-slate-900">Nächste Fälligkeiten</h2>
              <Link href="/geraete" className="text-sm font-medium text-blue-700 hover:underline">Alle anzeigen</Link>
            </div>
            {withDue.length === 0 ? (
              <div className="flex flex-col items-center px-6 pb-12 pt-4 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" /></svg>
                </span>
                <p className="mt-4 font-medium text-slate-700">Noch keine Geräte erfasst.</p>
                <Link href="/geraete/neu" className="btn-primary mt-5">Erstes Gerät anlegen</Link>
              </div>
            ) : (
              <ul className="px-3 pb-3">
                {withDue.slice(0, 8).map((device) => (
                  <li key={device.id}>
                    <Link href={`/geraete/${device.id}`} className="flex items-center justify-between gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-slate-50">
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-slate-900">{device.name}</span>
                          <span className="block truncate text-sm text-slate-500">{categoryName(device.category_id)}</span>
                        </span>
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

        {/* Donut */}
        <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200/70">
          <h2 className="font-semibold text-slate-900">Statusverteilung</h2>
          <div className="mt-4"><Donut counts={counts} total={devices.length} /></div>
          <ul className="mt-5 space-y-2">
            {STATS.map((s) => (
              <li key={s.status} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}
                </span>
                <span className="font-semibold text-slate-900">{counts[s.status]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
