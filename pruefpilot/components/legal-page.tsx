import Link from "next/link";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-blue-700 underline">
        ← Zurück zur Startseite
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{title}</h1>
      <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>PLATZHALTER — vor Veröffentlichung ersetzen.</strong> Dieser Text ist keine
        Rechtsberatung. Endgültige Fassung über eRecht24/IT-Recht-Kanzlei oder Anwalt erstellen
        (siehe Businessplan, Abschnitt 7).
      </div>
      <div className="prose-sm mt-6 space-y-4 text-slate-700">{children}</div>
    </main>
  );
}
