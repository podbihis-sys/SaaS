import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://adriawebcode.com"}/${locale}/datenschutz`;
  return {
    title: dict.legal.privacyTitle,
    robots: { index: false, follow: true },
    // Override the layout's home-page canonical/hreflang so this noindex page
    // doesn't send contradictory signals for the localized home page.
    alternates: { canonical: url, languages: {} },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <main className="container-site max-w-3xl py-28">
      <Link href={`/${locale}`} className="text-sm font-medium text-tiefsee hover:text-tiefsee-press">
        ← adriawebcode
      </Link>
      <h1 className="mt-6 text-4xl font-semibold text-ink">{dict.legal.privacyTitle}</h1>
      <div className="mt-8 flex flex-col gap-4 text-sm leading-relaxed text-muted">
        <h2 className="mt-4 font-semibold text-ink">1. Verantwortlicher</h2>
        <p>
          adriawebcode, [Anschrift eintragen], E-Mail: hello@adriawebcode.com
        </p>
        <h2 className="mt-4 font-semibold text-ink">2. Verarbeitung von Anfragedaten</h2>
        <p>
          Wenn Sie unser Kontaktformular nutzen, verarbeiten wir die von Ihnen angegebenen Daten
          (Name, E-Mail, Telefon, Firma, Adresse, Projektangaben sowie – falls angegeben – die URL
          Ihrer bestehenden Website) ausschließlich zur Erstellung Ihres Angebots und zur
          Kontaktaufnahme (Art. 6 Abs. 1 lit. b DSGVO). Die angegebene Website-URL wird automatisiert
          technisch analysiert (öffentlich abrufbare Inhalte), um das Angebot zu kalkulieren.
        </p>
        <h2 className="mt-4 font-semibold text-ink">3. Speicherdauer</h2>
        <p>
          Anfragedaten werden gelöscht, sobald sie für die Angebotsabwicklung nicht mehr
          erforderlich sind und keine gesetzlichen Aufbewahrungspflichten bestehen.
        </p>
        <h2 className="mt-4 font-semibold text-ink">4. Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
          Datenübertragbarkeit und Widerspruch. Wenden Sie sich dazu an hello@adriawebcode.com.
        </p>
        <h2 className="mt-4 font-semibold text-ink">5. Hosting & Server-Logs</h2>
        <p>
          Diese Website wird bei Vercel Inc. gehostet. Beim Aufruf werden technisch notwendige
          Zugriffsdaten (IP-Adresse, Zeitpunkt, aufgerufene Seite) in Server-Logs verarbeitet
          (Art. 6 Abs. 1 lit. f DSGVO).
        </p>
      </div>
    </main>
  );
}
