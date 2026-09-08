"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { deletePage, savePage, type PageInput } from "../_actions";

const FIELD =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e4a7a] focus:ring-1 focus:ring-[#1e4a7a]";

export function PageForm({ initial }: { initial?: PageInput }) {
  const router = useRouter();
  const [f, setF] = useState<PageInput>(
    initial ?? {
      slug: "",
      title: "",
      meta_title: "",
      meta_description: "",
      body: "",
      status: "published",
    },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof PageInput>(key: K, value: PageInput[K]) =>
    setF((prev) => ({ ...prev, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await savePage(f);
    setSaving(false);
    if (res.ok) {
      router.push("/bit/admin/seiten");
      router.refresh();
    } else setError(res.error);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">Titel *</span>
          <input className={`${FIELD} mt-1.5`} value={f.title} onChange={(e) => set("title", e.target.value)} required />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">Slug (URL unter /bit/) *</span>
          <input className={`${FIELD} mt-1.5`} value={f.slug} onChange={(e) => set("slug", e.target.value)} required />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">SEO-Titel</span>
          <input className={`${FIELD} mt-1.5`} value={f.meta_title} onChange={(e) => set("meta_title", e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">Status</span>
          <select className={`${FIELD} mt-1.5`} value={f.status} onChange={(e) => set("status", e.target.value as PageInput["status"])}>
            <option value="published">Veröffentlicht</option>
            <option value="draft">Entwurf</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-slate-900">SEO-Beschreibung</span>
        <textarea className={`${FIELD} mt-1.5`} rows={2} value={f.meta_description} onChange={(e) => set("meta_description", e.target.value)} />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-900">Seiteninhalt</span>
        <textarea className={`${FIELD} mt-1.5 font-mono text-xs`} rows={24} value={f.body} onChange={(e) => set("body", e.target.value)} />
        <p className="mt-1 text-xs text-slate-400">
          Formatierung: Leerzeile = Absatz · „## “ = Überschrift · „### “ = Zwischenüberschrift · „- “ = Aufzählung · „| Spalte | Wert“ = Tabellenzeile · „!img /pfad|Alt-Text“ = Bild.
        </p>
      </label>
      <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-2 border-t border-slate-200 bg-white/95 px-6 py-3 backdrop-blur">
        {f.id && (
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Seite wirklich löschen?")) return;
              const res = await deletePage(f.id!, f.slug);
              if (res.ok) {
                router.push("/bit/admin/seiten");
                router.refresh();
              } else setError(res.error);
            }}
            className="mr-auto rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Löschen
          </button>
        )}
        <button type="button" onClick={() => router.push("/bit/admin/seiten")} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
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
