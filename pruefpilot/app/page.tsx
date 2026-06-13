import Link from "next/link";
import { LeadForm } from "@/components/lead-form";
import { Reveal } from "@/components/reveal";
import { DEVICE_CATEGORIES } from "@/lib/categories";

const PAINS = [
  {
    accent: "from-rose-500 to-red-500",
    title: "Das Excel-Dilemma",
    text: "Ihre Prüfliste lebt in einer Tabelle, die nur eine Person kennt. Ist die im Urlaub, weiß niemand, welche Geräte fällig sind — gemerkt wird es erst, wenn der Prüfdienstleister anruft.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3zM3 9h18M9 9v12M15 9v12" />
    ),
  },
  {
    accent: "from-amber-500 to-orange-500",
    title: "Der Moment bei der BG-Kontrolle",
    text: "Der Prüfer will die Protokolle der letzten zwei Jahre sehen — für alle Geräte, Leitern, Feuerlöscher. Sie suchen in Mails und Ordnern. Notiert wird: „unvollständige Dokumentation“.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
    ),
  },
  {
    accent: "from-slate-600 to-slate-800",
    title: "Persönliche Haftung",
    text: "ArbSchG §13, DGUV Vorschrift 1, BetrSichV — die Nachweispflicht liegt bei Ihnen persönlich. Bei einem Unfall mit ungeprüftem Gerät wird genau diese Dokumentation zur entscheidenden Frage.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4z" />
    ),
  },
];

const FEATURES = [
  {
    accent: "from-blue-500 to-indigo-600",
    title: "Inventar mit QR-Code-Etiketten",
    text: "Jedes Prüfobjekt bekommt ein druckbares QR-Etikett — Smartphone draufhalten, Geräteakte offen. Kein Suchen mehr.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3zM20 14v6m0 0h-3" />,
  },
  {
    accent: "from-sky-500 to-cyan-500",
    title: "Automatische Fristen­überwachung",
    text: "E-Mails 60, 30 und 7 Tage vor jedem Termin — plus Eskalation bei Überfälligkeit. Keine Frist fällt mehr durchs Raster.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14v-3a6 6 0 1 0-12 0v3a2 2 0 0 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />,
  },
  {
    accent: "from-violet-500 to-purple-600",
    title: "Lückenlose Dokumentation",
    text: "Datum, Prüfer, Ergebnis, PDF-Nachweis — jeder Vorgang mit Zeitstempel, nachträglich nicht änderbar, nur ergänzbar.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m1 8H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l5 5v7a2 2 0 0 1-2 2z" />,
  },
  {
    accent: "from-emerald-500 to-teal-600",
    title: "Prüfbericht per Knopfdruck",
    text: "Ein Klick erzeugt das vollständige PDF mit allen Geräten, Fristen und Nachweisen — genau das Dokument für die BG-Kontrolle.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />,
  },
  {
    accent: "from-amber-500 to-orange-600",
    title: "Gesetzliche Vorlagen inklusive",
    text: "DGUV V3, Leitern, Feuerlöscher, Erste Hilfe, UVV — mit hinterlegten Standard-Intervallen, je Gerät anpassbar.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />,
  },
  {
    accent: "from-blue-600 to-slate-700",
    title: "DSGVO-konform in Deutschland",
    text: "Alle Daten in Frankfurt am Main, kein Transfer in Drittländer, Auftragsverarbeitungsvertrag inklusive.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4zM9.5 12l1.8 1.8L15 10" />,
  },
];

const STEPS = [
  { title: "Inventar anlegen", text: "Geräte eintragen — Kategorie wählen, das gesetzliche Intervall ist vorbelegt. QR-Etiketten drucken. Einmalig 20–30 Minuten." },
  { title: "Erinnerungen laufen automatisch", text: "PrüfPilot überwacht jede Frist und meldet sich rechtzeitig per E-Mail. Sie müssen an nichts mehr denken." },
  { title: "Prüfung dokumentieren — fertig", text: "Ergebnis eintragen, Protokoll-PDF anhängen. Bei der nächsten Kontrolle: Export-Button, PDF übergeben." },
];

const FAQS = [
  { q: "Welche Prüfungen kann ich verwalten?", a: "Alle gängigen gesetzlich vorgeschriebenen Betriebsprüfungen: DGUV-V3 (elektrische Betriebsmittel), Leitern und Tritte (DGUV Information 208-016), Feuerlöscher (DIN 14406-4), Erste-Hilfe-Material, UVV-Prüfung von Fahrzeugen und Flurförderzeugen. Die Intervalle sind als Empfehlung voreingestellt und je Gerät anpassbar." },
  { q: "Ist die Dokumentation manipulationssicher?", a: "Jeder Prüfvorgang wird mit Zeitstempel, Prüfer, Ergebnis und optionalem PDF gespeichert. Einträge können nachträglich weder geändert noch gelöscht werden — nur durch neue Einträge ergänzt. So entsteht eine lückenlose, chronologische Nachweiskette." },
  { q: "Wo liegen meine Daten — und wer hat Zugriff?", a: "Ausschließlich auf Servern in Frankfurt am Main. Kein Datentransfer außerhalb der EU, keine Weitergabe an Dritte. Einen Auftragsverarbeitungsvertrag nach Art. 28 DSGVO stellen wir bereit. Jeder Betrieb sieht ausschließlich seine eigenen Daten — technisch erzwungen auf Datenbankebene." },
  { q: "Was passiert nach den 14 Tagen Testphase?", a: "Ihre Daten werden nicht gelöscht — Sie entscheiden in Ruhe. Ohne Abo wird der Zugang pausiert; Geräte, Fristen und Nachweise bleiben erhalten und sind nach Abo-Start sofort wieder da. Eine Kreditkarte ist für den Test nicht nötig." },
  { q: "Sichert PrüfPilot meine Haftung ab?", a: "PrüfPilot liefert die Dokumentation, die Sie als Betreiber nach ArbSchG, DGUV Vorschrift 1 und BetrSichV schulden: wer hat wann was geprüft, mit welchem Ergebnis. Diese Nachweiskette ist der entscheidende Faktor, wenn Behörde, BG oder Versicherung die Sorgfaltspflicht bewerten. PrüfPilot ersetzt keine Rechtsberatung — es schafft deren Grundlage." },
  { q: "Unser Prüfdienstleister erledigt das doch schon?", a: "Ihr Dienstleister prüft — die Dokumentationspflicht und Haftung bleiben gesetzlich bei Ihnen als Betreiber. Wechselt der Dienstleister, stehen Sie ohne Nachweis da. PrüfPilot ergänzt ihn: Ergebnisse werden bei Ihnen dokumentiert, die Historie gehört Ihnen." },
];

const TRUST = ["DSGVO-konform", "Hosting Frankfurt", "AVV inklusive", "Monatlich kündbar"];

function FeatureIcon({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        {children}
      </svg>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <span className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4zM9.5 12l1.8 1.8L15 10" />
              </svg>
            </span>
            PrüfPilot
          </span>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="btn-secondary">Anmelden</Link>
            <Link href="/register" className="btn-primary">Kostenlos testen</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl animate-blob" />
          <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl animate-blob [animation-delay:3s]" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl animate-blob [animation-delay:6s]" />
        </div>
        <div className="absolute inset-0 bg-grid opacity-70 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-20 text-center sm:pt-28">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-blue-100 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
            </span>
            Für Gründungspartner geöffnet
          </div>
          <h1 className="animate-fade-up mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight [animation-delay:80ms] sm:text-6xl">
            Prüfpflichten im Griff.
            <br />
            <span className="text-gradient animate-gradient">Haftung abgesichert.</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-blue-100/90 [animation-delay:160ms]">
            PrüfPilot verwaltet alle gesetzlich vorgeschriebenen Prüftermine Ihres Unternehmens — von
            der DGUV-V3-Prüfung bis zur UVV-Fahrzeugkontrolle. Lückenlose Dokumentation, automatische
            Erinnerungen, Prüfbericht auf Knopfdruck.
          </p>
          <div className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 [animation-delay:240ms] sm:flex-row">
            <Link href="/register" className="btn-primary w-full sm:w-auto">
              14 Tage kostenlos testen
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
            <a href="#vormerken" className="btn-on-dark w-full sm:w-auto">Unverbindlich vormerken</a>
          </div>
          <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-blue-200/80 [animation-delay:320ms]">
            {TRUST.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 text-cyan-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="relative h-16 bg-gradient-to-b from-transparent to-slate-50" />
        <svg className="absolute bottom-0 w-full text-slate-50" viewBox="0 0 1440 60" fill="currentColor" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 60h1440V20c-240 30-480 40-720 30S240 10 0 30z" />
        </svg>
      </section>

      {/* Pains */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Kennen Sie das?</h2>
            <p className="mt-3 text-slate-600">Drei Situationen, die in deutschen KMU täglich passieren — und teuer werden können.</p>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PAINS.map((pain, i) => (
              <Reveal key={pain.title} delay={i * 120}>
                <div className="group h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/40">
                  <FeatureIcon accent={pain.accent}>{pain.icon}</FeatureIcon>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{pain.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{pain.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative bg-gradient-to-b from-white to-blue-50/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">Funktionen</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Was PrüfPilot übernimmt</h2>
            <p className="mt-3 text-slate-600">Alles, was ein KMU für den lückenlosen Prüfnachweis braucht — in einer App.</p>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={(i % 3) * 100}>
                <div className="group h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-200/40">
                  <FeatureIcon accent={feature.accent}>{feature.icon}</FeatureIcon>
                  <h3 className="mt-5 font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <p className="mx-auto mt-10 max-w-3xl text-center text-sm text-slate-500">
              Vorkonfigurierte Prüfarten:{" "}
              <span className="font-medium text-slate-700">
                {DEVICE_CATEGORIES.map((c) => c.nameDe).join(" · ")}
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">In drei Schritten startklar</h2>
            <p className="mt-3 text-slate-600">Die meisten Betriebe sind in unter einer Stunde eingerichtet.</p>
          </Reveal>
          <div className="relative mt-14 grid gap-10 md:grid-cols-3">
            <div className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-blue-200 md:block" aria-hidden="true" />
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 140} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-bold text-white shadow-lg shadow-blue-600/30">
                    {i + 1}
                  </div>
                  <h3 className="mt-5 font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Ein Preis. Alles drin.</h2>
            <p className="mt-3 text-slate-600">Keine Staffeln, keine Überraschungen — transparent und monatlich kündbar.</p>
          </Reveal>
          <Reveal delay={120} className="mx-auto mt-12 max-w-md">
            <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-[2px] shadow-2xl shadow-blue-600/25">
              <div className="rounded-[calc(1.5rem-2px)] bg-white p-8 text-center">
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">Komplett-Tarif</span>
                <div className="mt-5 flex items-end justify-center gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-slate-900">49 €</span>
                  <span className="mb-1.5 text-slate-500">/ Monat netto</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">14 Tage kostenlos testen · ohne Kreditkarte</p>
                <ul className="mx-auto mt-7 space-y-3 text-left text-sm">
                  {["Unbegrenzte Geräte & Prüfungen", "Alle Prüfarten-Vorlagen inklusive", "Automatische E-Mail-Erinnerungen", "QR-Etiketten zum Selbstdrucken", "Prüfbericht-Export als PDF", "Hosting in Deutschland, AVV inklusive"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-slate-700">
                      <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="btn-primary mt-8 w-full">Jetzt kostenlos testen</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Häufige Fragen</h2>
          </Reveal>
          <div className="mt-10 space-y-3">
            {FAQS.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 60}>
                <details className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors open:border-blue-200 open:bg-blue-50/40">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-300 group-open:rotate-180 group-open:bg-blue-100 group-open:text-blue-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Vormerken */}
      <section id="vormerken" className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 py-20 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl animate-blob" />
          <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl animate-blob [animation-delay:4s]" />
        </div>
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-6 md:grid-cols-2">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight">Kein Prüftermin mehr verpassen. Kein Audit mehr fürchten.</h2>
            <p className="mt-4 text-blue-100/90">
              PrüfPilot startet mit einer kleinen Gruppe von Gründungspartnern. Tragen Sie sich ein —
              wir melden uns persönlich, ohne Newsletter-Flut.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-blue-100/90">
              {["Persönliches Onboarding beim Einrichten", "Mitsprache bei den nächsten Funktionen", "Vorzugskonditionen zum Start"].map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 text-cyan-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={140}>
            <LeadForm />
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-7 text-sm text-slate-500 sm:flex-row">
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4z" />
              </svg>
            </span>
            © {new Date().getFullYear()} PrüfPilot — in Validierungsphase
          </span>
          <nav className="flex gap-5">
            <Link href="/impressum" className="transition-colors hover:text-blue-700">Impressum</Link>
            <Link href="/datenschutz" className="transition-colors hover:text-blue-700">Datenschutz</Link>
            <Link href="/agb" className="transition-colors hover:text-blue-700">AGB</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
