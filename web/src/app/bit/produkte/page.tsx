import Link from "next/link";
import type { CategoryId } from "../_data/catalog";
import { getCatalog } from "../_data/products-server";
import { Catalog } from "../_components/catalog";

// Inhalte erneuern sich alle 5 Minuten im Hintergrund (ISR) – Änderungen im
// CMS wirken ohne Deploy.
export const revalidate = 300;

/**
 * Produktübersicht (CMS-first). Legacy-Links mit ?kategorie=… werden weiter
 * unterstützt; die Kategorie-Auswahl selbst navigiert auf /bit/<kategorie>.
 */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ kategorie?: string }>;
}) {
  const [{ kategorie }, { categories, products }] = await Promise.all([
    searchParams,
    getCatalog(),
  ]);
  const active =
    kategorie && categories.some((c) => c.id === kategorie)
      ? (kategorie as CategoryId)
      : ("alle" as const);

  return (
    <>
      <Catalog active={active} categories={categories} products={products} />

      {/* Vollständige Produktliste für Suchmaschinen und als Schnellzugriff. */}
      <section className="border-t border-slate-200 bg-slate-50 py-14">
        <div className="container">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Alle Produkte im Überblick
          </h2>
          <nav className="mt-6" aria-label="Alle Produkte">
            {categories.map((cat) => {
              const items = products.filter((p) => p.category === cat.id);
              if (items.length === 0) return null;
              return (
                <div key={cat.id} className="mt-6">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[#1e4a7a]">
                    <Link href={`/bit/${cat.id}`} className="hover:underline">
                      {cat.name}
                    </Link>
                  </h3>
                  <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/bit/produkte/${p.category}/${p.slug}`}
                          className="text-sm text-slate-600 hover:text-[#1e4a7a]"
                        >
                          {p.name}
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
