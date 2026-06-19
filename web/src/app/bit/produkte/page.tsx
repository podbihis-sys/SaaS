"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, PRODUCTS, type CategoryId, type Product } from "../_data/catalog";
import { ProductCard } from "../_components/product-card";
import {
  MATERIAL_GROUPS,
  type MaterialGroup,
  type Wall,
  hasAdhesive,
  materialGroups,
  materialTaxa,
  maxTemp,
  propertyTaxa,
  shrinkRatio,
  shrinkTaxa,
  wallType,
} from "../_data/attributes";

const WALLS: Wall[] = ["dünnwandig", "mittelwandig", "dickwandig"];
const SHRINK_OPTIONS = [2, 3, 4];

// Temperaturgrenzen einmalig aus dem Sortiment ableiten.
const TEMPS = PRODUCTS.map(maxTemp).filter((n): n is number => n != null);
const TEMP_MIN = Math.min(...TEMPS);
const TEMP_MAX = Math.max(...TEMPS);

interface Filters {
  walls: Set<Wall>;
  minShrink: number | null;
  adhesive: "all" | "yes" | "no";
  materials: Set<MaterialGroup>;
  minTemp: number;
}

const EMPTY: Filters = {
  walls: new Set(),
  minShrink: null,
  adhesive: "all",
  materials: new Set(),
  minTemp: TEMP_MIN,
};

function matches(p: Product, f: Filters): boolean {
  if (f.walls.size) {
    const w = wallType(p);
    if (!w || !f.walls.has(w)) return false;
  }
  if (f.minShrink != null) {
    const s = shrinkRatio(p);
    if (!s || s.value < f.minShrink) return false;
  }
  if (f.adhesive !== "all") {
    const a = hasAdhesive(p);
    if (f.adhesive === "yes" && !a) return false;
    if (f.adhesive === "no" && a) return false;
  }
  if (f.materials.size) {
    const groups = materialGroups(p);
    if (!groups.some((g) => f.materials.has(g))) return false;
  }
  if (f.minTemp > TEMP_MIN) {
    const t = maxTemp(p);
    if (t == null || t < f.minTemp) return false;
  }
  return true;
}

function isCategoryId(value: string | null): value is CategoryId {
  return !!value && CATEGORIES.some((c) => c.id === value);
}

function Catalog() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("kategorie");
  const [active, setActive] = useState<CategoryId | "alle">(
    isCategoryId(initial) ? initial : "alle",
  );
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [mobileOpen, setMobileOpen] = useState(false);

  const byCategory = useMemo(
    () => (active === "alle" ? PRODUCTS : PRODUCTS.filter((p) => p.category === active)),
    [active],
  );
  const products = useMemo(
    () => byCategory.filter((p) => matches(p, filters)),
    [byCategory, filters],
  );

  const activeFilterCount =
    filters.walls.size +
    filters.materials.size +
    (filters.minShrink != null ? 1 : 0) +
    (filters.adhesive !== "all" ? 1 : 0) +
    (filters.minTemp > TEMP_MIN ? 1 : 0);

  const toggleWall = (w: Wall) =>
    setFilters((f) => {
      const walls = new Set(f.walls);
      walls.has(w) ? walls.delete(w) : walls.add(w);
      return { ...f, walls };
    });
  const toggleMaterial = (m: MaterialGroup) =>
    setFilters((f) => {
      const materials = new Set(f.materials);
      materials.has(m) ? materials.delete(m) : materials.add(m);
      return { ...f, materials };
    });

  const properties = propertyTaxa();
  const materials = materialTaxa();
  const shrinks = shrinkTaxa();

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
            Wählen Sie eine Kategorie, filtern Sie nach technischen Eigenschaften und legen Sie
            Artikel in der gewünschten Größe in den Warenkorb.
          </p>

          {/* SEO: beliebte Eigenschaften, Werkstoffe & Schrumpfraten */}
          <div className="mt-6 space-y-2">
            <SeoChipRow label="Eigenschaften" prefix="/bit/produkte/eigenschaft" items={properties.slice(0, 8)} />
            <SeoChipRow label="Material" prefix="/bit/produkte/material" items={materials} />
            <SeoChipRow
              label="Schrumpfrate"
              prefix="/bit/produkte/schrumpfrate"
              items={shrinks.map((t) => ({ slug: t.slug, label: t.label }))}
            />
          </div>
        </div>
      </section>

      <div className="container py-10">
        {/* Category chips */}
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar filters */}
          <aside
            className={`${mobileOpen ? "block" : "hidden"} lg:block`}
          >
            <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Filter</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => setFilters(EMPTY)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#1e4a7a] hover:underline"
                  >
                    <X className="h-3.5 w-3.5" /> Zurücksetzen ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Wandstärke */}
              <FilterGroup title="Wandstärke">
                {WALLS.map((w) => (
                  <Check key={w} checked={filters.walls.has(w)} onChange={() => toggleWall(w)} label={cap(w)} />
                ))}
              </FilterGroup>

              {/* Schrumpfrate */}
              <FilterGroup title="Schrumpfrate min.">
                <div className="flex flex-wrap gap-2">
                  {SHRINK_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() =>
                        setFilters((f) => ({ ...f, minShrink: f.minShrink === s ? null : s }))
                      }
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                        filters.minShrink === s
                          ? "border-[#1e4a7a] bg-[#1e4a7a] text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-[#1e4a7a]"
                      }`}
                    >
                      {s}:1
                    </button>
                  ))}
                </div>
              </FilterGroup>

              {/* Kleber */}
              <FilterGroup title="Kleber">
                <div className="flex flex-wrap gap-2">
                  {(["all", "yes", "no"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFilters((f) => ({ ...f, adhesive: opt }))}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                        filters.adhesive === opt
                          ? "border-[#1e4a7a] bg-[#1e4a7a] text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-[#1e4a7a]"
                      }`}
                    >
                      {opt === "all" ? "Alle" : opt === "yes" ? "mit Kleber" : "ohne Kleber"}
                    </button>
                  ))}
                </div>
              </FilterGroup>

              {/* Einsatztemperatur max. (Schieberegler) */}
              <FilterGroup title="Einsatztemperatur max.">
                <input
                  type="range"
                  min={TEMP_MIN}
                  max={TEMP_MAX}
                  step={5}
                  value={filters.minTemp}
                  onChange={(e) => setFilters((f) => ({ ...f, minTemp: Number(e.target.value) }))}
                  className="w-full accent-[#1e4a7a]"
                  aria-label="Minimale maximale Einsatztemperatur"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>≥ {filters.minTemp} °C</span>
                  <span>{TEMP_MAX} °C</span>
                </div>
              </FilterGroup>

              {/* Material */}
              <FilterGroup title="Material">
                {MATERIAL_GROUPS.map((m) => (
                  <Check
                    key={m}
                    checked={filters.materials.has(m)}
                    onChange={() => toggleMaterial(m)}
                    label={m}
                  />
                ))}
              </FilterGroup>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{products.length}</span>{" "}
                {products.length === 1 ? "Artikel" : "Artikel"}
              </p>
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </button>
            </div>

            {products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <p className="text-slate-600">Keine Artikel für diese Filter gefunden.</p>
                <button
                  onClick={() => setFilters(EMPTY)}
                  className="mt-3 text-sm font-semibold text-[#1e4a7a] hover:underline"
                >
                  Filter zurücksetzen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 border-t border-slate-100 pt-4 first:mt-4 first:border-t-0 first:pt-0">
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 accent-[#1e4a7a]"
      />
      {label}
    </label>
  );
}

function SeoChipRow({
  label,
  prefix,
  items,
}: {
  label: string;
  prefix: string;
  items: { slug: string; label: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <span className="w-24 shrink-0 self-center text-sm text-slate-500">{label}:</span>
      {items.map((t) => (
        <Link
          key={t.slug}
          href={`${prefix}/${t.slug}`}
          className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 transition-colors hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
        >
          {t.label}
        </Link>
      ))}
    </div>
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
            <p className="mt-6 text-sm text-slate-400">Produkte werden geladen …</p>
          </div>
        </section>
      }
    >
      <Catalog />
    </Suspense>
  );
}
