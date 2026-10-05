import { query } from "@/app/bit/_lib/db";
import { CategoryEditor } from "../../_components/category-editor";
import type { CategoryInput } from "../../_actions";

export const dynamic = "force-dynamic";

interface CatRow {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  image_path: string | null;
  sort_order: number;
}

export default async function KategorienAdmin() {
  let data: CatRow[] = [];
  try {
    data = await query<CatRow>(
      "SELECT id,name,tagline,description,image_path,sort_order FROM bit_categories ORDER BY sort_order",
    );
  } catch {
    data = [];
  }
  const rows: CategoryInput[] = data.map((r) => ({
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
