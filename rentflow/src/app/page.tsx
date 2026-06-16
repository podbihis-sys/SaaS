import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="mb-3 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        Für Eventausstattungs-Verleih · DACH
      </p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Schluss mit Doppelbuchungen.
      </h1>
      <p className="mt-5 text-lg text-muted-foreground">
        RentFlow gibt deinem Verleih-Betrieb eine öffentliche Buchungsseite mit{" "}
        <strong>Live-Verfügbarkeit</strong>. Anzahlung und Kaution laufen per Stripe direkt auf
        dein eigenes Konto — Doppelbuchungen sind technisch ausgeschlossen.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/login">
          <Button size="lg">Kostenlos starten</Button>
        </Link>
        <Link href="/verleih-software">
          <Button size="lg" variant="outline">
            So funktioniert&apos;s
          </Button>
        </Link>
      </div>

      <ul className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          ["Doppelbuchungs-Schutz", "Transaktionale Verfügbarkeitsprüfung — nie wieder doppelt vergeben."],
          ["Geld auf deinem Konto", "Stripe Connect: Anzahlung & Kaution landen direkt bei dir."],
          ["Automatische Erinnerungen", "Abhol- und Rückgabe-Erinnerungen laufen von selbst."],
        ].map(([title, body]) => (
          <li key={title} className="rounded-lg border p-4">
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
