import { CATEGORIES, CATEGORY_IMAGE, type CategoryId } from "../_data/catalog";

/**
 * Rendert echte Produktfotos von BIT (aus /public/bit/products/).
 * Wird `src` übergeben, zeigt die Komponente genau dieses Bild – andernfalls
 * ein repräsentatives Foto der jeweiligen Kategorie. Ersetzt die früheren
 * SVG-Platzhalter durch die Originalbilder der Herstellerseite.
 */
export function ProductIllustration({
  category,
  src,
  alt,
  className,
  fit = "contain",
}: {
  category: CategoryId;
  src?: string;
  alt?: string;
  className?: string;
  fit?: "contain" | "cover";
}) {
  const image = src ?? CATEGORY_IMAGE[category];
  const label = CATEGORIES.find((c) => c.id === category)?.name ?? "BIT";
  const altText = alt ?? `${label} – BIT`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt={altText}
      loading="lazy"
      decoding="async"
      className={`${fit === "cover" ? "object-cover" : "bg-white object-contain"} ${className ?? ""}`}
    />
  );
}
