"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { saveFaqList, type FaqListInput } from "../_actions";

const FIELD =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e4a7a] focus:ring-1 focus:ring-[#1e4a7a]";

export function FaqEditor({ initial }: { initial: FaqListInput }) {
  const router = useRouter();
  const [rows, setRows] = useState<FaqListInput>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (i: number, patch: Partial<FaqListInput[number]>) =>
    setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  const move = (i: number, dir: -1 | 1) =>
    setRows((r) => {
      const j = i + dir;
      if (j < 0 || j >= r.length) return r;
      const copy = [...r];
      const tmp = copy[i]!;
      copy[i] = copy[j]!;
      copy[j] = tmp;
      return copy;
    });

  async function saveAll() {
    setSaving(true);
    setMsg(null);
    const res = await saveFaqList(rows.filter((r) => r.question.trim()));
    setSaving(false);
    setMsg(res.ok ? { ok: true, text: "Gespeichert – FAQ ist live." } : { ok: false, text: res.error });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-4">
      {msg && (
        <p className={`rounded-lg px-4 py-3 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </p>
      )}
      {rows.map((row, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3">
            <div className="flex gap-3">
              <label className="block flex-1">
                <span className="text-xs font-semibold text-slate-500">Gruppe</span>
                <input className={FIELD} value={row.group_name} onChange={(e) => set(i, { group_name: e.target.value })} />
              </label>
              <div className="flex items-end gap-1">
                <button onClick={() => move(i, -1)} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50" aria-label="Nach oben"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => move(i, 1)} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50" aria-label="Nach unten"><ArrowDown className="h-4 w-4" /></button>
                <button onClick={() => setRows((r) => r.filter((_, j) => j !== i))} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50" aria-label="Löschen"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">Frage *</span>
              <input className={FIELD} value={row.question} onChange={(e) => set(i, { question: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">Antwort</span>
              <textarea className={FIELD} rows={2} value={row.answer} onChange={(e) => set(i, { answer: e.target.value })} />
            </label>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setRows((r) => [...r, { group_name: r[r.length - 1]?.group_name ?? "", question: "", answer: "" }])}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" /> Frage hinzufügen
        </button>
        <button
          onClick={saveAll}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e4a7a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#163a61] disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Alles speichern
        </button>
      </div>
    </div>
  );
}
