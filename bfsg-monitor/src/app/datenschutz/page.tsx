import type { Metadata } from "next";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

// Template — review with a DPO/lawyer before launch.
export default function DatenschutzPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-16 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold">Datenschutzerklärung</h1>

      <p>
        Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Nachfolgend
        informieren wir gemäß DSGVO über die Verarbeitung im Rahmen von
        BFSG-Monitor.
      </p>

      <section className="space-y-1">
        <h2 className="font-semibold">Verantwortlicher</h2>
        <p>[Firmenname, Anschrift, Kontakt — siehe Impressum]</p>
      </section>

      <section className="space-y-1">
        <h2 className="font-semibold">Welche Daten wir verarbeiten</h2>
        <ul className="list-disc pl-5">
          <li>Kontodaten: E-Mail-Adresse (Authentifizierung).</li>
          <li>Von Ihnen hinterlegte Domains und Scan-Ergebnisse.</li>
          <li>Abrechnungsdaten zur Vertragsabwicklung.</li>
        </ul>
        <p>
          Bei Scans werden ausschließlich öffentlich erreichbare Seiten geprüft;
          wir speichern keine personenbezogenen Daten Ihrer Website-Besucher.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className="font-semibold">Auftragsverarbeiter / Dienste</h2>
        <ul className="list-disc pl-5">
          <li>Supabase (Auth, Datenbank, Speicher) — Region Frankfurt (EU).</li>
          <li>Stripe (Zahlungsabwicklung).</li>
          <li>Resend (E-Mail-Versand).</li>
          <li>Vercel (Hosting) und Railway (Scan-Dienst).</li>
        </ul>
        <p>Mit diesen Anbietern bestehen Auftragsverarbeitungsverträge.</p>
      </section>

      <section className="space-y-1">
        <h2 className="font-semibold">Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung,
          Einschränkung, Datenübertragbarkeit und Widerspruch sowie ein
          Beschwerderecht bei einer Aufsichtsbehörde.
        </p>
      </section>

      <p className="text-xs text-muted-foreground">
        Hinweis: Diese Datenschutzerklärung ist eine Vorlage und muss vor
        Veröffentlichung an die tatsächlichen Verhältnisse angepasst und
        rechtlich geprüft werden.
      </p>
    </main>
  );
}
