"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Einwilligungsverwaltung (Cookies / Speicherung auf dem Endgerät).
 *
 * Rechtlicher Rahmen: § 25 TDDDG (früher TTDSG) und DSGVO. Nicht-essenzielle
 * Speicherzugriffe und das Nachladen fremder Inhalte erfolgen erst nach
 * ausdrücklicher Einwilligung; essenzielle Funktionen sind davon ausgenommen.
 *
 * Die Entscheidung selbst wird lokal im Browser abgelegt (kein Server-Tracking).
 */

/** Gruppen, für die eine Einwilligung erteilt werden kann. */
export type ConsentGroup = "essential" | "externalMedia";

export interface ConsentState {
  /** Immer true – essenzielle Speicherung ist für den Betrieb erforderlich. */
  essential: true;
  /** Externe Inhalte (z. B. die OpenStreetMap-Karte auf der Kontaktseite). */
  externalMedia: boolean;
}

interface ConsentContextValue {
  /** null = noch keine Entscheidung getroffen (Banner wird angezeigt). */
  consent: ConsentState | null;
  /** true, sobald aus dem Speicher gelesen wurde (verhindert Aufblitzen). */
  ready: boolean;
  /** Einstellungsdialog offen? */
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  acceptAll: () => void;
  acceptEssential: () => void;
  save: (state: Omit<ConsentState, "essential">) => void;
  /** Entscheidung zurücknehmen – der Banner erscheint erneut. */
  revoke: () => void;
  /** Prüft die Einwilligung einer Gruppe. */
  allows: (group: ConsentGroup) => boolean;
}

const STORAGE_KEY = "bit-datenschutz-einwilligung";
/** Version der Einwilligung – erhöhen, wenn sich Zwecke ändern. */
const VERSION = 1;

const ConsentContext = createContext<ConsentContextValue | null>(null);

interface StoredConsent {
  version: number;
  externalMedia: boolean;
  /** Zeitpunkt der Entscheidung (Nachweisbarkeit), ISO-8601. */
  decidedAt: string;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredConsent;
        if (parsed.version === VERSION) {
          setConsent({ essential: true, externalMedia: !!parsed.externalMedia });
        }
      }
    } catch {
      /* Kein Speicherzugriff möglich – Banner bleibt sichtbar. */
    }
    setReady(true);
  }, []);

  const persist = useCallback((externalMedia: boolean) => {
    setConsent({ essential: true, externalMedia });
    setSettingsOpen(false);
    try {
      const stored: StoredConsent = {
        version: VERSION,
        externalMedia,
        decidedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      /* ignorieren */
    }
  }, []);

  const revoke = useCallback(() => {
    setConsent(null);
    setSettingsOpen(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignorieren */
    }
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      ready,
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
      acceptAll: () => persist(true),
      acceptEssential: () => persist(false),
      save: (s) => persist(!!s.externalMedia),
      revoke,
      allows: (group) => (group === "essential" ? true : !!consent && consent[group]),
    }),
    [consent, ready, settingsOpen, persist, revoke],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent muss innerhalb von ConsentProvider verwendet werden");
  return ctx;
}
