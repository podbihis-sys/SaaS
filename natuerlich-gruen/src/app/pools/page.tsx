import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { photos } from "@/lib/photos";
import { JsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Naturpools & Schwimmteiche in Bad Münstereifel",
  description:
    "Naturpools und Schwimmteiche in Bad Münstereifel, Mechernich, Nettersheim & Euskirchen – ohne Chlor, mit biologischer Filtertechnik. Natürlich baden im eigenen Garten.",
  alternates: { canonical: "/pools" },
};

const variants = [
  {
    title: "Schwimmteich",
    points: [
      "Naturnahe Optik",
      "bepflanzte Regenerationszonen",
      "Reinigung über Pflanzen & Filterkies",
      "natürliche Wasserqualität",
      "geringer Pflegeaufwand",
      "mind. 50 m² erforderlich",
    ],
  },
  {
    title: "Naturpool",
    points: [
      "modern mit klaren Linien",
      "biologische Filtertechnik",
      "klare und kontrollierte Wasserqualität",
      "gleichbleibend",
      "kompakter",
      "auch für kleine Gärten",
    ],
  },
];

const servicesList = [
  { title: "Beratung & Vorplanung", text: "Wir klären gemeinsam Standort, Größe, Variante und Budget." },
  { title: "Bau von Schwimmteichen", text: "Naturnahe Anlagen mit Regenerationszonen und Pflanzenfilter." },
  { title: "Bau von Naturpools", text: "Klare Linien und biologische Filtertechnik – auch für kleine Gärten." },
  { title: "Regeneration & Nachrüstung", text: "Bestehende Anlagen modernisieren und ökologisch optimieren." },
  { title: "Pflege & Wartung", text: "Damit Ihr Wasser dauerhaft gesund und klar bleibt." },
];

export default function PoolsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Startseite", path: "/" },
          { name: "Natürliche Pools", path: "/pools" },
        ])}
      />
      <PageHeader
        title="Naturpools & Schwimmteiche in Bad Münstereifel"
        subtitle="Natürlich baden im eigenen Garten – ein Erlebnis von Wasser im Einklang mit nachhaltiger Gartengestaltung."
        crumbs={[
          { name: "Startseite", path: "/" },
          { name: "Natürliche Pools", path: "/pools" },
        ]}
      />

      <section className="container-content py-16">
        <div className="relative mb-12 aspect-[16/7] overflow-hidden rounded-organic">
          <Image
            src={photos.poolsPage[0].src}
            alt={photos.poolsPage[0].alt}
            fill
            priority
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover"
          />
        </div>
        <div className="prose-natur mx-auto max-w-3xl">
          <p>
            Ein Schwimmteich oder Naturpool vereint das Erlebnis von Wasser mit
            nachhaltiger Gartengestaltung. Unser Anspruch: Egal ob naturnah oder
            technisch – beide Varianten kommen ohne Chlor aus und fördern ein
            gesundes Badeerlebnis für Mensch und Umwelt.
          </p>
          <p>
            Wir realisieren Naturpools und Schwimmteiche in Bad Münstereifel,
            Mechernich, Nettersheim, Euskirchen und Umgebung – mit individuellem
            Anspruch, hochwertigen Materialien und einem Verständnis für
            nachhaltige Systeme.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-content">
          <h2 className="text-center text-3xl sm:text-4xl">
            Naturpool oder Schwimmteich? – Gemeinsamkeiten &amp; Unterschiede
          </h2>
          <Reveal className="mt-10 grid gap-6 md:grid-cols-2">
            {variants.map((v) => (
              <article
                key={v.title}
                className="card-hover rounded-organic border border-moss-100 bg-sand p-7"
              >
                <h3 className="text-2xl">{v.title}</h3>
                <ul className="mt-4 space-y-2">
                  {v.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-anthracite-700">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-moss-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="container-content py-16">
        <h2 className="text-3xl sm:text-4xl">
          Unsere Leistungen rund um Schwimmteiche &amp; Naturpools
        </h2>
        <Reveal className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicesList.map((s) => (
            <article
              key={s.title}
              className="card-hover rounded-organic border border-moss-100 bg-white p-7"
            >
              <h3 className="text-xl">{s.title}</h3>
              <p className="mt-3 text-anthracite-600">{s.text}</p>
            </article>
          ))}
        </Reveal>
      </section>

      <section className="container-content pb-24">
        <div className="rounded-organic bg-anthracite-900 px-8 py-14 text-center text-white">
          <h2 className="text-3xl text-white sm:text-4xl">
            Regional, ökologisch &amp; zuverlässig – Pool- &amp; Teichbau in der
            Eifel
          </h2>
          <Link href="/kontakt" className="btn-light mt-8">
            Erstgespräch buchen
          </Link>
        </div>
      </section>
    </>
  );
}
