"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * DSGVO-konformer Consent-Hinweis. Die Seite setzt von Haus aus nur technisch
 * notwendige Cookies, daher genügt ein informierender Hinweis mit aktiver
 * Bestätigung. Es werden ohne Einwilligung KEINE Tracking-/Marketing-Skripte
 * geladen. Die Entscheidung wird in localStorage gespeichert.
 */
const STORAGE_KEY = "ng-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage nicht verfügbar – Banner einfach nicht anzeigen.
    }
  }, []);

  const decide = (value: "accepted" | "declined") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-desc"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-2xl border border-moss-100 bg-white p-5 shadow-xl sm:inset-x-auto sm:right-4"
    >
      <h2 id="cookie-title" className="font-display text-lg text-anthracite-900">
        Datenschutz &amp; Cookies
      </h2>
      <p id="cookie-desc" className="mt-2 text-sm leading-relaxed text-anthracite-600">
        Wir verwenden ausschließlich technisch notwendige Cookies, damit diese
        Website funktioniert. Es findet kein Tracking und keine Weitergabe an
        Dritte statt. Details finden Sie in unserer{" "}
        <Link href="/datenschutz" className="font-medium text-moss-700 underline">
          Datenschutzerklärung
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => decide("accepted")}
          className="btn-primary flex-1"
        >
          Verstanden
        </button>
        <button
          type="button"
          onClick={() => decide("declined")}
          className="btn-secondary flex-1"
        >
          Nur notwendige
        </button>
      </div>
    </div>
  );
}
