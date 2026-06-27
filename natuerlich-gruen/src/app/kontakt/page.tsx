import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import { site } from "@/lib/site";
import { photos } from "@/lib/photos";
import { JsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Kontakt – natürlich grün in Bad Münstereifel",
  description:
    "Kontaktieren Sie natürlich grün – Garten- und Landschaftsbau e.K. in Bad Münstereifel. Wir beraten Sie gerne zu naturnaher Gartengestaltung, Pflege und Naturpools.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Startseite", path: "/" },
          { name: "Kontakt", path: "/kontakt" },
        ])}
      />
      <PageHeader
        title="Kontakt aufnehmen"
        subtitle="Erzählen Sie uns von Ihrem Garten – wir melden uns persönlich bei Ihnen zurück."
        crumbs={[
          { name: "Startseite", path: "/" },
          { name: "Kontakt", path: "/kontakt" },
        ]}
      />

      <section className="container-content py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <div className="rounded-organic border border-moss-100 bg-white p-7 sm:p-10">
            <h2 className="text-2xl">Schreiben Sie uns</h2>
            <p className="mt-2 text-anthracite-600">
              Felder mit <span className="text-moss-600">*</span> sind
              Pflichtfelder.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-organic">
              <Image
                src={photos.kontakt}
                alt="natürlich grün – Garten- und Landschaftsbau in der Eifel"
                fill
                sizes="(max-width: 1024px) 100vw, 360px"
                className="object-cover"
              />
            </div>
            <div className="rounded-organic bg-moss-50 p-7">
              <h2 className="text-xl">Direkt erreichen</h2>
              <dl className="mt-4 space-y-4 text-anthracite-700">
                <div>
                  <dt className="text-sm font-semibold text-anthracite-500">
                    E-Mail
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${site.email}`}
                      className="font-medium text-moss-700 hover:text-moss-800"
                    >
                      {site.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-anthracite-500">
                    Standort
                  </dt>
                  <dd>{site.city} (Eifel)</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-anthracite-500">
                    Einzugsgebiet
                  </dt>
                  <dd>{site.areaServed.join(", ")} und Umgebung</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-organic border border-moss-100 bg-white p-7">
              <h2 className="text-xl">Folgen Sie uns</h2>
              <div className="mt-4 flex flex-col gap-2">
                <a
                  href={site.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-moss-700 hover:text-moss-800"
                >
                  Facebook →
                </a>
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-moss-700 hover:text-moss-800"
                >
                  Instagram →
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
