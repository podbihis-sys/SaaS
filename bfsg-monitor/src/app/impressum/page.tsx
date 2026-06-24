import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impressum" };

// Template — fill in the operator's real details before launch (Anbieterkennzeichnung nach § 5 DDG).
export default function ImpressumPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-16 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold">Impressum</h1>

      <section className="space-y-1">
        <h2 className="font-semibold">Angaben gemäß § 5 DDG</h2>
        <p>[Firmenname]</p>
        <p>[Straße und Hausnummer]</p>
        <p>[PLZ Ort]</p>
      </section>

      <section className="space-y-1">
        <h2 className="font-semibold">Vertreten durch</h2>
        <p>[Name der vertretungsberechtigten Person]</p>
      </section>

      <section className="space-y-1">
        <h2 className="font-semibold">Kontakt</h2>
        <p>Telefon: [Telefonnummer]</p>
        <p>E-Mail: [E-Mail-Adresse]</p>
      </section>

      <section className="space-y-1">
        <h2 className="font-semibold">Umsatzsteuer-ID</h2>
        <p>[USt-IdNr. gemäß § 27a UStG, falls vorhanden]</p>
      </section>

      <p className="text-xs text-muted-foreground">
        Hinweis: Diese Seite ist eine Vorlage und muss vor Veröffentlichung mit
        den tatsächlichen Angaben vervollständigt und rechtlich geprüft werden.
      </p>
    </main>
  );
}
