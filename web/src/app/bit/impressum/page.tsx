import type { Metadata } from "next";
import { COMPANY } from "../_data/catalog";

export const metadata: Metadata = {
  alternates: { canonical: "/bit/impressum" },
  title: "Impressum",
  description: `Impressum der ${COMPANY.legalName}, ${COMPANY.street}, ${COMPANY.zip} ${COMPANY.city}.`,
  robots: { index: true, follow: true },
};

export default function ImpressumPage() {
  return (
    <>
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="bit-page-hero container py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">Rechtliches</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">Impressum</h1>
          <p className="mt-3 max-w-2xl text-slate-300">Angaben gemäß § 5 TMG / § 18 MStV.</p>
        </div>
      </section>

      <section className="container py-14">
        <div className="prose-slate max-w-3xl space-y-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Anbieter</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              {COMPANY.legalName}
              <br />
              {COMPANY.street}
              <br />
              {COMPANY.zip} {COMPANY.city}
              <br />
              {COMPANY.country}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Kontakt</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Telefon: <a className="text-[#1e4a7a] hover:underline" href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}>{COMPANY.phone}</a>
              <br />
              Telefax: {COMPANY.fax}
              <br />
              E-Mail: <a className="text-[#1e4a7a] hover:underline" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Vertretungsberechtigter Geschäftsführer</h2>
            <p className="mt-3 leading-relaxed text-slate-700">{COMPANY.managingDirector}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Registereintrag</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              {COMPANY.register}
              <br />
              Sitz der Gesellschaft: {COMPANY.city}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Umsatzsteuer-Identifikationsnummer</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              USt-IdNr. gemäß § 27a Umsatzsteuergesetz: {COMPANY.vatId}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Verantwortlich für den Inhalt</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              {COMPANY.managingDirector}, Anschrift wie oben.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Haftung für Inhalte und Links</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
              Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
              keinen Einfluss haben; für diese Inhalte ist stets der jeweilige Anbieter oder
              Betreiber der Seiten verantwortlich. Zum Zeitpunkt der Verlinkung waren keine
              rechtswidrigen Inhalte erkennbar.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Urheberrecht</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
              unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
              Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts
              bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
