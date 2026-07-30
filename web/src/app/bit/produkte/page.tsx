"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, PRODUCTS, type CategoryId } from "../_data/catalog";
import { Catalog } from "../_components/catalog";

function isCategoryId(value: string | null): value is CategoryId {
  return !!value && CATEGORIES.some((c) => c.id === value);
}

/** Legacy-Links mit ?kategorie=… weiterhin unterstützen. */
function CatalogWithParams() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("kategorie");
  return <Catalog active={isCategoryId(initial) ? initial : "alle"} />;
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="container py-14">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">Produkte</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
              Schläuche, Wellrohre &amp; Befestigung
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Über 1.000 Standardartikel aus Schrumpf-, Isolier-, Glasseiden- und
              Geflechtschlauchtechnik, Wellrohre und Kabelbinder – filterbar nach Kategorie,
              Material, Wandstärke, Schrumpfrate und Temperatur. Lieferung von Standardware in
              der Regel innerhalb von 24 Stunden, Konfektion ab Losgröße 1.
            </p>
            <p className="mt-6 text-sm text-slate-500">Produkte werden geladen …</p>
            <nav className="mt-10" aria-label="Alle Produkte">
              {CATEGORIES.map((cat) => {
                const items = PRODUCTS.filter((p) => p.category === cat.id);
                if (items.length === 0) return null;
                return (
                  <div key={cat.id} className="mt-6">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-[#1e4a7a]">
                      <Link href={`/bit/${cat.id}`} className="hover:underline">
                        {cat.name}
                      </Link>
                    </h2>
                    <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((p) => (
                        <li key={p.slug}>
                          <Link
                            href={`/bit/produkte/${p.slug}`}
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
      }
    >
      <CatalogWithParams />
    </Suspense>
  );
}
