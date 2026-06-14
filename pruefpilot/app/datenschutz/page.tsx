import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Datenschutzerklärung – PrüfPilot", robots: { index: false } };

export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <p>Zu erstellende Abschnitte (Art. 13/14 DSGVO) — die technische Realität ist bereits dokumentiert:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>[ ] Verantwortlicher mit Kontaktdaten</li>
        <li>[ ] Verarbeitete Daten: Konto (E-Mail), Betriebs-/Geräte-/Prüfdaten, Vormerkliste (E-Mail, optional Name/Betriebsgröße), Server-Logs</li>
        <li>[ ] Zwecke &amp; Rechtsgrundlagen (Art. 6 Abs. 1 lit. b Vertrag, lit. f berechtigtes Interesse)</li>
        <li>[ ] Auftragsverarbeiter: Supabase (Hosting/DB, Region Frankfurt), Vercel (Anwendung), Resend (E-Mail-Versand), Stripe (Zahlungen) — je AVV-Status und Drittlandbezug prüfen!</li>
        <li>[ ] Speicherdauern (Trial-Daten, Prüfdokumentation = Aufbewahrungsinteresse des Kunden, Vormerkliste bis Widerruf)</li>
        <li>[ ] Betroffenenrechte (Auskunft, Berichtigung, Löschung, Übertragbarkeit, Beschwerderecht)</li>
        <li>[ ] Cookies/Tracking: aktuell ausschließlich technisch notwendige Session-Cookies (Supabase Auth) — kein Analytics, kein Consent-Banner nötig; bei Einführung von Tracking anpassen</li>
        <li>[ ] AVV-Muster für Kunden (Art. 28 DSGVO) als Download</li>
      </ul>
    </LegalPage>
  );
}
