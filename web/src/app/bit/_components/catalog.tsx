"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, PRODUCTS, type Category, type CategoryId, type Product } from "../_data/catalog";
import { ProductCard } from "./product-card";
import {
  MATERIAL_GROUPS,
  type MaterialGroup,
  type Wall,
  hasAdhesive,
  materialGroups,
  maxTemp,
  shrinkRatio,
  wallType,
} from "../_data/attributes";

const WALLS: Wall[] = ["dünnwandig", "mittelwandig", "dickwandig"];
const SHRINK_OPTIONS = [2, 3, 4];

interface Filters {
  walls: Set<Wall>;
  minShrink: number | null;
  adhesive: "all" | "yes" | "no";
  materials: Set<MaterialGroup>;
  /** null = kein Temperaturfilter aktiv. */
  minTemp: number | null;
}

const EMPTY: Filters = {
  walls: new Set(),
  minShrink: null,
  adhesive: "all",
  materials: new Set(),
  minTemp: null,
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
  if (f.minTemp != null) {
    const t = maxTemp(p);
    if (t == null || t < f.minTemp) return false;
  }
  return true;
}

/**
 * Interaktiver Produktkatalog. `active` steuert die Kategorie – die Auswahl
 * navigiert auf eigene Kategorie-URLs (/bit/<kategorie>), wie auf bit-gmbh.de.
 *
 * Die Filter richten sich nach der geöffneten Kategorie: Es werden nur
 * Kriterien und Werte angeboten, die im aktuellen Sortiment auch vorkommen –
 * z. B. keine Wandstärke bei Kabelbindern, keine Schrumpfrate bei Wellrohren.
 */
export function Catalog({
  active,
  categories = CATEGORIES,
  products = PRODUCTS,
}: {
  active: CategoryId | "alle";
  /** CMS-Daten (Fallback: statischer Katalog). */
  categories?: Category[];
  products?: Product[];
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [mobileOpen, setMobileOpen] = useState(false);

  const category = active === "alle" ? undefined : categories.find((c) => c.id === active);

  const byCategory = useMemo(
    () => (active === "alle" ? products : products.filter((p) => p.category === active)),
    [active, products],
  );

  // Verfügbare Filterkriterien aus dem Sortiment der Kategorie ableiten.
  const facets = useMemo(() => {
    const walls = WALLS.filter((w) => byCategory.some((p) => wallType(p) === w));

    const hasAnyShrink = byCategory.some((p) => shrinkRatio(p) != null);
    const shrinkOptions = hasAnyShrink
      ? SHRINK_OPTIONS.filter((s) => byCategory.some((p) => (shrinkRatio(p)?.value ?? 0) >= s))
      : [];

    // Kleberfilter nur sinnvoll, wenn beide Varianten vorkommen.
    const withGlue = byCategory.some(hasAdhesive);
    const withoutGlue = byCategory.some((p) => !hasAdhesive(p));
    const showAdhesive = withGlue && withoutGlue;

    const materials = MATERIAL_GROUPS.filter((m) =>
      byCategory.some((p) => materialGroups(p).includes(m)),
    );

    const temps = byCategory.map(maxTemp).filter((n): n is number => n != null);
    const tempMin = temps.length ? Math.min(...temps) : null;
    const tempMax = temps.length ? Math.max(...temps) : null;
    const showTemp = tempMin != null && tempMax != null && tempMax > tempMin;

    return {
      walls,
      shrinkOptions,
      showAdhesive,
      materials,
      tempMin,
      tempMax,
      showTemp,
      any:
        walls.length > 0 ||
        shrinkOptions.length > 0 ||
        showAdhesive ||
        materials.length > 1 ||
        showTemp,
    };
  }, [byCategory]);

  // Nur Filter anwenden, die in dieser Kategorie überhaupt angeboten werden.
  const effective = useMemo<Filters>(
    () => ({
      walls: facets.walls.length ? filters.walls : EMPTY.walls,
      minShrink: facets.shrinkOptions.length ? filters.minShrink : null,
      adhesive: facets.showAdhesive ? filters.adhesive : "all",
      materials: facets.materials.length ? filters.materials : EMPTY.materials,
      minTemp: facets.showTemp ? filters.minTemp : null,
    }),
    [filters, facets],
  );

  const filtered = useMemo(
    () => byCategory.filter((p) => matches(p, effective)),
    [byCategory, effective],
  );

  const activeFilterCount =
    effective.walls.size +
    effective.materials.size +
    (effective.minShrink != null ? 1 : 0) +
    (effective.adhesive !== "all" ? 1 : 0) +
    (effective.minTemp != null ? 1 : 0);

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

  return (
    <>
      {/* Page header */}
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="bit-page-hero container py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">Produkte</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
            {category ? category.name : "Schläuche, Wellrohre & Befestigung"}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            {category
              ? category.description
              : "Über 1.000 Standardartikel aus Schrumpf-, Isolier- und Geflechtschlauchtechnik. Wählen Sie eine Kategorie, filtern Sie nach technischen Eigenschaften und legen Sie Artikel in der gewünschten Größe in den Warenkorb."}
          </p>

        </div>
      </section>

      <div className="container py-10">
        {/* Kategorie-Navigation mit eigenen URLs */}
        <nav className="flex flex-wrap gap-2" aria-label="Kategorien">
          <CategoryChip href="/bit/produkte" label="Alle" active={active === "alle"} count={products.length} />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              href={`/bit/${c.id}`}
              label={c.name}
              active={active === c.id}
              count={products.filter((p) => p.category === c.id).length}
            />
          ))}
        </nav>

        <div className={`mt-8 grid gap-8 ${facets.any ? "lg:grid-cols-[260px_1fr]" : ""}`}>
          {/* Sidebar – nur rendern, wenn es für diese Kategorie Filter gibt */}
          {facets.any && (
            <aside className={`${mobileOpen ? "block" : "hidden"} lg:block`}>
              {/* Eigener Scrollbereich: Der Filter bleibt beim Scrollen stehen und
                  scrollt bei vielen Kriterien für sich, statt unten abgeschnitten
                  zu werden. Der Kopf mit „Zurücksetzen“ bleibt dabei sichtbar. */}
              <div className="rounded-2xl border border-slate-200 bg-white lg:sticky lg:top-36 lg:flex lg:max-h-[calc(100vh-10rem)] lg:flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
                    Filter
                  </h2>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => setFilters(EMPTY)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#1e4a7a] hover:underline"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" /> Zurücksetzen (
                      {activeFilterCount})
                    </button>
                  )}
                </div>
                <div className="bit-filter-scroll px-5 pb-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">

                {/* Wandstärke – nur wenn in dieser Kategorie vorhanden */}
                {facets.walls.length > 0 && (
                  <FilterGroup title="Wandstärke">
                    {facets.walls.map((w) => (
                      <Check
                        key={w}
                        checked={filters.walls.has(w)}
                        onChange={() => toggleWall(w)}
                        label={cap(w)}
                      />
                    ))}
                  </FilterGroup>
                )}

                {/* Schrumpfrate */}
                {facets.shrinkOptions.length > 0 && (
                  <FilterGroup title="Schrumpfrate min.">
                    <div className="flex flex-wrap gap-2">
                      {facets.shrinkOptions.map((s) => (
                        <button
                          key={s}
                          onClick={() =>
                            setFilters((f) => ({ ...f, minShrink: f.minShrink === s ? null : s }))
                          }
                          aria-pressed={filters.minShrink === s}
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
                )}

                {/* Kleber – nur wenn beide Varianten vorkommen */}
                {facets.showAdhesive && (
                  <FilterGroup title="Kleber">
                    <div className="flex flex-wrap gap-2">
                      {(["all", "yes", "no"] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setFilters((f) => ({ ...f, adhesive: opt }))}
                          aria-pressed={filters.adhesive === opt}
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
                )}

                {/* Einsatztemperatur max. (Schieberegler) */}
                {facets.showTemp && facets.tempMin != null && facets.tempMax != null && (
                  <FilterGroup title="Einsatztemperatur max.">
                    <input
                      type="range"
                      min={facets.tempMin}
                      max={facets.tempMax}
                      step={5}
                      value={filters.minTemp ?? facets.tempMin}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setFilters((f) => ({ ...f, minTemp: v <= facets.tempMin! ? null : v }));
                      }}
                      className="w-full accent-[#1e4a7a]"
                      aria-label="Mindestens erreichbare Einsatztemperatur"
                    />
                    <div className="mt-1 flex justify-between text-xs text-slate-500">
                      <span>≥ {filters.minTemp ?? facets.tempMin} °C</span>
                      <span>{facets.tempMax} °C</span>
                    </div>
                  </FilterGroup>
                )}

                {/* Material – nur die in dieser Kategorie vertretenen Werkstoffe */}
                {facets.materials.length > 1 && (
                  <FilterGroup title="Material">
                    {facets.materials.map((m) => (
                      <Check
                        key={m}
                        checked={filters.materials.has(m)}
                        onChange={() => toggleMaterial(m)}
                        label={m}
                      />
                    ))}
                  </FilterGroup>
                )}
                </div>
              </div>
            </aside>
          )}

          {/* Results */}
          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{filtered.length}</span> Artikel
              </p>
              {facets.any && (
                <button
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-expanded={mobileOpen}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                </button>
              )}
            </div>

            {filtered.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
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

function CategoryChip({
  href,
  label,
  active,
  count,
}: {
  href: string;
  label: string;
  active: boolean;
  count: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-[#1e4a7a] bg-[#1e4a7a] text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-[#1e4a7a]"
      }`}
    >
      {label}
      <span className={`text-xs ${active ? "text-white/90" : "text-slate-500"}`}>{count}</span>
    </Link>
  );
}
