import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, PRODUCTS } from "../../_data/catalog";
import { EN_CATEGORY_LABELS, EN_PRODUCTS } from "../../_data/catalog-en";
import { CatalogEnView } from "../../_components/catalog-en-view";

export const metadata: Metadata = {
  alternates: { canonical: "/bit/en/products" },
  title: "Products",
  description:
    "More than 1,000 standard articles: heat-shrink, insulating, fiberglass and braided sleeves, corrugated conduits, cable ties and tools – with sizes and inquiry cart.",
};

/** Englische Produktübersicht – gleicher Aufbau wie /bit/produkte. */
export default function EnglishProductsPage() {
  return (
    <>
      <CatalogEnView active="alle" />

      {/* Vollständige Produktliste für Suchmaschinen und als Schnellzugriff. */}
      <section className="border-t border-slate-200 bg-slate-50 py-14">
        <div className="container">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">All products at a glance</h2>
          <nav className="mt-6" aria-label="All products">
            {CATEGORIES.map((cat) => {
              const items = PRODUCTS.filter((p) => p.category === cat.id);
              if (items.length === 0) return null;
              return (
                <div key={cat.id} className="mt-6">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[#1e4a7a]">
                    <Link href={`/bit/en/products/${cat.id}`} className="hover:underline">
                      {EN_CATEGORY_LABELS[cat.id] ?? cat.name}
                    </Link>
                  </h3>
                  <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/bit/en/products/${p.category}/${p.slug}`}
                          className="text-sm text-slate-600 hover:text-[#1e4a7a]"
                        >
                          {EN_PRODUCTS[p.slug]?.name ?? p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
        </div>
      </section>
    </>
  );
}
