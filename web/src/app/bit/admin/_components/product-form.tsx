"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { createClient } from "@/app/bit/_lib/supabase-browser";
import { saveProduct, type ProductInput } from "../_actions";

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

type Cat = { id: string; name: string };

const FIELD =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e4a7a] focus:ring-1 focus:ring-[#1e4a7a]";

export function ProductForm({
  categories,
  initial,
}: {
  categories: Cat[];
  initial?: ProductInput;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState<ProductInput>(
    initial ?? {
      slug: "",
      category_id: categories[0]?.id ?? "",
      code: "",
      name: "",
      tagline: "",
      description: "",
      material: "",
      temperature: "",
      unit: "Stück",
      sizes: [],
      colors: [],
      features: [],
      applications: [],
      tech: [],
      datasheet_url: "",
      image_path: "",
      image_alt: "",
      status: "draft",
    },
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setF((prev) => ({ ...prev, [key]: value }));

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const base = (f.slug || slugify(f.name) || "produkt").slice(0, 60);
      const path = `products/${base}-${Date.now()}.${ext}`;
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
    const payload: ProductInput = { ...f, slug: f.slug || slugify(f.name) };
    const res = await saveProduct(payload);
    setSaving(false);
    if (res.ok) {
      router.push("/bit/admin");
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
      )}

      {/* Grunddaten */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Name *">
          <input
            className={FIELD}
            value={f.name}
            onChange={(e) => {
              const name = e.target.value;
              setF((p) => ({ ...p, name, slug: p.id ? p.slug : slugify(name) }));
            }}
            required
          />
        </Field>
        <Field label="Slug (URL) *">
          <input className={FIELD} value={f.slug} onChange={(e) => set("slug", e.target.value)} required />
        </Field>
        <Field label="Kategorie *">
          <select className={FIELD} value={f.category_id} onChange={(e) => set("category_id", e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Artikelcode">
          <input className={FIELD} value={f.code} onChange={(e) => set("code", e.target.value)} />
        </Field>
        <Field label="Tagline">
          <input className={FIELD} value={f.tagline} onChange={(e) => set("tagline", e.target.value)} />
        </Field>
        <Field label="Einheit">
          <input className={FIELD} value={f.unit} onChange={(e) => set("unit", e.target.value)} />
        </Field>
        <Field label="Material">
          <input className={FIELD} value={f.material} onChange={(e) => set("material", e.target.value)} />
        </Field>
        <Field label="Temperaturbereich">
          <input className={FIELD} value={f.temperature} onChange={(e) => set("temperature", e.target.value)} />
        </Field>
      </section>

      <Field label="Beschreibung">
        <textarea
          className={FIELD}
          rows={4}
          value={f.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      {/* Bild */}
      <section>
        <label className="text-sm font-semibold text-slate-900">Produktbild</label>
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
          </div>
        </div>
      </section>

      {/* Größen / Farben / Features / Anwendungen */}
      <ChipInput label="Größen" values={f.sizes} onChange={(v) => set("sizes", v)} placeholder="z. B. 3,2 mm" />
      <ChipInput label="Ausführungen / Farben" values={f.colors} onChange={(v) => set("colors", v)} placeholder="z. B. Schwarz" />
      <ChipInput label="Eigenschaften" values={f.features} onChange={(v) => set("features", v)} placeholder="z. B. Flammwidrig" />
      <ChipInput label="Anwendungen" values={f.applications} onChange={(v) => set("applications", v)} placeholder="z. B. Kabelbündelung" />

      {/* Technische Daten */}
      <TechEditor rows={f.tech} onChange={(v) => set("tech", v)} />

      <Field label="Datenblatt-URL (PDF)">
        <input className={FIELD} value={f.datasheet_url} onChange={(e) => set("datasheet_url", e.target.value)} />
      </Field>

      {/* Status + Submit */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          Status
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={f.status}
            onChange={(e) => set("status", e.target.value as ProductInput["status"])}
          >
            <option value="draft">Entwurf</option>
            <option value="published">Veröffentlicht</option>
          </select>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push("/bit/admin")}
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

function ChipInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <section>
      <label className="text-sm font-semibold text-slate-900">{label}</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label="Entfernen">
              <X className="h-3.5 w-3.5 text-slate-400 hover:text-red-600" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          className={FIELD}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" /> Hinzufügen
        </button>
      </div>
    </section>
  );
}

function TechEditor({
  rows,
  onChange,
}: {
  rows: { label: string; value: string }[];
  onChange: (v: { label: string; value: string }[]) => void;
}) {
  const update = (i: number, key: "label" | "value", val: string) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  return (
    <section>
      <label className="text-sm font-semibold text-slate-900">Technische Daten</label>
      <div className="mt-2 space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={FIELD}
              placeholder="Bezeichnung"
              value={row.label}
              onChange={(e) => update(i, "label", e.target.value)}
            />
            <input
              className={FIELD}
              placeholder="Wert"
              value={row.value}
              onChange={(e) => update(i, "value", e.target.value)}
            />
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
              aria-label="Zeile entfernen"
              className="shrink-0 rounded-lg border border-slate-300 px-3 text-slate-500 hover:bg-red-50 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...rows, { label: "", value: "" }])}
        className="mt-2 inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Plus className="h-4 w-4" /> Zeile hinzufügen
      </button>
    </section>
  );
}
