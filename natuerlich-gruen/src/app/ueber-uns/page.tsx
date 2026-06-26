import Link from "next/link";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { site } from "@/lib/site";
import { JsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Über uns – natürlich grün mit Benedikt Brockmann",
  description:
    "Lernen Sie natürlich grün kennen: Gärtnermeister Benedikt Brockmann gestaltet mit seinem Team naturnahe Gärten in und um Bad Münstereifel – ökologisch, familiär und regional verwurzelt.",
  alternates: { canonical: "/ueber-uns" },
};

const values = [
  {
    title: "Biologisch & geprüft",
    text: "Als Bioland-zertifizierter Betrieb arbeiten wir nach hohen ökologischen Standards – ohne Gentechnik, ohne chemische Pflanzenschutzmittel.",
  },
  {
    title: "Familiär & nahbar",
    text: "Wir sind ein familiengeführter Betrieb. Persönliche Beratung und ehrliche Zusammenarbeit auf Augenhöhe sind für uns selbstverständlich.",
  },
  {
    title: "Regional verwurzelt",
    text: "Unsere Heimat ist die Eifel. Wir kennen die Böden, das Klima und die Pflanzen der Region – und arbeiten mit Materialien von hier.",
  },
];

const jobs = [
  "Fachkräfte & Gartenhelfer (m/w/d)",
  "Ausbildung: Gärtner/in im Garten- & Landschaftsbau",
  "Praktikum bei natürlich grün",
];

export default function UeberUnsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Startseite", path: "/" },
          { name: "Über uns", path: "/ueber-uns" },
        ])}
      />
      <PageHeader
        title="natürlich grün mit Benedikt Brockmann"
        subtitle="Wer wir sind und was uns ausmacht."
        crumbs={[
          { name: "Startseite", path: "/" },
          { name: "Über uns", path: "/ueber-uns" },
        ]}
      />

      <section className="container-content py-16">
        <div className="prose-natur mx-auto max-w-3xl">
          <p>
            Mein Name ist Benedikt Brockmann – Gärtnermeister, Familienvater und
            leidenschaftlicher Verfechter naturnaher Gartengestaltung.
          </p>
          <p>
            Mit meiner Firma natürlich grün – Garten- und Landschaftsbau e.K.
            gestalte ich mit meinem Team lebendige Gärten in und um Bad
            Münstereifel – ökologisch, zukunftsorientiert und mit echter
            Überzeugung. Seit {site.foundedYear} stehen wir für Gärten, die sich
            entwickeln dürfen und langfristig zum Standort, zu den Menschen und
            zur Natur passen.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-content">
          <h2 className="text-center text-3xl sm:text-4xl">
            Werte, für die wir stehen
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <article
                key={v.title}
                className="rounded-organic border border-moss-100 bg-sand p-7"
              >
                <h3 className="text-xl">{v.title}</h3>
                <p className="mt-3 text-anthracite-600">{v.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-content py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl sm:text-4xl">
              Unsere Zukunft: Natürlich besser bauen
            </h2>
            <p className="mt-4 text-lg text-anthracite-600">
              Wir glauben an Gärten, die mit dem Klima und dem Standort arbeiten
              – nicht gegen sie. Diesen Anspruch entwickeln wir Jahr für Jahr
              weiter: mit standortgerechten Pflanzen, lebendigen Böden und einer
              Pflege, die Strukturen erhält statt sie zu zerstören.
            </p>
          </div>
          <div className="rounded-organic bg-moss-50 p-8">
            <h2 className="text-2xl">
              Arbeiten bei natürlich grün
            </h2>
            <p className="mt-3 text-anthracite-600">
              Sie möchten Teil unseres Teams werden? Wir suchen Menschen, die
              naturnahes Arbeiten lieben:
            </p>
            <ul className="mt-4 space-y-2">
              {jobs.map((j) => (
                <li key={j} className="flex items-start gap-2 text-anthracite-700">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-moss-500" />
                  {j}
                </li>
              ))}
            </ul>
            <a href={`mailto:${site.email}`} className="btn-primary mt-6">
              Jetzt per Mail bewerben
            </a>
          </div>
        </div>
      </section>

      <section className="container-content pb-24">
        <div className="rounded-organic bg-anthracite-900 px-8 py-12 text-center text-white">
          <h2 className="text-2xl text-white sm:text-3xl">
            Lernen wir uns kennen.
          </h2>
          <Link href="/kontakt" className="btn-light mt-6">
            Kontakt aufnehmen
          </Link>
        </div>
      </section>
    </>
  );
}
