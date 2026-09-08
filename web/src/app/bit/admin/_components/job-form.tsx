"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { deleteJob, saveJob, type JobInput } from "../_actions";

const FIELD =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e4a7a] focus:ring-1 focus:ring-[#1e4a7a]";

export function JobForm({ initial }: { initial?: JobInput }) {
  const router = useRouter();
  const [f, setF] = useState<JobInput>(
    initial ?? {
      slug: "",
      title: "",
      intro: "",
      body: "",
      tasks_title: "Ihre Aufgaben:",
      tasks: [],
      closing: "",
      sort_order: 0,
      status: "published",
    },
  );
  const [tasksText, setTasksText] = useState((initial?.tasks ?? []).join("\n"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof JobInput>(key: K, value: JobInput[K]) =>
    setF((prev) => ({ ...prev, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await saveJob({
      ...f,
      slug: f.slug || f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      tasks: tasksText.split("\n").map((t) => t.trim()).filter(Boolean),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/bit/admin/stellen");
      router.refresh();
    } else setError(res.error);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-slate-900">Stellentitel *</span>
          <input className={`${FIELD} mt-1.5`} value={f.title} onChange={(e) => set("title", e.target.value)} required />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">Slug *</span>
          <input className={`${FIELD} mt-1.5`} value={f.slug} onChange={(e) => set("slug", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">Status</span>
          <select className={`${FIELD} mt-1.5`} value={f.status} onChange={(e) => set("status", e.target.value as JobInput["status"])}>
            <option value="published">Veröffentlicht</option>
            <option value="draft">Entwurf</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-slate-900">Anreißer (blau hervorgehoben)</span>
        <textarea className={`${FIELD} mt-1.5`} rows={2} value={f.intro} onChange={(e) => set("intro", e.target.value)} />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-900">Beschreibung (Leerzeile = Absatz)</span>
        <textarea className={`${FIELD} mt-1.5`} rows={4} value={f.body} onChange={(e) => set("body", e.target.value)} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">Überschrift der Aufgabenliste</span>
          <input className={`${FIELD} mt-1.5`} value={f.tasks_title} onChange={(e) => set("tasks_title", e.target.value)} />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-slate-900">Aufgaben (eine je Zeile)</span>
        <textarea className={`${FIELD} mt-1.5`} rows={5} value={tasksText} onChange={(e) => setTasksText(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-900">Schlussabsatz</span>
        <textarea className={`${FIELD} mt-1.5`} rows={3} value={f.closing} onChange={(e) => set("closing", e.target.value)} />
      </label>
      <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-2 border-t border-slate-200 bg-white/95 px-6 py-3 backdrop-blur">
        {f.id && (
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Stelle wirklich löschen?")) return;
              const res = await deleteJob(f.id!);
              if (res.ok) {
                router.push("/bit/admin/stellen");
                router.refresh();
              } else setError(res.error);
            }}
            className="mr-auto rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Löschen
          </button>
        )}
        <button type="button" onClick={() => router.push("/bit/admin/stellen")} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Abbrechen
        </button>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#1e4a7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a61] disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Speichern & veröffentlichen
        </button>
      </div>
    </form>
  );
}
