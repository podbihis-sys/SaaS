import Link from "next/link";
import { DEVICE_CATEGORIES } from "@/lib/categories";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="flex items-center justify-between">
        <span className="text-lg font-semibold text-blue-800">PrüfPilot</span>
        <nav className="flex gap-3">
          <Link href="/login" className="btn-secondary">
            Anmelden
          </Link>
          <Link href="/register" className="btn-primary">
            Kostenlos testen
          </Link>
        </nav>
      </header>

      <section className="mt-16">
        <h1 className="text-4xl font-bold tracking-tight">
          Prüfpflichten im Griff. Haftung abgesichert.
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          PrüfPilot verwaltet alle gesetzlich vorgeschriebenen Prüftermine Ihres
          Unternehmens — von der DGUV-V3-Prüfung bis zur UVV-Fahrzeugkontrolle.
          Lückenlose Dokumentation, automatische Erinnerungen, Audit-Export auf
          Knopfdruck.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link href="/register" className="btn-primary">
            14 Tage kostenlos testen — ohne Kreditkarte
          </Link>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          DSGVO-konform · Hosting Frankfurt · AVV inklusive
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold">Vorkonfigurierte Prüfarten</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {DEVICE_CATEGORIES.map((category) => (
            <li key={category.id} className="card py-4">
              <p className="font-medium">{category.nameDe}</p>
              <p className="text-sm text-slate-500">{category.legalBasis}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-16 border-t border-slate-200 pt-6 text-sm text-slate-500">
        PrüfPilot befindet sich in der Validierungsphase. Fragen:{" "}
        <a className="underline" href="mailto:kontakt@pruefpilot.example">
          kontakt@pruefpilot.example
        </a>
      </footer>
    </main>
  );
}
