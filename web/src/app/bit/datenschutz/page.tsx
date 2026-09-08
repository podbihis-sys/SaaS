import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "../_data/catalog";

export const metadata: Metadata = {
  alternates: { canonical: "/bit/datenschutz" },
  title: "Datenschutz",
  description: `Datenschutzerklärung der ${COMPANY.legalName}: Verantwortlicher, Betroffenenrechte, Verarbeitung beim Besuch der Website, Anfragen über den Warenkorb und externe Medien.`,
};

const RIGHTS = [
  "gemäß Art. 15 DSGVO Auskunft über Ihre von uns verarbeiteten personenbezogenen Daten zu verlangen;",
  "gemäß Art. 16 DSGVO unverzüglich die Berichtigung unrichtiger oder Vervollständigung Ihrer bei uns gespeicherten personenbezogenen Daten zu verlangen;",
  "gemäß Art. 17 DSGVO die Löschung Ihrer bei uns gespeicherten personenbezogenen Daten zu verlangen, soweit nicht die weitere Verarbeitung erforderlich ist;",
  "gemäß Art. 18 DSGVO die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen;",
  "gemäß Art. 20 DSGVO Ihre personenbezogenen Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten oder die Übermittlung an einen anderen Verantwortlichen zu verlangen;",
  "gemäß Art. 7 Abs. 3 DSGVO Ihre einmal erteilte Einwilligung jederzeit zu widerrufen;",
  "gemäß Art. 77 DSGVO sich bei einer Aufsichtsbehörde zu beschweren.",
];

export default function DatenschutzPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">Rechtliches</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Datenschutzerklärung
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Wir informieren Sie nachfolgend über die Verarbeitung personenbezogener Daten beim
            Besuch dieser Website.
          </p>
        </div>
      </section>

      <section className="container py-14">
        <div className="max-w-3xl space-y-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              1. Name und Kontaktdaten des für die Verarbeitung Verantwortlichen
            </h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              {COMPANY.legalName} (im Folgenden: BIT)
              <br />
              {COMPANY.street}
              <br />
              {COMPANY.zip} {COMPANY.city}
              <br />
              Telefon: {COMPANY.phone}
              <br />
              E-Mail:{" "}
              <a className="text-[#1e4a7a] hover:underline" href={`mailto:${COMPANY.email}`}>
                {COMPANY.email}
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">2. Betroffenenrechte</h2>
            <p className="mt-3 leading-relaxed text-slate-700">Sie haben das Recht:</p>
            <ul className="mt-3 space-y-2">
              {RIGHTS.map((r) => (
                <li key={r} className="flex gap-3 leading-relaxed text-slate-700">
                  <span
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#38bdf8]"
                    aria-hidden="true"
                  />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">3. Widerspruchsrecht</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Sie haben das Recht, gemäß Art. 21 DSGVO Widerspruch gegen die Verarbeitung Ihrer
              personenbezogenen Daten einzulegen, soweit diese auf Grundlage berechtigter
              Interessen erfolgt. Richten Sie Ihren Widerspruch bitte an die oben genannten
              Kontaktdaten.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">4. Besuch dieser Website</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Beim Aufruf der Website werden durch den Hostinganbieter automatisch Informationen
              verarbeitet, die Ihr Browser übermittelt (insbesondere IP-Adresse, Datum und Uhrzeit
              des Zugriffs, aufgerufene Seite, übertragene Datenmenge, Browsertyp und
              Betriebssystem). Diese Verarbeitung ist zur Auslieferung der Website technisch
              erforderlich; Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Eine Zusammenführung
              dieser Daten mit anderen Datenquellen findet nicht statt.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              5. Speicherung auf Ihrem Endgerät (Cookies und lokale Speicherung)
            </h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Diese Website nutzt keine Analyse-, Tracking- oder Werbedienste. Gespeichert werden
              ausschließlich technisch erforderliche Informationen im lokalen Speicher Ihres
              Browsers:
            </p>
            <ul className="mt-3 space-y-2">
              <li className="flex gap-3 leading-relaxed text-slate-700">
                <span
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#38bdf8]"
                  aria-hidden="true"
                />
                <span>
                  <strong>Warenkorb</strong> – merkt sich die von Ihnen zusammengestellten Artikel,
                  damit Ihre Anfrage beim Seitenwechsel erhalten bleibt.
                </span>
              </li>
              <li className="flex gap-3 leading-relaxed text-slate-700">
                <span
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#38bdf8]"
                  aria-hidden="true"
                />
                <span>
                  <strong>Datenschutzeinstellungen</strong> – speichert Ihre Auswahl aus dem
                  Cookie-Hinweis, damit dieser nicht bei jedem Besuch erneut erscheint.
                </span>
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-slate-700">
              Diese Speicherung ist für den Betrieb der Website unbedingt erforderlich (§ 25 Abs. 2
              Nr. 2 TDDDG) und erfolgt daher ohne Einwilligung. Sie verbleibt ausschließlich auf
              Ihrem Endgerät und wird nicht an uns übertragen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              6. Externe Medien (Kartendarstellung)
            </h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Auf der Kontaktseite binden wir eine Karte der OpenStreetMap Foundation ein. Die
              Karte wird <strong>erst nach Ihrer ausdrücklichen Einwilligung</strong> geladen (§ 25
              Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a DSGVO). Bis dahin sehen Sie lediglich einen
              Platzhalter, und es werden keinerlei Daten an den Anbieter übertragen. Nach dem Laden
              wird Ihre IP-Adresse an die OpenStreetMap Foundation übermittelt. Ihre Einwilligung
              können Sie jederzeit über die{" "}
              <span className="font-medium">Datenschutzeinstellungen</span> im Seitenfuß widerrufen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              7. Anfragen über Warenkorb und E-Mail
            </h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Wenn Sie uns eine Anfrage über den Warenkorb oder per E-Mail senden, verarbeiten wir
              die von Ihnen angegebenen Daten (Firma, Name, E-Mail-Adresse, Telefonnummer,
              Nachricht sowie die angefragten Artikel), um Ihre Anfrage zu bearbeiten und Ihnen ein
              Angebot zu unterbreiten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
              (vorvertragliche Maßnahmen) bzw. Art. 6 Abs. 1 lit. f DSGVO. Die Daten werden
              gelöscht, sobald sie für die Zweckerreichung nicht mehr erforderlich sind und keine
              gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              8. Weitergabe von Daten und Drittländer
            </h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Eine Übermittlung Ihrer Daten an Dritte erfolgt nur, soweit dies zur Vertrags- oder
              Anfragebearbeitung erforderlich ist, Sie eingewilligt haben oder eine gesetzliche
              Verpflichtung besteht. Dienstleister, die in unserem Auftrag Daten verarbeiten
              (insbesondere Hosting), sind vertraglich nach Art. 28 DSGVO gebunden. Eine
              Übermittlung in Drittländer findet nur auf Grundlage geeigneter Garantien statt.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">9. Datensicherheit</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Wir setzen bei einem Besuch dieser Website das verbreitete TLS-Verfahren in
              Verbindung mit der jeweils höchsten Verschlüsselungsstufe ein, die Ihr Browser
              unterstützt. Zusätzlich treffen wir geeignete technische und organisatorische
              Maßnahmen, um Ihre Daten gegen Verlust, Zerstörung, Manipulation und unberechtigten
              Zugriff zu schützen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">10. Beschwerderecht</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Sie haben unbeschadet anderweitiger Rechtsbehelfe das Recht, sich bei einer
              Aufsichtsbehörde zu beschweren (Art. 77 DSGVO). Zuständig ist die Landesbeauftragte
              für Datenschutz und Informationsfreiheit Nordrhein-Westfalen, Postfach 20 04 44,
              40102 Düsseldorf.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">11. Aktualität</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Durch die Weiterentwicklung unserer Website oder geänderte gesetzliche Vorgaben kann
              es notwendig werden, diese Datenschutzerklärung anzupassen. Es gilt jeweils die hier
              abrufbare Fassung.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-8">
            <Link
              href="/bit/impressum"
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Impressum
            </Link>
            <Link
              href="/bit/barrierefreiheit"
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Barrierefreiheit
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
