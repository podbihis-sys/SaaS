import type { Metadata } from "next";
import Link from "next/link";
import { Award, ClipboardCheck, FlaskConical, Leaf, Recycle, ShieldCheck } from "lucide-react";
import { c } from "../_data/content";
import { getContent } from "../_data/content-server";

export const metadata: Metadata = {
  alternates: { canonical: "/bit/qualitaet" },
  title: "Qualität",
  description:
    "Qualität bei BIT Bierther: DIN EN ISO 9001 seit 1997, dokumentierte Prozesse, RoHS- und REACH-Konformität sowie rückverfolgbare Konfektion.",
};

export default async function QualitaetPage() {
  const content = await getContent();
  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">Qualität</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900">
            {c(content, "qualitaet.title", "Geprüfte Qualität, dokumentiert und rückverfolgbar")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            {c(
              content,
              "qualitaet.intro",
              "Bereits 1997 wurde die BIT Bierther GmbH erstmals nach DIN EN ISO 9001 zertifiziert. Seitdem sichern dokumentierte Prozesse und konsequente Eingangs- und Endkontrollen die gleichbleibend hohe Güte unserer Produkte.",
            )}
          </p>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Award, title: "DIN EN ISO 9001", text: "Zertifiziertes Qualitätsmanagement seit 1997 – regelmäßig durch den TÜV auditiert." },
            { icon: ClipboardCheck, title: "Wareneingangsprüfung", text: "Jede Charge wird auf Maßhaltigkeit und Materialgüte geprüft, bevor sie ins Lager geht." },
            { icon: ShieldCheck, title: "Normkonforme Werkstoffe", text: "Materialien nach UL, VDE und einschlägigen Industrienormen – auf Wunsch mit Nachweis." },
            { icon: Leaf, title: "RoHS & REACH", text: "Unsere Standardartikel erfüllen die geltenden Umwelt- und Stoffverbotsrichtlinien." },
            { icon: FlaskConical, title: "Rückverfolgbarkeit", text: "Konfektion und Kennzeichnung erlauben eine lückenlose Zuordnung bis zur Charge." },
            { icon: Recycle, title: "Langlebige Produkte", text: "Beständigkeit gegen Temperatur, Chemikalien und UV verlängert die Lebensdauer im Einsatz." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-slate-200 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#38bdf8]/15 text-[#1d4ed8]">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-[#0f2742] py-16">
        <div className="container flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold text-white">Sie benötigen ein Zertifikat oder Datenblatt?</h2>
            <p className="mt-2 max-w-xl text-slate-300">
              Wir stellen Ihnen Werkszeugnisse, Konformitätserklärungen und technische Datenblätter
              auf Anfrage gern zur Verfügung.
            </p>
          </div>
          <Link
            href="/bit/kontakt"
            className="shrink-0 rounded-xl bg-[#38bdf8] px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-[#0ea5e9]"
          >
            Dokument anfragen
          </Link>
        </div>
      </section>
    </>
  );
}
