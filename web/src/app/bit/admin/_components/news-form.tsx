"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { createClient } from "@/app/bit/_lib/supabase-browser";
import { saveNews, type NewsInput } from "../_actions";

const BUCKET = "bit-product-images";

function publicUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[äàâ]/g, "a").replace(/[öô]/g, "o").replace(/[üû]/g, "u").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const FIELD =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e4a7a] focus:ring-1 focus:ring-[#1e4a7a]";

export function NewsForm({ initial }: { initial?: NewsInput }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState<NewsInput>(
    initial ?? {
      slug: "",
      title: "",
      excerpt: "",
      body: "",
      published_at: new Date().toISOString().slice(0, 10),
      image_path: "",
      image_alt: "",
      status: "published",
    },
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof NewsInput>(key: K, value: NewsInput[K]) =>
    setF((prev) => ({ ...prev, [key]: value }));

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const base = (f.slug || slugify(f.title) || "news").slice(0, 60);
      const path = `news/${base}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) {
        setError(`Bild-Upload fehlgeschlagen: ${upErr.message}`);
        return;
      }
      set("image_path", path);
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload: NewsInput = { ...f, slug: f.slug || slugify(f.title) };
    const res = await saveNews(payload);
    setSaving(false);
    if (res.ok) {
      router.push("/bit/admin/news");
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Titel *">
          <input
            className={FIELD}
            value={f.title}
            onChange={(e) => {
              const title = e.target.value;
              setF((p) => ({ ...p, title, slug: p.id ? p.slug : slugify(title) }));
            }}
            required
          />
        </Field>
        <Field label="Slug (URL) *">
          <input className={FIELD} value={f.slug} onChange={(e) => set("slug", e.target.value)} required />
        </Field>
        <Field label="Veröffentlicht am">
          <input
            type="date"
            className={FIELD}
            value={f.published_at}
            onChange={(e) => set("published_at", e.target.value)}
          />
        </Field>
        <Field label="Status">
          <select
            className={FIELD}
            value={f.status}
            onChange={(e) => set("status", e.target.value as NewsInput["status"])}
          >
            <option value="published">Veröffentlicht</option>
            <option value="draft">Entwurf</option>
          </select>
        </Field>
      </section>

      <Field label="Anrisstext (Übersicht)">
        <textarea
          className={FIELD}
          rows={3}
          value={f.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
        />
      </Field>

      <Field label="Beitragstext">
        <textarea
          className={`${FIELD} font-mono text-xs`}
          rows={16}
          value={f.body}
          onChange={(e) => set("body", e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-400">
          Formatierung: Leerzeile = neuer Absatz · „## “ = Zwischenüberschrift · „- “ = Aufzählungspunkt.
        </p>
      </Field>

      {/* Bild */}
      <section>
        <label className="text-sm font-semibold text-slate-900">Beitragsbild</label>
        <div className="mt-2 flex items-center gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {f.image_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={publicUrl(f.image_path)} alt="" className="h-full w-full object-contain" />
            ) : (
              <span className="text-xs text-slate-400">kein Bild</span>
            )}
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Bild hochladen
            </button>
            <input
              className={`${FIELD} mt-2`}
              placeholder="Bild-Alt-Text"
              value={f.image_alt}
              onChange={(e) => set("image_alt", e.target.value)}
            />
            <input
              className={`${FIELD} mt-2`}
              placeholder="oder Bildpfad/-URL (z. B. /bit/news/…)"
              value={f.image_path}
              onChange={(e) => set("image_path", e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 -mx-6 mt-2 flex items-center justify-end gap-2 border-t border-slate-200 bg-white/95 px-6 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.push("/bit/admin/news")}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1e4a7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a61] disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Speichern
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
