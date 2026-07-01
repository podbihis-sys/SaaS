import { Mail, Phone } from "lucide-react";
import { COMPANY } from "../_data/catalog";

/**
 * Fixe Schnellkontakt-Buttons (Telefon + E-Mail) an der rechten Seitenkante.
 * Auf allen öffentlichen Seiten sichtbar und von überall klickbar.
 * Barrierefrei: echte Links mit aria-label, dekorative Icons aria-hidden,
 * sichtbarer Fokus-Indikator, ausreichend große Klickfläche (48×48 px).
 */
export function ContactFab() {
  const tel = `tel:${COMPANY.phone.replace(/\s/g, "")}`;
  return (
    <div className="fixed right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2 print:hidden">
      <a
        href={tel}
        aria-label={`Anrufen: ${COMPANY.phone}`}
        className="flex h-12 w-12 items-center justify-center rounded-l-xl bg-[#1e4a7a] text-white shadow-lg transition-colors hover:bg-[#163a61] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4a7a]"
      >
        <Phone className="h-5 w-5" aria-hidden="true" />
      </a>
      <a
        href={`mailto:${COMPANY.email}`}
        aria-label={`E-Mail schreiben an ${COMPANY.email}`}
        className="flex h-12 w-12 items-center justify-center rounded-l-xl bg-[#38bdf8] text-slate-900 shadow-lg transition-colors hover:bg-[#0ea5e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4a7a]"
      >
        <Mail className="h-5 w-5" aria-hidden="true" />
      </a>
    </div>
  );
}
