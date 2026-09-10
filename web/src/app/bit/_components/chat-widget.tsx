"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, ShieldCheck, X } from "lucide-react";

/**
 * Smartsupp Live-Chat – datenschutzkonform nachgeladen.
 *
 * Das Smartsupp-Skript wird NICHT beim Seitenaufruf geladen, sondern erst,
 * wenn der Besucher den Chat startet und dabei der Datenübertragung an
 * Smartsupp zugestimmt hat (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a DSGVO).
 * Die Zustimmung wird lokal im Browser gemerkt; bei späteren Besuchen lädt
 * der Chat dann direkt. Der allgemeine Cookie-Hinweis bleibt davon unberührt.
 */

const SMARTSUPP_KEY = "ee152e1f0c35abd68b480e432ccd2db7e8630727";
const STORAGE_KEY = "bit-livechat-einwilligung";

type SmartsuppFn = ((...args: unknown[]) => void) & { _?: unknown[][] };

declare global {
  interface Window {
    _smartsupp?: { key?: string };
    smartsupp?: SmartsuppFn;
  }
}

const STRINGS = {
  de: {
    button: "Live-Chat",
    open: "Live-Chat starten",
    title: "Live-Chat starten",
    text: "Unser Live-Chat wird von Smartsupp.com, s.r.o. (Prag, Tschechien) bereitgestellt. Beim Start werden Verbindungsdaten wie Ihre IP-Adresse an Smartsupp übertragen und Cookies gesetzt, damit Ihre Unterhaltung erhalten bleibt. Ohne Ihre Zustimmung wird nichts geladen.",
    accept: "Zustimmen und Chat starten",
    cancel: "Abbrechen",
    note: "Ihre Zustimmung wird nur in Ihrem Browser gespeichert.",
    privacy: "Datenschutzerklärung",
    privacyHref: "/bit/datenschutz",
    close: "Schließen",
  },
  en: {
    button: "Live chat",
    open: "Start live chat",
    title: "Start live chat",
    text: "Our live chat is provided by Smartsupp.com, s.r.o. (Prague, Czech Republic). When you start it, connection data such as your IP address is transmitted to Smartsupp and cookies are set so your conversation is kept. Nothing is loaded without your consent.",
    accept: "Agree and start chat",
    cancel: "Cancel",
    note: "Your consent is stored in your browser only.",
    privacy: "Privacy policy",
    privacyHref: "/bit/en/privacy-policy",
    close: "Close",
  },
} as const;

/** Lädt den Smartsupp-Loader genau einmal (entspricht dem offiziellen Snippet). */
function loadSmartsupp(language: "de" | "en") {
  if (window.smartsupp) return;
  window._smartsupp = window._smartsupp || {};
  window._smartsupp.key = SMARTSUPP_KEY;
  const queue: unknown[][] = [];
  const fn: SmartsuppFn = (...args: unknown[]) => {
    queue.push(args);
  };
  fn._ = queue;
  window.smartsupp = fn;
  fn("language", language);
  const s = document.createElement("script");
  s.type = "text/javascript";
  s.charset = "utf-8";
  s.async = true;
  s.src = "https://www.smartsuppchat.com/loader.js?";
  document.head.appendChild(s);
}

export function ChatWidget() {
  const pathname = usePathname();
  const locale: "de" | "en" = pathname?.startsWith("/bit/en") ? "en" : "de";
  const t = STRINGS[locale];

  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const acceptRef = useRef<HTMLButtonElement>(null);

  // Frühere Zustimmung: Chat direkt laden, eigener Button entfällt.
  useEffect(() => {
    let consented = false;
    try {
      consented = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* kein Speicherzugriff – Abfrage erscheint beim Start erneut */
    }
    if (consented) {
      loadSmartsupp(locale);
      setLoaded(true);
    }
    setReady(true);
  }, [locale]);

  useEffect(() => {
    if (!askOpen) return;
    acceptRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAskOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [askOpen]);

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignorieren */
    }
    loadSmartsupp(locale);
    window.smartsupp?.("chat:open");
    setAskOpen(false);
    setLoaded(true);
  }

  // Sobald Smartsupp läuft, zeigt es sein eigenes Chat-Symbol.
  if (!ready || loaded) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setAskOpen(true)}
        aria-label={t.open}
        aria-haspopup="dialog"
        aria-expanded={askOpen}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#1e4a7a] py-3 pl-4 pr-5 text-sm font-semibold text-white shadow-lg shadow-[#1e4a7a]/30 transition-colors hover:bg-[#163a61]"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        <span>{t.button}</span>
      </button>

      {askOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
          onClick={() => setAskOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bit-chat-consent-title"
            aria-describedby="bit-chat-consent-desc"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start gap-4 border-b border-slate-200 px-6 py-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
                <MessageCircle className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="bit-chat-consent-title" className="text-lg font-bold text-slate-900">
                  {t.title}
                </h2>
                <p id="bit-chat-consent-desc" className="mt-1 text-sm leading-relaxed text-slate-600">
                  {t.text}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAskOpen(false)}
                aria-label={t.close}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  ref={acceptRef}
                  type="button"
                  onClick={accept}
                  className="flex-1 rounded-xl bg-[#1e4a7a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#163a61]"
                >
                  {t.accept}
                </button>
                <button
                  type="button"
                  onClick={() => setAskOpen(false)}
                  className="flex-1 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#38bdf8]" aria-hidden="true" />
                  {t.note}
                </span>
                <Link href={t.privacyHref} className="font-medium text-[#1e4a7a] hover:underline">
                  {t.privacy}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
