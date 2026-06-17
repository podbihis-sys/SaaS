import type { Metadata } from "next";

export const metadata: Metadata = { title: "Datenschutzerklärung", robots: { index: false } };

export default function DatenschutzPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold">Datenschutzerklärung</h1>
      <p className="mt-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
        Muster ohne Gewähr, keine Rechtsberatung. Bitte vor Livegang juristisch prüfen und an den
        konkreten Betrieb anpassen.
      </p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold">1. Datensparsamkeit</h2>
          <p>
            RentFlow speichert ausschließlich die für eine Buchung erforderlichen Daten der Mieter
            (Name, E-Mail, optional Telefon, Buchungszeitraum, Artikel). Es werden keine
            unnötigen personenbezogenen Daten erhoben.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">2. Eingesetzte Dienste (Auftragsverarbeiter)</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>Supabase</strong> — Datenbank, Authentifizierung, Datei-Speicher (Hosting in
              der EU konfigurierbar).
            </li>
            <li>
              <strong>Stripe</strong> — Zahlungsabwicklung. Mieter-Zahlungen laufen per Stripe
              Connect direkt auf das Konto des jeweiligen Verleih-Betriebs; Zahlungsdaten verarbeitet
              Stripe eigenverantwortlich.
            </li>
            <li>
              <strong>Resend</strong> — Versand transaktionaler E-Mails (Buchungsbestätigung,
              Erinnerungen).
            </li>
            <li>
              <strong>Plausible</strong> — cookielose, datenschutzfreundliche Reichweitenmessung
              (sofern aktiviert).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold">3. Hinweis zur Auftragsverarbeitung (AV)</h2>
          <p>
            Mit den genannten Dienstleistern sind Verträge zur Auftragsverarbeitung gemäß Art. 28
            DSGVO abzuschließen. Der jeweilige Verleih-Betrieb ist Verantwortlicher im Sinne der
            DSGVO für die über seine Buchungsseite erhobenen Mieter-Daten.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">4. Betroffenenrechte</h2>
          <p>
            Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch
            gemäß Art. 15–21 DSGVO. Kontakt: [datenschutz@domain.de].
          </p>
        </section>
      </div>
    </main>
  );
}
