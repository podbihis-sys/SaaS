import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impressum", robots: { index: false } };

export default function ImpressumPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 prose-sm">
      <h1 className="text-2xl font-bold">Impressum</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Angaben gemäß § 5 TMG. <strong>Platzhalter — bitte vor Livegang ausfüllen.</strong>
      </p>

      <div className="mt-6 space-y-4 text-sm">
        <p>
          [Firmenname]
          <br />
          [Straße und Hausnummer]
          <br />
          [PLZ Ort]
        </p>
        <p>
          Vertreten durch: [Name]
          <br />
          E-Mail: [kontakt@domain.de]
          <br />
          Telefon: [Telefonnummer]
        </p>
        <p>
          Umsatzsteuer-ID gemäß § 27a UStG: [DE…]
          <br />
          Verantwortlich i.S.d. § 18 Abs. 2 MStV: [Name, Anschrift]
        </p>
      </div>
    </main>
  );
}
