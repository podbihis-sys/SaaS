import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { createClient } from "@/app/bit/_lib/supabase-server";
import { formatDate } from "@/app/bit/_lib/format";
import { NEWS } from "@/app/bit/_data/news";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  published_at: string | null;
}

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bit_news")
    .select("id,slug,title,status,published_at")
    .order("published_at", { ascending: false });
  const rows = (data as Row[] | null) ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">News</h1>
          <p className="mt-1 text-sm text-slate-500">{rows.length} Beiträge</p>
        </div>
        <Link
          href="/bit/admin/news/neu"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1e4a7a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a61]"
        >
          <Plus className="h-4 w-4" /> Neu
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tabelle <code>bit_news</code> noch nicht erreichbar – bitte Migration ausführen. Bis dahin
          werden auf der Website die {NEWS.length} vorbefüllten Beiträge angezeigt.
        </p>
      )}

      {rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <p className="font-medium text-slate-700">Noch keine Beiträge in der Datenbank</p>
          <p className="mt-1 text-sm text-slate-500">Legen Sie über „Neu“ den ersten Beitrag an.</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {rows.map((p) => (
            <li key={p.id}>
              <Link
                href={`/bit/admin/news/${p.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    p.status === "published" ? "bg-green-500" : "bg-amber-400"
                  }`}
                  title={p.status === "published" ? "Veröffentlicht" : "Entwurf"}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900">{p.title}</span>
                  <span className="block truncate text-xs text-slate-400">
                    {p.published_at ? formatDate(p.published_at) : "ohne Datum"} · {p.slug}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
