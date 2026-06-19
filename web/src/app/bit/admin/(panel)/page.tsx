import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { createClient } from "@/app/bit/_lib/supabase-server";
import { getCmsCategories } from "@/app/bit/_data/cms";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  slug: string;
  name: string;
  status: "draft" | "published";
  category_id: string;
}

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bit_products")
    .select("id,slug,name,status,category_id")
    .order("name", { ascending: true });
  const products = (data as Row[] | null) ?? [];
  const categories = await getCmsCategories();

  // Produkte nach Kategorie gruppieren (Reihenfolge der Kategorien beibehalten).
  const byCat = new Map<string, Row[]>();
  for (const c of categories) byCat.set(c.id, []);
  for (const p of products) {
    if (!byCat.has(p.category_id)) byCat.set(p.category_id, []);
    byCat.get(p.category_id)!.push(p);
  }
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  return (
    <div>
      {/* Kopf */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Produkte</h1>
          <p className="mt-1 text-sm text-slate-500">{products.length} Artikel</p>
        </div>
        <Link
          href="/bit/admin/produkte/neu"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1e4a7a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a61]"
        >
          <Plus className="h-4 w-4" /> Neu
        </Link>
      </div>

      {/* Sprung-Navigation nach Kategorie (mobil scrollbar) */}
      {products.length > 0 && (
        <nav className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => {
            const n = byCat.get(c.id)?.length ?? 0;
            if (n === 0) return null;
            return (
              <a
                key={c.id}
                href={`#cat-${c.id}`}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
              >
                {c.name} <span className="text-slate-400">{n}</span>
              </a>
            );
          })}
        </nav>
      )}

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Tabelle nicht erreichbar: {error.message}
        </p>
      )}

      {products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <p className="font-medium text-slate-700">Noch keine Produkte</p>
          <p className="mt-1 text-sm text-slate-500">Legen Sie über „Neu“ das erste Produkt an.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {categories.map((c) => {
            const items = byCat.get(c.id) ?? [];
            if (items.length === 0) return null;
            return (
              <section key={c.id} id={`cat-${c.id}`} className="scroll-mt-20">
                <div className="mb-2 flex items-baseline gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-[#1e4a7a]">{catName(c.id)}</h2>
                  <span className="text-xs text-slate-400">{items.length}</span>
                </div>
                {/* Mobil-freundliche Kartenliste statt breiter Tabelle */}
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {items.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/bit/admin/produkte/${p.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                      >
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            p.status === "published" ? "bg-green-500" : "bg-amber-400"
                          }`}
                          title={p.status === "published" ? "Veröffentlicht" : "Entwurf"}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-900">{p.name}</span>
                          <span className="block truncate text-xs text-slate-400">{p.slug}</span>
                        </span>
                        <span
                          className={`hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-medium sm:inline ${
                            p.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {p.status === "published" ? "Veröffentlicht" : "Entwurf"}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
