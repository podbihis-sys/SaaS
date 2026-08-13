import { notFound, permanentRedirect, redirect } from "next/navigation";
import {
  CATEGORIES,
  getCategory,
  getProduct,
  productHref,
  type CategoryId,
} from "../../_data/catalog";

/**
 * Zwischenebene von /bit/produkte/<segment>:
 *
 * - Ist das Segment eine Kategorie, führt der Weg zur Kategorieseite /bit/<id>.
 * - Ist es ein Produkt-Slug, handelt es sich um eine alte URL aus der Zeit vor
 *   dem Kategorie-Segment. Sie wird dauerhaft (301) auf die neue Adresse
 *   /bit/produkte/<kategorie>/<slug> umgeleitet, damit Links und Suchmaschinen
 *   nicht ins Leere laufen.
 */
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ kategorie: c.id }));
}

export default async function ProduktSegment({
  params,
}: {
  params: Promise<{ kategorie: string }>;
}) {
  const { kategorie } = await params;

  if (getCategory(kategorie as CategoryId)) redirect(`/bit/${kategorie}`);

  const product = getProduct(kategorie);
  if (product) permanentRedirect(productHref(product));

  notFound();
}
