"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PRODUCTS, type CategoryId } from "../_data/catalog";
import { buildSearchIndex, searchIndex } from "../_lib/product-search";
import { ProductCard } from "./product-card";
import { ProductSearchBox } from "./product-search-box";

/**
 * Ergebnisbereich der englischen Produktübersicht: Suchfeld + Kartenraster.
 * Die englischen Namen kommen als kleine Map vom Server, damit das große
 * EN-Overlay nicht ins Client-Bundle wandert.
 */
export function CatalogEnResults({
  active,
  names,
  categoryLabels,
}: {
  active: CategoryId | "alle";
  /** slug → englischer Produktname */
  names: Record<string, string>;
  /** Kategorie-ID → englisches Label */
  categoryLabels: Record<string, string>;
}) {
  const [query, setQuery] = useState("");

  // Suchbegriff aus der URL übernehmen (?q=…), z. B. von „Search all categories".
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  const list = useMemo(
    () => (active === "alle" ? PRODUCTS : PRODUCTS.filter((p) => p.category === active)),
    [active],
  );
  const index = useMemo(
    () => buildSearchIndex(list, (p) => [names[p.slug] ?? "", categoryLabels[p.category] ?? ""]),
    [list, names, categoryLabels],
  );
  const results = useMemo(() => searchIndex(index, query), [index, query]);
  const searching = query.trim().length >= 2;

  return (
    <div className="mt-8">
      <ProductSearchBox value={query} onChange={setQuery} locale="en" />
      <p className="mt-4 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">{results.length}</span>{" "}
        {results.length === 1 ? "article" : "articles"}
        {searching && (
          <>
            {" "}
            for <span className="font-medium text-slate-900">“{query.trim()}”</span>
          </>
        )}
      </p>

      {results.length > 0 ? (
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <ProductCard
              key={p.slug}
              product={p}
              locale="en"
              href={`/bit/en/products/${p.category}/${p.slug}`}
              nameOverride={names[p.slug]}
              categoryLabel={categoryLabels[p.category]}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-slate-600">No articles found for “{query.trim()}”.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[#1e4a7a] hover:underline"
            >
              Clear search
            </button>
            {active !== "alle" && (
              <Link
                href={`/bit/en/products?q=${encodeURIComponent(query.trim())}`}
                className="text-[#1e4a7a] hover:underline"
              >
                Search all categories
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
