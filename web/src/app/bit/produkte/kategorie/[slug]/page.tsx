import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  categoryTaxa,
  getCategoryTaxon,
} from "../../../_data/attributes";
import { TaxonLanding } from "../../../_components/taxon-landing";
import { clampDesc, clampText } from "../../../_lib/seo";

const BASE_PATH = "/bit/produkte/kategorie";

export function generateStaticParams() {
  return categoryTaxa().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const taxon = getCategoryTaxon(slug);
  if (!taxon) return { title: "Kategorie nicht gefunden" };
  // Title bewusst ≠ H1 (H1 = reines Label), gegen „Duplicate h1/title".
  const title = `${taxon.label} – Auswahl, Material & Größen`;
  return {
    title: clampText(title, 60),
    description: clampDesc(taxon.intro),
    robots: { index: true, follow: true },
    alternates: { canonical: `${BASE_PATH}/${taxon.slug}` },
    openGraph: {
      type: "website",
      title: `${taxon.label} · BIT Bierther GmbH`,
      description: clampDesc(taxon.intro),
      url: `${BASE_PATH}/${taxon.slug}`,
    },
  };
}

export default async function CategoryLanding({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const taxon = getCategoryTaxon(slug);
  if (!taxon) notFound();

  const related = categoryTaxa()
    .filter((t) => t.slug !== taxon.slug)
    .map((t) => ({ slug: t.slug, label: t.label }));

  return (
    <TaxonLanding
      kind="Kategorie"
      label={taxon.label}
      heading={taxon.label}
      intro={taxon.intro}
      products={taxon.products}
      basePath={BASE_PATH}
      baseLabel="Kategorien"
      related={related}
    />
  );
}
