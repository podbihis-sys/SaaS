"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { CONTENT_FIELDS, type ContentMap } from "@/app/bit/_data/content";
import { saveContent } from "../_actions";

const FIELD =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e4a7a] focus:ring-1 focus:ring-[#1e4a7a]";

export function ContentForm({ initial }: { initial: ContentMap }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of CONTENT_FIELDS) v[f.key] = initial[f.key] ?? "";
    return v;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const pages = Array.from(new Set(CONTENT_FIELDS.map((f) => f.page)));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const entries = CONTENT_FIELDS.map((f) => ({ key: f.key, value: values[f.key] ?? "" }));
    const res = await saveContent(entries);
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError(res.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {pages.map((page) => (
        <section key={page} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#1e4a7a]">{page}</h2>
          <div className="mt-4 space-y-4">
            {CONTENT_FIELDS.filter((f) => f.page === page).map((f) => (
              <label key={f.key} className="block">
                <span className="text-sm font-medium text-slate-700">{f.label}</span>
                {f.multiline ? (
                  <textarea
                    rows={4}
                    value={values[f.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    className={FIELD}
                  />
                ) : (
                  <input
                    value={values[f.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    className={FIELD}
                  />
                )}
              </label>
            ))}
          </div>
        </section>
      ))}

      <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <button
          type="submit"
          disabled={saving}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold sm:w-auto ${
            saved ? "bg-green-600 text-white" : "bg-[#1e4a7a] text-white hover:bg-[#163a61]"
          } disabled:opacity-60`}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saved ? (
            <>
              <Check className="h-4 w-4" /> Gespeichert
            </>
          ) : (
            "Speichern"
          )}
        </button>
      </div>
    </form>
  );
}
