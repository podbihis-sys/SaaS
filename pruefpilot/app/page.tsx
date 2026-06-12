import Link from "next/link";
import { LeadForm } from "@/components/lead-form";
import { DEVICE_CATEGORIES } from "@/lib/categories";

const PAINS = [
  {
    title: "Das Excel-Dilemma",
    text: "Ihre Prüfliste lebt in Excel — irgendwo in einer Ordnerstruktur, die nur eine Person wirklich kennt. Ist die krank oder im Urlaub, weiß niemand, welche Geräte diesen Monat fällig sind. Gemerkt wird es erst, wenn der Prüfdienstleister anruft.",
  },
  {
    title: "Der Moment bei der BG-Kontrolle",
    text: "Der Prüfer der Berufsgenossenschaft möchte die Prüfprotokolle der letzten zwei Jahre sehen — für alle elektrischen Geräte, alle Leitern, alle Feuerlöscher. Sie suchen in E-Mail-Anhängen und Aktenordnern. Eine halbe Stunde später haben Sie die Hälfte beisammen. Notiert wird: „unvollständige Dokumentation“.",
  },
  {
    title: "Persönliche Haftung",
    text: "ArbSchG §13, DGUV Vorschrift 1, BetrSichV — die Pflicht zur Prüfung und zum Nachweis liegt bei Ihnen persönlich als Geschäftsführer oder verantwortlicher Person. Bei einem Arbeitsunfall mit einem nicht fristgerecht geprüften Gerät wird genau diese Dokumentation zur entscheidenden Frage.",
  },
];

const FEATURES = [
  {
    title: "Geräteinventar mit QR-Code-Etiketten",
    text: "Jedes Prüfobjekt bekommt ein druckbares QR-Etikett — Smartphone draufhalten, Geräteakte offen. Kein Suchen in Ordnern, eindeutige Zuordnung.",
  },
  {
    title: "Automatische Fristenüberwachung",
    text: "E-Mail-Erinnerungen 60, 30 und 7 Tage vor jedem Prüftermin — und eine Eskalation, falls etwas überfällig wird. Fristen fallen nicht mehr durchs Raster.",
  },
  {
    title: "Lückenlose Prüfdokumentation",
    text: "Datum, Prüfer, Ergebnis, Prüfprotokoll als PDF — jeder Vorgang wird mit Zeitstempel gespeichert und ist nachträglich nicht veränderbar, nur ergänzbar.",
  },
  {
    title: "Prüfbericht per Knopfdruck",
    text: "Ein Klick erzeugt das vollständige PDF mit allen Geräten, Fristen, Ergebnissen und Nachweisen — genau das Dokument, das BG-Prüfer und Versicherung sehen wollen.",
  },
  {
    title: "Gesetzliche Vorlagen vorkonfiguriert",
    text: "DGUV V3, Leitern & Tritte, Feuerlöscher, Erste Hilfe, UVV Fahrzeuge und Flurförderzeuge — mit hinterlegten Standard-Intervallen, je Gerät anpassbar.",
  },
  {
    title: "DSGVO-konform in Deutschland",
    text: "Alle Daten liegen in Frankfurt am Main. Kein Transfer in Drittländer, Auftragsverarbeitungsvertrag (AVV) inklusive.",
  },
];

const STEPS = [
  {
    title: "Inventar anlegen",
    text: "Geräte eintragen — Kategorie wählen, das gesetzliche Standard-Intervall ist vorbelegt. QR-Etiketten drucken und anbringen. Einmalig 20–30 Minuten.",
  },
  {
    title: "Erinnerungen laufen automatisch",
    text: "PrüfPilot überwacht ab jetzt jede Frist und meldet sich rechtzeitig per E-Mail — Sie müssen an nichts mehr denken.",
  },
  {
    title: "Prüfung dokumentieren — Nachweis fertig",
    text: "Nach jeder Prüfung Ergebnis eintragen, Protokoll-PDF anhängen, fertig. Bei der nächsten Kontrolle: Export-Button, PDF übergeben.",
  },
];

const FAQS = [
  {
    q: "Welche Prüfungen kann ich mit PrüfPilot verwalten?",
    a: "Alle gängigen gesetzlich vorgeschriebenen Betriebsprüfungen: DGUV-V3-Prüfung elektrischer Betriebsmittel, Leitern und Tritte (DGUV Information 208-016), Feuerlöscher (DIN 14406-4), Erste-Hilfe-Material, UVV-Prüfung von Fahrzeugen und Flurförderzeugen. Die Prüfintervalle sind als Empfehlung voreingestellt und lassen sich je Gerät an Ihre Gefährdungsbeurteilung anpassen.",
  },
  {
    q: "Ist die Dokumentation manipulationssicher?",
    a: "Jeder Prüfvorgang wird mit Zeitstempel, Prüfer, Ergebnis und optionalem PDF-Anhang gespeichert. Einträge können nachträglich weder geändert noch gelöscht werden — nur durch neue Einträge ergänzt. So entsteht eine lückenlose, chronologische Nachweiskette.",
  },
  {
    q: "Wo liegen meine Daten — und wer hat Zugriff?",
    a: "Ausschließlich auf Servern in Frankfurt am Main. Kein Datentransfer in Länder außerhalb der EU, keine Weitergabe an Dritte. Einen Auftragsverarbeitungsvertrag (AVV) nach Art. 28 DSGVO stellen wir bereit. Jeder Betrieb sieht ausschließlich seine eigenen Daten — technisch erzwungen auf Datenbankebene.",
  },
  {
    q: "Was passiert nach den 14 Tagen Testphase?",
    a: "Ihre Daten werden nicht gelöscht — Sie entscheiden in Ruhe, ob Sie weitermachen. Ohne Abo wird der Zugang pausiert; Ihre Geräte, Fristen und Nachweise bleiben erhalten und sind nach Abo-Start sofort wieder da. Eine Kreditkarte ist für den Test nicht nötig.",
  },
  {
    q: "Sichert PrüfPilot wirklich meine Haftung ab?",
    a: "PrüfPilot liefert die Dokumentation, die Sie als Betreiber nach ArbSchG, DGUV Vorschrift 1 und BetrSichV schulden: wer hat wann was geprüft, mit welchem Ergebnis, mit welchem Nachweis. Diese Nachweiskette ist der entscheidende Faktor, wenn Behörde, Berufsgenossenschaft oder Versicherung die Sorgfaltspflicht bewerten. PrüfPilot ersetzt keine Rechtsberatung — es schafft die Grundlage, auf der sie funktioniert.",
  },
  {
    q: "Unser Prüfdienstleister erledigt das doch schon?",
    a: "Ihr Dienstleister führt die Prüfungen durch — die Dokumentationspflicht und die Haftung für vollständige Nachweise bleiben gesetzlich bei Ihnen als Betreiber. Wechselt der Dienstleister oder findet sein Protokoll nicht mehr, stehen Sie ohne Nachweis da. PrüfPilot ergänzt ihn: Ergebnisse werden bei Ihnen dokumentiert, die Historie gehört Ihnen.",
  },
  {
    q: "Wie schnell ist PrüfPilot einsatzbereit?",
    a: "Die meisten Betriebe sind in 30–60 Minuten startklar: Geräte anlegen, Etiketten drucken, fertig. Gründungspartner begleiten wir beim Einrichten persönlich.",
  },
  {
    q: "Gibt es Support?",
    a: "Ja, per E-Mail — werktags antworten wir in der Regel innerhalb von 24 Stunden. Für jede Prüfart gibt es zudem eine Schritt-für-Schritt-Anleitung.",
  },
];

export default function HomePage() {
  return (
    <main>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <span className="text-lg font-semibold text-blue-800">PrüfPilot</span>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary">
              Anmelden
            </Link>
            <Link href="/register" className="btn-primary">
              Kostenlos testen
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-16 pt-20 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Prüfpflichten im Griff. Haftung abgesichert.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          PrüfPilot verwaltet alle gesetzlich vorgeschriebenen Prüftermine Ihres Unternehmens — von
          der DGUV-V3-Prüfung bis zur UVV-Fahrzeugkontrolle. Lückenlose Dokumentation, automatische
          Erinnerungen, Prüfbericht auf Knopfdruck.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register" className="btn-primary">
            14 Tage kostenlos testen — ohne Kreditkarte
          </Link>
          <a href="#vormerken" className="btn-secondary">
            Oder unverbindlich vormerken
          </a>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          DSGVO-konform · Hosting Frankfurt · AVV inklusive · monatlich kündbar
        </p>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="text-center text-2xl font-bold">Kennen Sie das?</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {PAINS.map((pain) => (
              <div key={pain.title} className="card">
                <h3 className="font-semibold">{pain.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{pain.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="text-center text-2xl font-bold">Was PrüfPilot übernimmt</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card">
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          Vorkonfigurierte Prüfarten:{" "}
          {DEVICE_CATEGORIES.map((category) => category.nameDe).join(" · ")}
        </p>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="text-center text-2xl font-bold">So funktioniert’s</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="card">
                <span className="text-sm font-semibold text-blue-700">Schritt {index + 1}</span>
                <h3 className="mt-1 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="text-center text-2xl font-bold">Ein Preis. Alles drin.</h2>
        <div className="mx-auto mt-8 max-w-md">
          <div className="card border-blue-200 text-center">
            <p className="text-4xl font-bold">
              49 €<span className="text-base font-normal text-slate-500"> /Monat netto</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">monatlich kündbar · 14 Tage kostenlos testen</p>
            <ul className="mx-auto mt-5 max-w-xs space-y-2 text-left text-sm text-slate-700">
              <li>✓ Unbegrenzte Geräte & Prüfungen</li>
              <li>✓ Alle Prüfarten-Vorlagen inklusive</li>
              <li>✓ Automatische E-Mail-Erinnerungen</li>
              <li>✓ QR-Etiketten zum Selbstdrucken</li>
              <li>✓ Prüfbericht-Export als PDF</li>
              <li>✓ Hosting in Deutschland, AVV inklusive</li>
            </ul>
            <Link href="/register" className="btn-primary mt-6 w-full">
              Jetzt kostenlos testen
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-center text-2xl font-bold">Häufige Fragen</h2>
          <dl className="mt-8 space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.q}>
                <dt className="font-semibold">{faq.q}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-slate-600">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="vormerken" className="mx-auto max-w-xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold">
          Kein Prüftermin mehr verpassen. Kein Audit mehr fürchten.
        </h2>
        <p className="mt-3 text-center text-sm text-slate-600">
          PrüfPilot startet aktuell mit einer kleinen Gruppe von Gründungspartnern. Tragen Sie sich
          ein — wir melden uns persönlich, ohne Newsletter-Flut.
        </p>
        <div className="relative mt-6">
          <LeadForm />
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} PrüfPilot — in Validierungsphase</span>
          <nav className="flex gap-4">
            <Link href="/impressum" className="hover:underline">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:underline">
              Datenschutz
            </Link>
            <Link href="/agb" className="hover:underline">
              AGB
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
