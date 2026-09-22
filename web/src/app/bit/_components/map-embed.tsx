"use client";

import { MapPin } from "lucide-react";
import { useConsent } from "../_lib/consent";

const STRINGS = {
  de: {
    title: "Karte von OpenStreetMap",
    text: "Die Karte wird erst nach Ihrer Einwilligung geladen. Dabei wird Ihre IP-Adresse an die OpenStreetMap Foundation übertragen. Unsere Anschrift finden Sie nebenstehend als Text.",
    load: "Karte laden",
    settings: "Datenschutzeinstellungen",
  },
  en: {
    title: "Map by OpenStreetMap",
    text: "The map is only loaded after your consent. Your IP address is then transmitted to the OpenStreetMap Foundation. Our address is shown as text next to the map.",
    load: "Load map",
    settings: "Privacy settings",
  },
} as const;

/**
 * Inhalts-Blocker für die OpenStreetMap-Karte: Die Karte wird erst geladen,
 * wenn eine Einwilligung für „Externe Medien“ vorliegt (§ 25 TDDDG). Vorher
 * erscheint ein Platzhalter mit Zustimmungsmöglichkeit – es werden keine Daten
 * an den Anbieter übertragen.
 */
export function MapEmbed({
  src,
  title,
  className,
  locale = "de",
}: {
  src: string;
  title: string;
  className?: string;
  locale?: "de" | "en";
}) {
  const t = STRINGS[locale];
  const { allows, openSettings, acceptAll } = useConsent();

  if (allows("externalMedia")) {
    return (
      <iframe
        title={title}
        className={className}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={src}
      />
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 bg-slate-50 p-8 text-center ${className ?? ""}`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
        <MapPin className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="font-semibold text-slate-900">{t.title}</p>
      <p className="max-w-sm text-sm leading-relaxed text-slate-600">{t.text}</p>
      <div className="mt-1 flex flex-wrap justify-center gap-2">
        <button
          onClick={acceptAll}
          className="rounded-xl bg-[#1e4a7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a61]"
        >
          {t.load}
        </button>
        <button
          onClick={openSettings}
          className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white"
        >
          {t.settings}
        </button>
      </div>
    </div>
  );
}
