import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { site } from "@/lib/site";
import { JsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Bioland & Nachhaltigkeit – zertifizierter Gartenbau",
  description:
    "Warum ein Bioland-Garten? natürlich grün ist Bioland-zertifiziert: keine Gentechnik, keine Chemie, 100 % Biodiversitätsleistung und ein schonender Umgang mit Wasser, Energie und Boden.",
  alternates: { canonical: "/bioland" },
};

const principles = [
  "Keine Gentechnik. Keine Chemie. Keine Kompromisse.",
  "100 % Biodiversitätsleistung durch Bioland-Maßnahmenkatalog",
  "Schonender Umgang mit Ressourcen: Wasser, Energie, Boden",
  "Ein stabiles Ökosystem im eigenen Garten",
];

const offerings = [
  {
    title: "Kräutergärten & Heilpflanzenbeete",
    text: "Aromatische, nützliche Pflanzungen, die Küche, Gesundheit und Insektenwelt gleichermaßen bereichern.",
  },
  {
    title: "Zierpflanzen, Stauden & Gehölze",
    text: "Standortgerechte, robuste Pflanzen für lebendige Beete, die sich über Jahre stabil entwickeln.",
  },
  {
    title: "Naturgarten-Elemente und Module",
    text: "Totholzhecken, Trockenmauern, Wildblumenflächen und Wasserstellen als wertvolle Lebensräume.",
  },
];

export default function BiolandPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Startseite", path: "/" },
          { name: "Bioland", path: "/bioland" },
        ])}
      />
      <PageHeader
        title="Warum ein Bioland-Garten?"
        subtitle="Authentisch, ästhetisch, mit Liebe zum Detail – und konsequent ökologisch."
        crumbs={[
          { name: "Startseite", path: "/" },
          { name: "Bioland", path: "/bioland" },
        ]}
      />

      <section className="container-content py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[auto_1fr]">
          <Image
            src={site.assets.biolandSeal}
            alt="Bioland-Siegel – zertifizierter Gartenbaubetrieb"
            width={260}
            height={98}
            className="h-24 w-auto"
          />
          <div>
            <h2 className="text-3xl sm:text-4xl">Unsere Werte: Natürlich Bioland</h2>
            <p className="mt-4 text-lg text-anthracite-600">
              Als Bioland-zertifizierter Betrieb arbeiten wir nach einem der
              strengsten ökologischen Standards Deutschlands. Das bedeutet für
              Ihren Garten ein stabiles Ökosystem – und für uns einen ehrlichen
              Anspruch an nachhaltiges Arbeiten.
            </p>
          </div>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {principles.map((p) => (
            <li
              key={p}
              className="flex items-start gap-3 rounded-2xl border border-moss-100 bg-white p-6 font-medium text-anthracite-800"
            >
              <svg className="mt-0.5 h-6 w-6 shrink-0 text-moss-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {p}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white py-16">
        <div className="container-content">
          <h2 className="text-center text-3xl sm:text-4xl">
            Unsere Leistungen im Überblick
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {offerings.map((o) => (
              <article
                key={o.title}
                className="rounded-organic border border-moss-100 bg-sand p-7"
              >
                <h3 className="text-xl">{o.title}</h3>
                <p className="mt-3 text-anthracite-600">{o.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-content py-16">
        <div className="rounded-organic bg-moss-600 px-8 py-14 text-center text-white">
          <h2 className="text-3xl text-white sm:text-4xl">
            Ihr naturnaher Garten – ökologisch geplant &amp; liebevoll gepflegt
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-moss-50">
            Jetzt beraten lassen und naturnah gestalten.
          </p>
          <Link href="/kontakt" className="btn-light mt-8">
            Erstgespräch buchen
          </Link>
        </div>
      </section>
    </>
  );
}
