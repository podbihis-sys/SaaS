import type { Metadata } from "next";

export const metadata: Metadata = { title: "AGB" };

// Template — review with a lawyer before launch.
export default function AgbPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-16 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold">Allgemeine Geschäftsbedingungen</h1>

      <section className="space-y-1">
        <h2 className="font-semibold">1. Leistungsgegenstand</h2>
        <p>
          BFSG-Monitor ist ein Werkzeug zur automatisierten Prüfung und
          Überwachung der Barrierefreiheit von Websites. Es liefert Diagnosen und
          Frühwarnungen, stellt jedoch keine Rechtsberatung dar und garantiert
          weder Rechtssicherheit noch vollständige Konformität.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className="font-semibold">2. Vertragsschluss und Laufzeit</h2>
        <p>
          Kostenpflichtige Pläne beginnen mit einer Testphase und verlängern sich
          je nach gewähltem Abrechnungszeitraum. Eine Kündigung ist zum Ende des
          jeweiligen Zeitraums möglich.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className="font-semibold">3. Pflichten der Nutzer</h2>
        <p>
          Nutzer dürfen nur Domains prüfen, für die sie berechtigt sind. Ein
          Missbrauch des Dienstes ist untersagt.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className="font-semibold">4. Haftung</h2>
        <p>
          Automatisierte Tests erkennen nur einen Teil möglicher Barrieren. Eine
          Haftung für die Vollständigkeit der Ergebnisse oder für rechtliche
          Folgen ist ausgeschlossen, soweit gesetzlich zulässig.
        </p>
      </section>

      <p className="text-xs text-muted-foreground">
        Hinweis: Diese AGB sind eine Vorlage und müssen vor Veröffentlichung
        rechtlich geprüft und angepasst werden.
      </p>
    </main>
  );
}
