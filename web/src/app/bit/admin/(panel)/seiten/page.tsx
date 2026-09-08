import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/app/bit/_lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function SeitenAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bit_pages")
    .select("id,slug,title,status,updated_at")
    .order("slug");
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Unterseiten</h1>
          <p className="mt-1 text-sm text-slate-500">Inhaltsseiten unter /bit/… – Texte, Tabellen und Bilder.</p>
        </div>
        <Link href="/bit/admin/seiten/neu" className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e4a7a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a61]">
          <Plus className="h-4 w-4" /> Neue Seite
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Titel</th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Geändert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  <Link href={`/bit/admin/seiten/${p.id}`} className="hover:text-[#1e4a7a]">
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500">/bit/{p.slug}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {p.status === "published" ? "Live" : "Entwurf"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {p.updated_at ? new Date(p.updated_at).toLocaleDateString("de-DE") : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
