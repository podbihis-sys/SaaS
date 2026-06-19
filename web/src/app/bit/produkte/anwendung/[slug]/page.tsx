import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  applicationTaxa,
  categoriesForProducts,
  getApplicationTaxon,
} from "../../../_data/attributes";
import { TaxonLanding } from "../../../_components/taxon-landing";

const BASE_PATH = "/bit/produkte/anwendung";

export function generateStaticParams() {
  return applicationTaxa().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const taxon = getApplicationTaxon(slug);
  if (!taxon) return { title: "Anwendung nicht gefunden" };
  const title = `${taxon.label} – passende Schläuche`;
  return {
    title,
    description: taxon.intro,
    alternates: { canonical: `${BASE_PATH}/${taxon.slug}` },
    openGraph: {
      type: "website",
      title: `${title} · BIT Bierther GmbH`,
      description: taxon.intro,
      url: `${BASE_PATH}/${taxon.slug}`,
    },
  };
}

export default async function ApplicationLanding({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const taxon = getApplicationTaxon(slug);
  if (!taxon) notFound();

  const related = applicationTaxa()
    .filter((t) => t.slug !== taxon.slug)
    .map((t) => ({ slug: t.slug, label: t.label }));

  const refine = [
    { label: "Alle", href: `${BASE_PATH}/${taxon.slug}`, count: taxon.products.length, active: true },
    ...categoriesForProducts(taxon.products).map((c) => ({
      label: c.name,
      href: `${BASE_PATH}/${taxon.slug}/${c.id}`,
      count: c.count,
      active: false,
    })),
  ];

  return (
    <TaxonLanding
      kind="Anwendung"
      label={taxon.label}
      heading={`${taxon.label} – passende Schläuche`}
      intro={taxon.intro}
      products={taxon.products}
      basePath={BASE_PATH}
      baseLabel="Anwendungen"
      related={related}
      refine={refine.length > 2 ? refine : undefined}
    />
  );
}
