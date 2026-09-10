import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, type CategoryId } from "../../../_data/catalog";
import { EN_CATEGORY_LABELS } from "../../../_data/catalog-en";
import { CatalogEnView } from "../../../_components/catalog-en-view";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ kategorie: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kategorie: string }>;
}): Promise<Metadata> {
  const { kategorie } = await params;
  const label = EN_CATEGORY_LABELS[kategorie];
  if (!label) return {};
  return {
    alternates: { canonical: `/bit/en/products/${kategorie}` },
    title: label,
    description: `${label} from BIT – standard articles and custom solutions, usually delivered within 24 hours.`,
  };
}

export default async function EnCategoryPage({
  params,
}: {
  params: Promise<{ kategorie: string }>;
}) {
  const { kategorie } = await params;
  if (!CATEGORIES.some((c) => c.id === kategorie)) notFound();
  return <CatalogEnView active={kategorie as CategoryId} />;
}
