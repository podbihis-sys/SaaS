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
  // Englischer Suchtext je Produkt (Beschreibung + technische Daten), damit
  // die Suche englische Begriffe findet und nicht in den deutschen Daten sucht.
  const enText: Record<string, string> = {};
  for (const p of shown) {
    const en = EN_PRODUCTS[p.slug];
    if (!en) continue;
    if (en.name) names[p.slug] = en.name;
    enText[p.slug] = [
      en.description.slice(0, 400),
      ...en.tech.map((t) => `${t.label} ${t.value}`),
    ].join(" ");
  }
  return (
    <Catalog
      active={active}
      locale="en"
      names={names}
      categoryLabels={EN_CATEGORY_LABELS}
      enText={enText}
    />
  );
}
