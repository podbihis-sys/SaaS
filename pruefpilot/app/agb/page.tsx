import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "AGB – PrüfPilot", robots: { index: false } };

export default function AgbPage() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen">
      <p>Zu erstellende Klauseln — zwei davon sind laut Council-Review haftungskritisch:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>[ ] Vertragsgegenstand (SaaS, B2B — Geltung nur gegenüber Unternehmern, § 14 BGB)</li>
        <li>[ ] Preise (netto), Zahlweise (Stripe), Laufzeit, Kündigung (monatlich), Testphase</li>
        <li>
          [ ] <strong>Haftungsklausel Erinnerungsfunktion:</strong> PrüfPilot unterstützt die
          Organisation, ersetzt aber nicht die gesetzliche Prüf- und Überwachungspflicht des
          Betreibers; keine Haftung für Folgen verpasster Prüfungen bei ausbleibenden/nicht
          zugestellten Erinnerungen (anwaltlich formulieren!)
        </li>
        <li>
          [ ] <strong>Intervall-Klausel:</strong> hinterlegte Prüfintervalle sind unverbindliche
          Empfehlungen; maßgeblich sind Gefährdungsbeurteilung und geltende Vorschriften des Kunden
        </li>
        <li>[ ] Verfügbarkeit/SLA-Erwartung (realistisch für Solo-Betrieb), Support-Zeiten</li>
        <li>[ ] Datenexport bei Vertragsende, Löschfristen</li>
        <li>[ ] Gerichtsstand, anwendbares Recht</li>
      </ul>
    </LegalPage>
  );
}
