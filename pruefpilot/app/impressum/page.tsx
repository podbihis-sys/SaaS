import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Impressum – PrüfPilot", robots: { index: false } };

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <p>Angaben gemäß § 5 DDG (vormals TMG). Vor Veröffentlichung auszufüllen:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>[ ] Vollständiger Name / Firma (nach Gründung: UG-Firmierung + Vertretungsberechtigte)</li>
        <li>[ ] Ladungsfähige Anschrift (kein Postfach)</li>
        <li>[ ] E-Mail-Adresse und weitere schnelle Kontaktmöglichkeit</li>
        <li>[ ] Umsatzsteuer-ID (sofern vorhanden, § 27a UStG)</li>
        <li>[ ] Registergericht + Handelsregisternummer (nach UG-Gründung)</li>
        <li>[ ] Verantwortlich i. S. d. § 18 Abs. 2 MStV (bei redaktionellen Inhalten/Blog)</li>
        <li>[ ] Hinweis auf EU-Streitschlichtungsplattform (Art. 14 ODR-VO) und § 36 VSBG</li>
      </ul>
    </LegalPage>
  );
}
