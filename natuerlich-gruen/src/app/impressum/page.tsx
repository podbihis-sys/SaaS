import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung von natürlich grün – Garten- und Landschaftsbau e.K.",
  alternates: { canonical: "/impressum" },
  robots: { index: false, follow: true },
};

export default function ImpressumPage() {
  return (
    <>
      <PageHeader
        title="Impressum"
        crumbs={[
          { name: "Startseite", path: "/" },
          { name: "Impressum", path: "/impressum" },
        ]}
      />
      <section className="container-content py-16">
        <div className="prose-natur mx-auto max-w-3xl">
          <p className="rounded-xl border border-dashed border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Hinweis zur Inhaltspflege: Bitte die nachstehenden Angaben
            (vollständige Anschrift, Registergericht/-nummer,
            USt-IdNr., ggf. Telefonnummer) vor dem Livegang prüfen und
            vervollständigen.
          </p>

          <h2>Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)</h2>
          <p>
            {site.legalName}
            <br />
            Inhaber: {site.owner}
            <br />
            {site.city}, Eifel
          </p>

          <h2>Kontakt</h2>
          <p>
            E-Mail:{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>

          <h2>Umsatzsteuer-ID</h2>
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a
            Umsatzsteuergesetz: <em>[bitte ergänzen]</em>
          </p>

          <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
          <p>
            {site.owner}
            <br />
            {site.legalName}, {site.city}
          </p>

          <h2>EU-Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            . Unsere E-Mail-Adresse finden Sie oben im Impressum.
          </p>

          <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
          <p>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
            vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>

          <h2>Haftung für Inhalte</h2>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte
            auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
            §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht
            verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
            überwachen oder nach Umständen zu forschen, die auf eine
            rechtswidrige Tätigkeit hinweisen.
          </p>

          <h2>Bildnachweise</h2>
          <p>
            Sofern nicht anders angegeben, liegen die Bildrechte bei{" "}
            {site.legalName}.
          </p>
        </div>
      </section>
    </>
  );
}
