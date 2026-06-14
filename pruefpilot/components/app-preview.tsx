import type { ReactNode } from "react";

function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-blue-950/30 ring-1 ring-black/5">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-[11px] text-slate-400">{url}</span>
      </div>
      <div className="relative">
        {children}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine" />
        </div>
      </div>
    </div>
  );
}

const TILES = [
  { n: "2", label: "Überfällig", num: "text-red-600", chip: "bg-red-100 text-red-600" },
  { n: "5", label: "≤ 30 Tage", num: "text-amber-600", chip: "bg-amber-100 text-amber-600" },
  { n: "8", label: "≤ 60 Tage", num: "text-yellow-700", chip: "bg-yellow-100 text-yellow-700" },
  { n: "24", label: "Im Plan", num: "text-emerald-600", chip: "bg-emerald-100 text-emerald-600" },
];

const ROWS = [
  { name: "Bohrmaschine Halle 2", cat: "DGUV V3", badge: "Überfällig", tone: "bg-red-100 text-red-700" },
  { name: "Anlegeleiter 3 m", cat: "Leitern & Tritte", badge: "≤ 30 Tage", tone: "bg-amber-100 text-amber-700" },
  { name: "Feuerlöscher Flur EG", cat: "Feuerlöscher", badge: "OK", tone: "bg-emerald-100 text-emerald-700" },
  { name: "Gabelstapler Lager", cat: "UVV Flurförderzeug", badge: "≤ 60 Tage", tone: "bg-yellow-100 text-yellow-800" },
];

export function DashboardPreview() {
  return (
    <BrowserFrame url="pruefpilot.app/dashboard">
      <div className="space-y-4 bg-slate-50 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 text-[11px] font-bold text-white">P</span>
            <span className="text-sm font-semibold text-slate-800">Dashboard</span>
          </div>
          <span className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">+ Gerät anlegen</span>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {TILES.map((t) => (
            <div key={t.label} className="rounded-xl border border-slate-200 bg-white p-2.5">
              <div className="flex items-center justify-between">
                <span className={`flex h-5 w-5 items-center justify-center rounded-md ${t.chip}`}>
                  <span className="h-2 w-2 rounded-sm bg-current" />
                </span>
                <span className={`text-lg font-extrabold ${t.num}`}>{t.n}</span>
              </div>
              <p className="mt-1 text-[10px] font-medium text-slate-500">{t.label}</p>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {ROWS.map((r, i) => (
            <div key={r.name} className={`flex items-center justify-between px-3 py-2.5 ${i > 0 ? "border-t border-slate-100" : ""}`}>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-800">{r.name}</p>
                <p className="truncate text-[10px] text-slate-400">{r.cat}</p>
              </div>
              <span className={`flex-none rounded-full px-2 py-0.5 text-[10px] font-medium ${r.tone}`}>{r.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

function QrCode() {
  // Dekoratives QR-Muster (kein echter Code) — drei Finder-Quadrate + Module.
  const modules = [
    [4, 0], [5, 1], [3, 2], [6, 2], [4, 3], [0, 4], [2, 4], [4, 4], [6, 4],
    [1, 5], [5, 5], [3, 6], [6, 6], [4, 5], [2, 3], [5, 3],
  ];
  return (
    <svg viewBox="0 0 70 70" className="h-24 w-24" aria-hidden="true">
      <rect width="70" height="70" rx="6" fill="white" />
      {[[6, 6], [44, 6], [6, 44]].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="20" height="20" rx="3" fill="none" stroke="#1e3a8a" strokeWidth="3" />
          <rect x={x + 6} y={y + 6} width="8" height="8" rx="1.5" fill="#1e3a8a" />
        </g>
      ))}
      {modules.map(([gx, gy]) => (
        <rect key={`${gx}-${gy}`} x={32 + gx * 4.4} y={32 + gy * 4.4} width="3.4" height="3.4" rx="0.6" fill="#1e3a8a" />
      ))}
    </svg>
  );
}

export function QrLabelPreview() {
  return (
    <BrowserFrame url="pruefpilot.app/geraete/…/etikett">
      <div className="bg-slate-50 p-5">
        <div className="mx-auto max-w-[15rem] rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <div className="flex justify-center">
            <QrCode />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-800">Bohrmaschine Halle 2</p>
          <p className="text-[11px] text-slate-500">DGUV V3 · ortsveränderlich</p>
          <p className="mt-1 font-mono text-[11px] tracking-widest text-slate-400">A7K2-M9PQ</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> geprüft
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
              Nachweis · PDF
            </span>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
