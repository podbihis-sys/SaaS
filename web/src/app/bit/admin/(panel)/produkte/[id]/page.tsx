import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCmsCategories } from "@/app/bit/_data/cms";
import { ProductForm } from "@/app/bit/admin/_components/product-form";
import type { ProductInput } from "@/app/bit/admin/_actions";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  slug: string;
  category_id: string;
  code: string | null;
  name: string;
  tagline: string | null;
  description: string | null;
  material: string | null;
  temperature: string | null;
  unit: string;
  sizes: string[] | null;
  colors: string[] | null;
  features: string[] | null;
  applications: string[] | null;
  tech: { label: string; value: string }[] | null;
  datasheet_url: string | null;
  image_path: string | null;
  image_alt: string | null;
  status: "draft" | "published";
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("bit_products").select("*").eq("id", id).maybeSingle();
  const row = data as Row | null;
  if (!row) notFound();

  const categories = await getCmsCategories();

  const initial: ProductInput = {
    id: row.id,
    slug: row.slug,
    category_id: row.category_id,
    code: row.code ?? "",
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    material: row.material ?? "",
    temperature: row.temperature ?? "",
    unit: row.unit,
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    features: row.features ?? [],
    applications: row.applications ?? [],
    tech: row.tech ?? [],
    datasheet_url: row.datasheet_url ?? "",
    image_path: row.image_path ?? "",
    image_alt: row.image_alt ?? "",
    status: row.status,
  };

  async function handleDelete() {
    "use server";
    const sb = await createClient();
    await sb.from("bit_products").delete().eq("id", id);
    revalidatePath("/bit/admin");
    revalidatePath("/bit/produkte");
    redirect("/bit/admin");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Produkt bearbeiten</h1>
        <form action={handleDelete}>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Löschen
          </button>
        </form>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <ProductForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} initial={initial} />
      </div>
    </div>
  );
}
