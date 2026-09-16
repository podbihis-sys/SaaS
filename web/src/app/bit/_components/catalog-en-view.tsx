import { PRODUCTS, type CategoryId } from "../_data/catalog";
import { EN_CATEGORY_LABELS, EN_PRODUCTS } from "../_data/catalog-en";
import { Catalog } from "./catalog";

/**
 * Englische Produktübersicht – derselbe Katalog wie auf Deutsch (Suche,
 * Filter-Sidebar, Kategorie-Chips, Kartenraster), Produktnamen aus dem
 * englischen Original-Overlay (EN_PRODUCTS).
 */
export function CatalogEnView({ active }: { active: CategoryId | "alle" }) {
  // Nur die englischen Namen der angezeigten Produkte an den Client geben
  // (das komplette EN-Overlay bleibt serverseitig).
  const shown = active === "alle" ? PRODUCTS : PRODUCTS.filter((p) => p.category === active);
  const names: Record<string, string> = {};
  for (const p of shown) {
    const n = EN_PRODUCTS[p.slug]?.name;
    if (n) names[p.slug] = n;
  }
  return (
    <Catalog active={active} locale="en" names={names} categoryLabels={EN_CATEGORY_LABELS} />
  );
}
