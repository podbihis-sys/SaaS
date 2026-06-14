"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, PRODUCTS, type CategoryId } from "../_data/catalog";
import { ProductCard } from "../_components/product-card";

function isCategoryId(value: string | null): value is CategoryId {
  return !!value && CATEGORIES.some((c) => c.id === value);
}

function Catalog() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("kategorie");
  const [active, setActive] = useState<CategoryId | "alle">(
    isCategoryId(initial) ? initial : "alle",
  );

  const products =
    active === "alle" ? PRODUCTS : PRODUCTS.filter((p) => p.category === active);

  return (
    <>
      {/* Page header */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">Produkte</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Schläuche, Wellrohre & Befestigung
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Über 1.000 Standardartikel aus Schrumpf-, Isolier- und Geflechtschlauchtechnik.
            Wählen Sie eine Kategorie, öffnen Sie den Artikel und legen Sie ihn in der
            gewünschten Größe in den Warenkorb.
          </p>
        </div>
      </section>

      <div className="container py-10">
        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          <FilterChip label="Alle" active={active === "alle"} onClick={() => setActive("alle")} count={PRODUCTS.length} />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              label={c.name}
              active={active === c.id}
              onClick={() => setActive(c.id)}
              count={PRODUCTS.filter((p) => p.category === c.id).length}
            />
          ))}
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-[#1e4a7a] bg-[#1e4a7a] text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-[#1e4a7a]"
      }`}
    >
      {label}
      <span className={`text-xs ${active ? "text-white/70" : "text-slate-400"}`}>{count}</span>
    </button>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-slate-500">Lädt …</div>}>
      <Catalog />
    </Suspense>
  );
}
