import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/app/bit/_lib/supabase-server";

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

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Produkte</h1>
          <p className="mt-1 text-sm text-slate-500">{products.length} Artikel im Katalog</p>
        </div>
        <Link
          href="/bit/admin/produkte/neu"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1e4a7a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a61]"
        >
          <Plus className="h-4 w-4" /> Neues Produkt
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Tabelle nicht erreichbar: {error.message}. Wurde die Migration <code>0003_bit_cms.sql</code>{" "}
          angewendet?
        </p>
      )}

      {products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <p className="font-medium text-slate-700">Noch keine Produkte in der Datenbank</p>
          <p className="mt-1 text-sm text-slate-500">
            Spielen Sie zuerst den Bestand per Seed ein (siehe <code>docs/bit-cms.md</code>) oder legen
            Sie ein Produkt direkt an.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Kategorie</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link href={`/bit/admin/produkte/${p.id}`} className="font-medium text-slate-900 hover:text-[#1e4a7a]">
                      {p.name}
                    </Link>
                    <div className="text-xs text-slate-400">{p.slug}</div>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{p.category_id}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {p.status === "published" ? "Veröffentlicht" : "Entwurf"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Link
                      href={`/bit/admin/produkte/${p.id}`}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-[#1e4a7a] hover:bg-slate-100"
                    >
                      <Pencil className="h-4 w-4" /> Bearbeiten
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
