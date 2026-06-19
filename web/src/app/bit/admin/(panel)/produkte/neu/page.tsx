import { getCmsCategories } from "@/app/bit/_data/cms";
import { ProductForm } from "@/app/bit/admin/_components/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCmsCategories();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Neues Produkt</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <ProductForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
      </div>
    </div>
  );
}
