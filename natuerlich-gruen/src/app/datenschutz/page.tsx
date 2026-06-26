import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung von natürlich grün – Garten- und Landschaftsbau e.K. Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO.",
  alternates: { canonical: "/datenschutz" },
  robots: { index: false, follow: true },
};

export default function DatenschutzPage() {
  return (
    <>
      <PageHeader
        title="Datenschutzerklärung"
        crumbs={[
          { name: "Startseite", path: "/" },
          { name: "Datenschutz", path: "/datenschutz" },
        ]}
      />
      <section className="container-content py-16">
        <div className="prose-natur mx-auto max-w-3xl">
          <p className="rounded-xl border border-dashed border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Hinweis zur Inhaltspflege: Diese Datenschutzerklärung bildet die
            tatsächliche Technik dieser Website ab (keine Tracker, serverseitiges
            Kontaktformular). Bitte vor dem Livegang juristisch prüfen und ggf.
            an tatsächlich eingesetzte Dienste (z. B. Hosting, E-Mail-Versand)
            anpassen.
          </p>

          <h2>1. Verantwortlicher</h2>
          <p>
            {site.legalName}, Inhaber {site.owner}, {site.city}.
            <br />
            E-Mail: <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>

          <h2>2. Grundsätzliches</h2>
          <p>
            Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Wir
            verarbeiten Ihre Daten ausschließlich auf Grundlage der gesetzlichen
            Bestimmungen (DSGVO, BDSG). Diese Website verwendet von Haus aus nur
            technisch notwendige Cookies und bindet keine Tracking- oder
            Marketing-Dienste ein.
          </p>

          <h2>3. Hosting</h2>
          <p>
            Diese Website wird bei einem Dienstleister gehostet. Beim Aufruf
            werden technisch notwendige Server-Logdaten (z. B. IP-Adresse,
            Datum/Uhrzeit, aufgerufene Seite, Browsertyp) verarbeitet, um den
            sicheren und stabilen Betrieb zu gewährleisten. Rechtsgrundlage ist
            unser berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO).
            <em> [Hosting-Anbieter und ggf. Auftragsverarbeitungsvertrag ergänzen.]</em>
          </p>

          <h2>4. Kontaktformular &amp; E-Mail-Kontakt</h2>
          <p>
            Wenn Sie uns über das Kontaktformular oder per E-Mail Anfragen
            zukommen lassen, werden Ihre Angaben (Name, E-Mail-Adresse, ggf.
            Telefonnummer und Ihre Nachricht) zur Bearbeitung der Anfrage
            verarbeitet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
            (vorvertragliche Maßnahmen) bzw. lit. f DSGVO (berechtigtes Interesse
            an der Beantwortung). Zum Schutz vor Spam verwenden wir ein
            Honeypot-Verfahren, eine Begrenzung der Anfragehäufigkeit und
            optional einen datensparsamen Spam-Schutz. Die Daten werden gelöscht,
            sobald sie für die Zweckerreichung nicht mehr erforderlich sind.
          </p>

          <h2>5. Cookies</h2>
          <p>
            Wir setzen ausschließlich technisch notwendige Cookies bzw. lokalen
            Speicher (z. B. zur Speicherung Ihrer Cookie-Entscheidung) ein. Eine
            Einwilligung ist hierfür nicht erforderlich (§ 25 Abs. 2 TDDDG).
          </p>

          <h2>6. Externe Verlinkungen &amp; Social Media</h2>
          <p>
            Unsere Seite enthält Verweise zu unseren Profilen bei Facebook und
            Instagram. Diese werden erst durch Anklicken aktiv; es findet keine
            automatische Datenübertragung an die Plattformen beim Seitenaufruf
            statt.
          </p>

          <h2>7. Ihre Rechte</h2>
          <p>
            Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung
            (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung
            (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch
            (Art. 21). Zudem haben Sie das Recht, sich bei einer
            Datenschutz-Aufsichtsbehörde zu beschweren.
          </p>

          <h2>8. Aktualität</h2>
          <p>
            Diese Datenschutzerklärung wird bei Bedarf an geänderte Rechtslagen
            oder Funktionen angepasst.
          </p>
        </div>
      </section>
    </>
  );
}
