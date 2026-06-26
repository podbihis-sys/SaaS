import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { services, getService, serviceNav } from "@/lib/services";
import { JsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `/leistungen/${service.slug}` },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Startseite", path: "/" },
          { name: "Leistungen", path: "/leistungen" },
          { name: serviceNav[service.slug], path: `/leistungen/${service.slug}` },
        ])}
      />
      <PageHeader
        title={service.title}
        subtitle={service.subtitle}
        crumbs={[
          { name: "Startseite", path: "/" },
          { name: "Leistungen", path: "/leistungen" },
          { name: serviceNav[service.slug], path: `/leistungen/${service.slug}` },
        ]}
      />

      <article className="container-content grid gap-12 py-16 lg:grid-cols-[1fr_320px]">
        <div className="prose-natur max-w-none">
          <p>{service.intro}</p>
          {service.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body && <p>{section.body}</p>}
              {section.list && (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-organic bg-moss-50 p-7">
            <h2 className="text-xl">Interesse geweckt?</h2>
            <p className="mt-3 text-anthracite-600">
              Wir beraten Sie gerne persönlich und unverbindlich zu Ihrem Projekt
              in der Region Bad Münstereifel, Mechernich und Euskirchen.
            </p>
            <Link href="/kontakt" className="btn-primary mt-5 w-full">
              Jetzt Beratung anfragen
            </Link>
          </div>

          <div className="mt-6 rounded-organic border border-moss-100 bg-white p-7">
            <h2 className="text-base font-semibold text-anthracite-800">
              Weitere Leistungen
            </h2>
            <ul className="mt-3 space-y-2">
              {services
                .filter((s) => s.slug !== service.slug)
                .map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/leistungen/${s.slug}`}
                      className="text-anthracite-600 hover:text-moss-700"
                    >
                      {serviceNav[s.slug]}
                    </Link>
                  </li>
                ))}
              <li>
                <Link href="/pools" className="text-anthracite-600 hover:text-moss-700">
                  Natürliche Pools
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </article>
    </>
  );
}
