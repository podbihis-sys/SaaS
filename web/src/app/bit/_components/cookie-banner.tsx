"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { useConsent } from "../_lib/consent";

/**
 * Datenschutz-/Cookie-Hinweis beim ersten Seitenaufruf – Aufbau und Wortlaut
 * wie auf bit-gmbh.de (Überschrift „Datenschutzeinstellungen“, Erläuterung,
 * „Alle akzeptieren“, „Nur essenzielle Cookies akzeptieren“ und individuelle
 * Einstellungen).
 *
 * Die aufgeführten Gruppen entsprechen dem, was diese Website tatsächlich
 * speichert bzw. nachlädt.
 */

interface GroupInfo {
  key: "essential" | "externalMedia";
  name: string;
  description: string;
  items: { name: string; purpose: string; storage: string }[];
}

const GROUPS: GroupInfo[] = [
  {
    key: "essential",
    name: "Essenziell",
    description:
      "Essenzielle Speicherung ermöglicht grundlegende Funktionen und ist für die einwandfreie Funktion der Website erforderlich. Sie kann daher nicht deaktiviert werden.",
    items: [
      {
        name: "Warenkorb",
        purpose:
          "Merkt sich die von Ihnen zusammengestellten Artikel, damit Ihre Anfrage beim Seitenwechsel erhalten bleibt.",
        storage: "Lokale Speicherung im Browser · bleibt bis zum Leeren des Warenkorbs",
      },
      {
        name: "Datenschutzeinstellungen",
        purpose:
          "Speichert Ihre hier getroffene Auswahl, damit dieser Hinweis nicht bei jedem Besuch erneut erscheint.",
        storage: "Lokale Speicherung im Browser · bis zum Widerruf",
      },
    ],
  },
  {
    key: "externalMedia",
    name: "Externe Medien",
    description:
      "Inhalte von Drittanbietern werden erst nach Ihrer Einwilligung geladen. Ohne Einwilligung wird an dieser Stelle nur ein Platzhalter angezeigt und es werden keine Daten an den Anbieter übertragen.",
    items: [
      {
        name: "OpenStreetMap",
        purpose:
          "Zeigt die Anfahrtskarte auf der Kontaktseite. Beim Laden wird Ihre IP-Adresse an die OpenStreetMap Foundation übertragen.",
        storage: "Anbieter: OpenStreetMap Foundation · Anschrift steht auch als Text daneben",
      },
    ],
  },
];

export function CookieBanner() {
  const {
    consent,
    ready,
    settingsOpen,
    openSettings,
    closeSettings,
    acceptAll,
    acceptEssential,
    save,
  } = useConsent();
  const [externalMedia, setExternalMedia] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstBtn = useRef<HTMLButtonElement>(null);

  const needsDecision = ready && consent === null;
  const visible = needsDecision || settingsOpen;

  useEffect(() => {
    if (settingsOpen) setExternalMedia(consent?.externalMedia ?? false);
  }, [settingsOpen, consent]);

  // Fokus in den Dialog, Fokus-Falle, Escape schließt (nur wenn bereits
  // entschieden wurde – sonst bleibt der Hinweis stehen).
  useEffect(() => {
    if (!visible) return;
    firstBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && consent !== null) {
        closeSettings();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const f = dialogRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input:not([disabled])",
      );
      const first = f[0];
      const last = f[f.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, consent, closeSettings]);

  if (!visible) return null;

  const showDetails = settingsOpen;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bit-consent-title"
        aria-describedby="bit-consent-desc"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start gap-4 border-b border-slate-200 px-6 py-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
            <Cookie className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="bit-consent-title" className="text-lg font-bold text-slate-900">
              Datenschutzeinstellungen
            </h2>
            <p id="bit-consent-desc" className="mt-1 text-sm leading-relaxed text-slate-600">
              Wir nutzen Cookies auf unserer Website. Einige von ihnen sind essenziell, während
              andere uns helfen, diese Website und Ihre Erfahrung zu verbessern.
            </p>
          </div>
          {consent !== null && (
            <button
              onClick={closeSettings}
              aria-label="Datenschutzeinstellungen schließen"
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {showDetails && (
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-sm leading-relaxed text-slate-600">
              Hier finden Sie eine Übersicht über alle verwendeten Speicherzugriffe. Sie können
              Ihre Einwilligung zu ganzen Kategorien geben oder sich weitere Informationen
              anzeigen lassen.
            </p>
            <ul className="mt-5 space-y-4">
              {GROUPS.map((g) => {
                const isEssential = g.key === "essential";
                const checked = isEssential ? true : externalMedia;
                return (
                  <li key={g.key} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900">{g.name}</span>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          {g.description}
                        </p>
                      </div>
                      <label className="flex shrink-0 items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isEssential}
                          onChange={(e) => setExternalMedia(e.target.checked)}
                          aria-label={
                            isEssential
                              ? `${g.name} – immer aktiv, nicht abwählbar`
                              : `${g.name} zulassen`
                          }
                          className="h-4 w-4 rounded border-slate-300 accent-[#1e4a7a] disabled:opacity-60"
                        />
                        {isEssential ? "Immer aktiv" : "Zulassen"}
                      </label>
                    </div>
                    <dl className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                      {g.items.map((it) => (
                        <div key={it.name} className="text-sm">
                          <dt className="font-medium text-slate-800">{it.name}</dt>
                          <dd className="text-slate-600">{it.purpose}</dd>
                          <dd className="mt-0.5 text-xs text-slate-500">{it.storage}</dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="px-6 py-5">
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              ref={firstBtn}
              onClick={acceptAll}
              className="flex-1 rounded-xl bg-[#1e4a7a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#163a61]"
            >
              Alle akzeptieren
            </button>
            <button
              onClick={showDetails ? () => save({ externalMedia }) : acceptEssential}
              className="flex-1 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {showDetails ? "Auswahl speichern" : "Nur essenzielle Cookies akzeptieren"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            {!showDetails ? (
              <button
                onClick={openSettings}
                className="font-medium text-[#1e4a7a] hover:underline"
              >
                Individuelle Datenschutzeinstellungen
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-[#38bdf8]" aria-hidden="true" />
                Ihre Auswahl wird nur lokal in Ihrem Browser gespeichert.
              </span>
            )}
            <span className="flex gap-4 text-slate-500">
              <Link href="/bit/datenschutz" className="hover:text-[#1e4a7a] hover:underline">
                Datenschutz
              </Link>
              <Link href="/bit/impressum" className="hover:text-[#1e4a7a] hover:underline">
                Impressum
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Footer-Schaltfläche, um die Einstellungen erneut zu öffnen. */
export function ConsentSettingsLink({ className }: { className?: string }) {
  const { openSettings } = useConsent();
  return (
    <button type="button" onClick={openSettings} className={className}>
      Datenschutzeinstellungen
    </button>
  );
}
