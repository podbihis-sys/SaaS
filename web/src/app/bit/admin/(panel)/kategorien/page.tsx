import { createClient } from "@/app/bit/_lib/supabase-server";
import { CategoryEditor } from "../../_components/category-editor";
import type { CategoryInput } from "../../_actions";

export const dynamic = "force-dynamic";

export default async function KategorienAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bit_categories")
    .select("id,name,tagline,description,image_path,sort_order")
    .order("sort_order");
  const rows: CategoryInput[] = (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    tagline: r.tagline ?? "",
    description: r.description ?? "",
    image_path: r.image_path ?? "",
    sort_order: r.sort_order,
  }));
  return (
    <>
      <h1 className="text-xl font-bold text-slate-900">Kategorien</h1>
      <p className="mt-1 text-sm text-slate-500">
        Produktwelten der Website – Änderungen sind nach dem Speichern sofort live.
      </p>
      <div className="mt-6">
        <CategoryEditor initial={rows} />
      </div>
    </>
  );
}
