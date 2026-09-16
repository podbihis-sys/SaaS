"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { createClient } from "@/app/bit/_lib/supabase-browser";
import { deleteCategory, saveCategory, type CategoryInput } from "../_actions";

const BUCKET = "bit-product-images";

function publicUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  const base = process.env.NEXT_PUBLIC_BIT_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

const FIELD =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e4a7a] focus:ring-1 focus:ring-[#1e4a7a]";

export function CategoryEditor({ initial }: { initial: CategoryInput[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<CategoryInput[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError] = useState("");

  const set = (i: number, patch: Partial<CategoryInput>) =>
    setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  // Kategoriebild in den Storage-Bucket laden; der Pfad wird mit „Speichern“
  // in bit_categories.image_path übernommen und ersetzt dann das Standardbild.
  async function upload(i: number, file: File) {
    const row = rows[i];
    if (!row) return;
    setUploading(i);
    setError("");
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `categories/${row.id || "kategorie"}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) {
        setError(`Bild-Upload fehlgeschlagen: ${upErr.message}`);
        return;
      }
      set(i, { image_path: path });
    } finally {
      setUploading(null);
    }
  }

  async function save(i: number) {
    const row = rows[i];
    if (!row) return;
    setBusy(row.id || "neu");
    setError("");
    const res = await saveCategory({ ...row, sort_order: i });
    setBusy(null);
    if (!res.ok) setError(res.error);
    else router.refresh();
  }

  async function remove(i: number) {
    const row = rows[i];
    if (!row) return;
    if (!row.id) return setRows((r) => r.filter((_, j) => j !== i));
    if (!confirm(`Kategorie „${row.name}“ wirklich löschen?`)) return;
    setBusy(row.id);
    setError("");
    const res = await deleteCategory(row.id);
    setBusy(null);
    if (!res.ok) setError(res.error);
    else {
      setRows((r) => r.filter((_, j) => j !== i));
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
      )}
      {rows.map((row, i) => (
        <div key={row.id || `neu-${i}`} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">ID (URL) *</span>
              <input className={FIELD} value={row.id} onChange={(e) => set(i, { id: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">Name *</span>
              <input className={FIELD} value={row.name} onChange={(e) => set(i, { name: e.target.value })} />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-slate-500">Kurzzeile</span>
              <input className={FIELD} value={row.tagline} onChange={(e) => set(i, { tagline: e.target.value })} />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-slate-500">Beschreibung</span>
              <textarea className={FIELD} rows={2} value={row.description} onChange={(e) => set(i, { description: e.target.value })} />
            </label>

            {/* Kategoriebild (Startseite, Slider, Kategoriekarten) */}
            <div className="sm:col-span-2">
              <span className="text-xs font-semibold text-slate-500">Kategoriebild</span>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {row.image_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={publicUrl(row.image_path)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="px-2 text-center text-[11px] text-slate-400">
                      Standard: erstes Produktbild
                    </span>
                  )}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  {uploading === i ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Bild hochladen
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading !== null}
                    onChange={(e) => e.target.files?.[0] && upload(i, e.target.files[0])}
                  />
                </label>
                {row.image_path && (
                  <button
                    type="button"
                    onClick={() => set(i, { image_path: "" })}
                    className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" /> Bild entfernen
                  </button>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Empfohlen: Querformat (16:9), JPG oder PNG. Wird nach „Speichern“ übernommen.
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => remove(i)}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" /> Löschen
            </button>
            <button
              onClick={() => save(i)}
              disabled={busy !== null || uploading !== null}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e4a7a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a61] disabled:opacity-50"
            >
              {busy === (row.id || "neu") ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Speichern
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={() => setRows((r) => [...r, { id: "", name: "", tagline: "", description: "", image_path: "", sort_order: r.length }])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Plus className="h-4 w-4" /> Kategorie hinzufügen
      </button>
    </div>
  );
}
