import Link from "next/link";
import { CATEGORIES, PRODUCTS, type CategoryId } from "../_data/catalog";
import { EN_CATEGORY_LABELS, EN_PRODUCTS } from "../_data/catalog-en";
import { ProductCard } from "./product-card";

/**
 * Englische Katalogansicht – gleiches Design wie die deutsche Produktübersicht
 * (dunkler Kopfbereich, Kategorie-Chips, Kartenraster), Produktnamen aus dem
 * englischen Original-Overlay (EN_PRODUCTS).
 */

function CategoryChip({
  href,
  label,
  active,
  count,
}: {
  href: string;
  label: string;
  active: boolean;
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-[#38bdf8] bg-[#38bdf8] text-[#0f2742]"
          : "border-slate-300 bg-white text-slate-700 hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
      }`}
    >
      {label}
      {typeof count === "number" && (
        <span className={active ? "text-[#0f2742]/70" : "text-slate-500"}>{count}</span>
      )}
    </Link>
  );
}

export function CatalogEnView({ active }: { active: CategoryId | "alle" }) {
  const category = active === "alle" ? undefined : CATEGORIES.find((c) => c.id === active);
  const filtered =
    active === "alle" ? PRODUCTS : PRODUCTS.filter((p) => p.category === active);

  return (
    <>
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="container py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">Products</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
            {category ? EN_CATEGORY_LABELS[category.id] ?? category.name : "Tubing, conduits & fastening"}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            {category
              ? `Our ${(EN_CATEGORY_LABELS[category.id] ?? category.name).toLowerCase()} range – pick a size and add the article to your inquiry cart.`
              : "More than 1,000 standard articles in heat-shrink, insulating and braided sleeve technology. Choose a category and add articles in the required size to your inquiry cart."}
          </p>
        </div>
      </section>

      <div className="container py-10">
        {/* Kategorie-Navigation */}
        <nav className="flex flex-wrap gap-2" aria-label="Categories">
          <CategoryChip
            href="/bit/en/products"
            label="All"
            active={active === "alle"}
            count={PRODUCTS.length}
          />
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c.id}
              href={`/bit/en/products/${c.id}`}
              label={EN_CATEGORY_LABELS[c.id] ?? c.name}
              active={active === c.id}
              count={PRODUCTS.filter((p) => p.category === c.id).length}
            />
          ))}
        </nav>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard
              key={p.slug}
              product={p}
              locale="en"
              href={`/bit/en/products/${p.category}/${p.slug}`}
              nameOverride={EN_PRODUCTS[p.slug]?.name}
              categoryLabel={EN_CATEGORY_LABELS[p.category]}
            />
          ))}
        </div>
      </div>
    </>
  );
}
