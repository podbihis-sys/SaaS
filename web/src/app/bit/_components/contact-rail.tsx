import { Mail, Phone } from "lucide-react";
import { COMPANY } from "../_data/catalog";

/**
 * Feststehende Schnellkontakt-Leiste am rechten Bildschirmrand (Telefon /
 * E-Mail) – wie auf bit-gmbh.de auf jeder Seite sichtbar und beim Scrollen
 * mitlaufend. `fixed` sorgt dafür, dass sie am Viewport klebt.
 */
export function ContactRail() {
  return (
    <div
      className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-px sm:flex"
      aria-label="Schnellkontakt"
    >
      <a
        href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
        aria-label={`Anrufen: ${COMPANY.phone}`}
        title={COMPANY.phone}
        className="flex h-12 w-12 items-center justify-center rounded-l-xl bg-[#1e4a7a] text-white shadow-lg transition-all hover:w-14 hover:bg-[#163a61]"
      >
        <Phone className="h-5 w-5" aria-hidden="true" />
      </a>
      <a
        href={`mailto:${COMPANY.email}`}
        aria-label={`E-Mail schreiben an ${COMPANY.email}`}
        title={COMPANY.email}
        className="flex h-12 w-12 items-center justify-center rounded-l-xl bg-[#38bdf8] text-slate-900 shadow-lg transition-all hover:w-14 hover:bg-[#0ea5e9]"
      >
        <Mail className="h-5 w-5" aria-hidden="true" />
      </a>
    </div>
  );
}
