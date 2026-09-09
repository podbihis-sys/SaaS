import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/app/bit/_lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function StellenAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bit_jobs")
    .select("id,slug,title,status,sort_order")
    .order("sort_order");
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stellenanzeigen</h1>
          <p className="mt-1 text-sm text-slate-500">Offene Stellen auf /bit/karriere.</p>
        </div>
        <Link href="/bit/admin/stellen/neu" className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e4a7a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a61]">
          <Plus className="h-4 w-4" /> Neue Stelle
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Titel</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data ?? []).map((j) => (
              <tr key={j.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  <Link href={`/bit/admin/stellen/${j.id}`} className="hover:text-[#1e4a7a]">
                    {j.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${j.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {j.status === "published" ? "Live" : "Entwurf"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
