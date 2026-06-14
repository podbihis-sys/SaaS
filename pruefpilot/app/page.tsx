import Link from "next/link";
import { DashboardPreview, QrLabelPreview } from "@/components/app-preview";
import { LeadForm } from "@/components/lead-form";
import { Reveal } from "@/components/reveal";
import { DEVICE_CATEGORIES } from "@/lib/categories";

const PAINS = [
  { accent: "from-rose-500 to-red-500", title: "Excel-Chaos", text: "Die Prüfliste kennt nur eine Person. Ist die im Urlaub, weiß niemand, was fällig ist — gemerkt wird es erst beim Anruf des Prüfdienstleisters.", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3zM3 9h18M9 9v12M15 9v12" /> },
  { accent: "from-amber-500 to-orange-500", title: "BG-Kontrolle", text: "Der Prüfer will zwei Jahre Protokolle sehen. Sie suchen in Mails und Ordnern — notiert wird „unvollständige Dokumentation“.", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" /> },
  { accent: "from-slate-600 to-slate-800", title: "Persönliche Haftung", text: "ArbSchG §13, DGUV V1, BetrSichV: Die Nachweispflicht liegt bei Ihnen. Nach einem Unfall mit ungeprüftem Gerät zählt nur die Doku.", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4z" /> },
];

const STATS = [
  { value: "6", label: "Prüfarten vorkonfiguriert" },
  { value: "< 30 Min", label: "bis startklar" },
  { value: "60·30·7", label: "Tage Vorlauf-Erinnerung" },
  { value: "100 %", label: "Hosting in Deutschland" },
];

const INDUSTRIES = ["Handwerk", "KFZ-Werkstatt", "Logistik", "Pflege", "Hausverwaltung", "Produktion"];

const SHOWCASE_POINTS = [
  "QR-Etikett drucken, ankleben — Scan öffnet sofort die Geräteakte.",
  "Prüfung in Sekunden erfassen: Datum, Prüfer, Ergebnis, PDF-Nachweis.",
  "Unveränderliche Historie — auditfest für jede BG-Kontrolle.",
];

const STEPS = [
  { title: "Inventar anlegen", text: "Geräte eintragen — Kategorie wählen, das gesetzliche Intervall ist vorbelegt. QR-Etiketten drucken." },
  { title: "Erinnerungen laufen automatisch", text: "PrüfPilot überwacht jede Frist und meldet sich rechtzeitig. Sie müssen an nichts denken." },
  { title: "Prüfung dokumentieren — fertig", text: "Ergebnis eintragen, PDF anhängen. Bei der Kontrolle: Export-Button, PDF übergeben." },
];

const FAQS = [
  { q: "Welche Prüfungen kann ich verwalten?", a: "Alle gängigen gesetzlich vorgeschriebenen Betriebsprüfungen: DGUV-V3 (elektrische Betriebsmittel), Leitern und Tritte, Feuerlöscher, Erste-Hilfe-Material, UVV-Prüfung von Fahrzeugen und Flurförderzeugen. Die Intervalle sind als Empfehlung voreingestellt und je Gerät anpassbar." },
  { q: "Ist die Dokumentation manipulationssicher?", a: "Jeder Prüfvorgang wird mit Zeitstempel, Prüfer, Ergebnis und optionalem PDF gespeichert. Einträge sind nachträglich weder änderbar noch löschbar — nur ergänzbar. So entsteht eine lückenlose, chronologische Nachweiskette." },
  { q: "Wo liegen meine Daten — und wer hat Zugriff?", a: "Ausschließlich auf Servern in Frankfurt am Main, kein Transfer außerhalb der EU, keine Weitergabe an Dritte. AVV nach Art. 28 DSGVO inklusive. Jeder Betrieb sieht nur seine eigenen Daten — technisch auf Datenbankebene erzwungen." },
  { q: "Was passiert nach den 14 Tagen Testphase?", a: "Ihre Daten bleiben erhalten. Ohne Abo wird der Zugang pausiert; Geräte, Fristen und Nachweise sind nach Abo-Start sofort wieder da. Keine Kreditkarte für den Test nötig." },
  { q: "Sichert PrüfPilot meine Haftung ab?", a: "PrüfPilot liefert die Dokumentation, die Sie als Betreiber nach ArbSchG, DGUV V1 und BetrSichV schulden. Diese Nachweiskette ist entscheidend, wenn Behörde, BG oder Versicherung die Sorgfaltspflicht bewerten. Es ersetzt keine Rechtsberatung, schafft aber deren Grundlage." },
  { q: "Unser Prüfdienstleister erledigt das doch?", a: "Er prüft — die Dokumentationspflicht und Haftung bleiben beim Betreiber. Wechselt der Dienstleister, stehen Sie ohne Nachweis da. PrüfPilot ergänzt ihn: Ergebnisse werden bei Ihnen dokumentiert, die Historie gehört Ihnen." },
];

const TRUST = ["DSGVO-konform", "Hosting Frankfurt", "AVV inklusive", "Monatlich kündbar"];

function Icon({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">{children}</svg>
    </div>
  );
}

function Check({ light = false }: { light?: boolean }) {
  return (
    <span className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full ${light ? "bg-white/20 text-cyan-200" : "bg-emerald-100 text-emerald-600"}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3"><path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" /></svg>
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-x-hidden bg-white">
      {/* Floating Glass-Nav */}
      <header className="sticky top-4 z-50 px-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full glass px-3 py-2 shadow-[0_8px_30px_-10px_rgba(2,6,23,0.25)]">
          <span className="flex items-center gap-2 pl-2 text-base font-bold tracking-tight text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4zM9.5 12l1.8 1.8L15 10" /></svg>
            </span>
            PrüfPilot
          </span>
          <nav className="flex items-center gap-2">
            <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">Anmelden</Link>
            <Link href="/register" className="btn-primary !px-5 !py-2">Testen</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative -mt-16 overflow-hidden bg-mesh-light pb-20 pt-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl animate-blob" />
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl animate-blob [animation-delay:4s]" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex animate-fade-up items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-medium text-blue-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            Für Gründungspartner geöffnet
          </div>
          <h1 className="animate-fade-up mt-7 text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 [animation-delay:80ms] sm:text-7xl">
            Prüfpflichten im Griff.
            <br />
            <span className="text-gradient animate-gradient">Haftung abgesichert.</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-slate-600 [animation-delay:160ms]">
            Alle gesetzlich vorgeschriebenen Prüftermine Ihres Unternehmens an einem Ort — von der
            DGUV-V3-Prüfung bis zur UVV-Kontrolle. Lückenlos dokumentiert, automatisch erinnert.
          </p>
          <div className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 [animation-delay:240ms] sm:flex-row">
            <Link href="/register" className="btn-primary w-full sm:w-auto">
              14 Tage kostenlos testen
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </Link>
            <a href="#vormerken" className="btn-secondary w-full sm:w-auto">Unverbindlich vormerken</a>
          </div>
          <div className="animate-fade-up mt-6 flex flex-wrap items-center justify-center gap-2 [animation-delay:320ms]">
            {TRUST.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs font-medium text-slate-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" /></svg>
                {item}
              </span>
            ))}
          </div>
          <div className="animate-fade-up relative z-10 mx-auto mt-16 max-w-3xl [animation-delay:420ms]">
            <div className="absolute -inset-x-10 -top-8 bottom-0 -z-10 rounded-[3rem] bg-gradient-to-tr from-blue-400/30 via-indigo-400/20 to-cyan-300/30 blur-3xl" aria-hidden="true" />
            <div className="animate-float"><DashboardPreview /></div>
          </div>
        </div>
      </section>

      {/* Branchen */}
      <div className="bg-white py-10">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Gemacht für deutsche KMU aus</p>
        <div className="mx-auto mt-5 flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6">
          {INDUSTRIES.map((name) => (
            <span key={name} className="text-base font-semibold text-slate-300">{name}</span>
          ))}
        </div>
      </div>

      {/* Pains */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Kennen Sie das?</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PAINS.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <div className="group h-full rounded-3xl bg-gradient-to-b from-slate-50 to-white p-7 ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:ring-slate-300">
                  <Icon accent={p.accent}>{p.icon}</Icon>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bento-Features */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">Funktionen</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Alles für den lückenlosen Nachweis</h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:auto-rows-[210px] md:grid-cols-3">
            {/* Großes Gradient-Tile */}
            <Reveal className="md:col-span-2 md:row-span-2">
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-xl shadow-blue-600/25">
                <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl animate-blob" aria-hidden="true" />
                <div className="relative">
                  <Icon accent="from-white/20 to-white/5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14v-3a6 6 0 1 0-12 0v3a2 2 0 0 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
                  </Icon>
                  <h3 className="mt-5 text-2xl font-bold">Automatische Fristenüberwachung</h3>
                  <p className="mt-2 max-w-md text-blue-100/90">PrüfPilot erinnert mehrstufig vor jeder Fälligkeit und eskaliert, wenn etwas überfällig wird. Keine Frist fällt mehr durchs Raster.</p>
                </div>
                <div className="relative mt-6 flex flex-wrap gap-2">
                  {["60 Tage", "30 Tage", "7 Tage", "Eskalation"].map((c) => (
                    <span key={c} className="rounded-full glass-dark px-3 py-1 text-sm font-medium text-white">{c}</span>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal>
              <div className="group flex h-full flex-col rounded-[2rem] bg-white p-6 ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:ring-blue-200">
                <Icon accent="from-blue-500 to-indigo-600"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3zM20 14v6m0 0h-3" /></Icon>
                <h3 className="mt-4 font-semibold text-slate-900">QR-Etikett-Inventar</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">Scannen, Geräteakte öffnen — kein Suchen.</p>
              </div>
            </Reveal>
            <Reveal>
              <div className="group flex h-full flex-col rounded-[2rem] bg-white p-6 ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:ring-blue-200">
                <Icon accent="from-emerald-500 to-teal-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" /></Icon>
                <h3 className="mt-4 font-semibold text-slate-900">Prüfbericht als PDF</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">Ein Klick — das Dokument für die BG-Kontrolle.</p>
              </div>
            </Reveal>
            <Reveal className="md:col-span-2">
              <div className="flex h-full flex-col justify-center rounded-[2rem] bg-white p-7 ring-1 ring-slate-200/70">
                <div className="flex items-center gap-4">
                  <Icon accent="from-violet-500 to-purple-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m1 8H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l5 5v7a2 2 0 0 1-2 2z" /></Icon>
                  <div>
                    <h3 className="font-semibold text-slate-900">Lückenlose, auditfeste Dokumentation</h3>
                    <p className="mt-1 text-sm text-slate-600">Unveränderliche Historie mit Vorlagen für jede Prüfart.</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {DEVICE_CATEGORIES.map((c) => (
                    <span key={c.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{c.nameDe}</span>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal>
              <div className="group flex h-full flex-col rounded-[2rem] bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white transition-all duration-300 hover:-translate-y-1">
                <Icon accent="from-white/20 to-white/5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4zM9.5 12l1.8 1.8L15 10" /></Icon>
                <h3 className="mt-4 font-semibold">DSGVO · Hosting Frankfurt</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">AVV inklusive, kein Drittland-Transfer.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-6 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="rounded-3xl bg-gradient-to-b from-blue-50/60 to-white p-6 text-center ring-1 ring-slate-200/60">
                <p className="text-3xl font-extrabold tracking-tight text-blue-600 sm:text-4xl">{s.value}</p>
                <p className="mt-1 text-sm text-slate-500">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Einblick */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">Einblick</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">So sieht PrüfPilot aus</h2>
          </Reveal>
          <div className="mt-12 grid items-center gap-10 md:grid-cols-2">
            <Reveal><QrLabelPreview /></Reveal>
            <Reveal delay={120}>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">QR-Etikett & lückenloser Nachweis</h3>
              <p className="mt-3 text-slate-600">Jedes Gerät trägt sein Etikett. Vor Ort scannen, Prüfung dokumentieren — der Nachweis landet automatisch in der unveränderlichen Historie.</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {SHOWCASE_POINTS.map((p) => (<li key={p} className="flex items-start gap-2.5"><Check />{p}</li>))}
              </ul>
              <Link href="/register" className="btn-primary mt-7">App kostenlos ausprobieren</Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">In drei Schritten startklar</h2>
          </Reveal>
          <div className="relative mt-14 grid gap-10 md:grid-cols-3">
            <div className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-blue-200 md:block" aria-hidden="true" />
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 140} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-bold text-white shadow-lg shadow-blue-600/30">{i + 1}</div>
                  <h3 className="mt-5 font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Ein Preis. Alles drin.</h2>
            <p className="mt-3 text-slate-600">Transparent, monatlich kündbar — keine Staffeln.</p>
          </Reveal>
          <Reveal delay={120} className="mx-auto mt-12 max-w-md">
            <div className="rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-600 p-[1.5px] shadow-2xl shadow-blue-600/25">
              <div className="rounded-[calc(2rem-1.5px)] bg-white p-8 text-center">
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">Komplett-Tarif</span>
                <div className="mt-5 flex items-end justify-center gap-1">
                  <span className="text-6xl font-extrabold tracking-tight text-slate-900">49 €</span>
                  <span className="mb-2 text-slate-500">/ Monat netto</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">14 Tage kostenlos testen · ohne Kreditkarte</p>
                <ul className="mx-auto mt-7 space-y-3 text-left text-sm">
                  {["Unbegrenzte Geräte & Prüfungen", "Alle Prüfarten-Vorlagen inklusive", "Automatische E-Mail-Erinnerungen", "QR-Etiketten zum Selbstdrucken", "Prüfbericht-Export als PDF", "Hosting in Deutschland, AVV inklusive"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-slate-700"><Check />{f}</li>
                  ))}
                </ul>
                <Link href="/register" className="btn-primary mt-8 w-full">Jetzt kostenlos testen</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ — randlos, Hairline-Trenner */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal className="text-center"><h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Häufige Fragen</h2></Reveal>
          <Reveal delay={80} className="mt-10">
            <div className="overflow-hidden rounded-3xl bg-slate-50 ring-1 ring-slate-200/70">
              {FAQS.map((faq) => (
                <details key={faq.q} className="group border-b border-slate-200/70 px-6 py-5 last:border-0 open:bg-white">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200 transition-transform duration-300 group-open:rotate-180 group-open:text-blue-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section id="vormerken" className="bg-white px-6 py-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-mesh-dark px-8 py-14 text-white shadow-2xl sm:px-12">
          <div className="absolute inset-0 bg-grid opacity-50" aria-hidden="true" />
          <div className="relative grid items-center gap-10 md:grid-cols-2">
            <Reveal>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Kein Prüftermin mehr verpassen.</h2>
              <p className="mt-4 text-blue-100/90">PrüfPilot startet mit einer kleinen Gruppe von Gründungspartnern. Tragen Sie sich ein — wir melden uns persönlich, ohne Newsletter-Flut.</p>
              <ul className="mt-6 space-y-2.5 text-sm text-blue-100/90">
                {["Persönliches Onboarding beim Einrichten", "Mitsprache bei den nächsten Funktionen", "Vorzugskonditionen zum Start"].map((b) => (
                  <li key={b} className="flex items-center gap-2.5"><Check light />{b}</li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={140}><LeadForm /></Reveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <span className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4zM9.5 12l1.8 1.8L15 10" /></svg>
              </span>
              PrüfPilot
            </span>
            <p className="mt-3 max-w-xs text-sm text-slate-500">Gesetzliche Prüfpflichten für deutsche KMU — lückenlos dokumentiert, fristgerecht erinnert.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Produkt</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><a href="#vormerken" className="hover:text-blue-700">Vormerken</a></li>
              <li><Link href="/register" className="hover:text-blue-700">Kostenlos testen</Link></li>
              <li><Link href="/login" className="hover:text-blue-700">Anmelden</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Rechtliches</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link href="/impressum" className="hover:text-blue-700">Impressum</Link></li>
              <li><Link href="/datenschutz" className="hover:text-blue-700">Datenschutz</Link></li>
              <li><Link href="/agb" className="hover:text-blue-700">AGB</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Kontakt</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><a href="mailto:kontakt@pruefpilot.example" className="hover:text-blue-700">kontakt@pruefpilot.example</a></li>
              <li>Server: Frankfurt a. M.</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200">
          <p className="mx-auto max-w-6xl px-6 py-5 text-sm text-slate-400">© {new Date().getFullYear()} PrüfPilot — in Validierungsphase</p>
        </div>
      </footer>
    </div>
  );
}
