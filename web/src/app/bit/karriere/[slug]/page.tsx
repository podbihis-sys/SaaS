import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { JOBS, jobApplyPhrase } from "../../_data/jobs";
import { getCmsJobs } from "../../_data/misc-server";

// Seite alle 5 Minuten im Hintergrund erneuern (ISR); im CMS neu angelegte
// Stellen bekommen über dynamicParams ebenfalls eine Unterseite.
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return JOBS.map((job) => ({ slug: job.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const jobs = await getCmsJobs(JOBS);
  const job = jobs.find((j) => j.id === slug);
  if (!job) return { title: "Stelle nicht gefunden" };
  return {
    alternates: { canonical: `/bit/karriere/${job.id}` },
    title: job.title.replace("*", ""),
    description: job.intro,
  };
}

export default async function StellePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // CMS-first: Stellen aus bit_jobs; Fallback ist die eingebaute Liste.
  const jobs = await getCmsJobs(JOBS);
  const job = jobs.find((j) => j.id === slug);
  if (!job) notFound();

  return (
    <>
      {/* Hero – dunkel, einheitlich mit den übrigen Unterseiten (Kundenvorgabe). */}
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="container py-14">
          <Link
            href="/bit/karriere"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 transition-colors hover:text-[#38bdf8]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Alle offenen Stellen
          </Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">
            Karriere · Offene Stelle
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {job.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-slate-300">
            {job.intro}
          </p>
        </div>
      </section>

      {/* Stellenbeschreibung */}
      <section className="container py-16">
        <article className="max-w-3xl">
          {job.text.map((t) => (
            <p key={t} className="mt-4 first:mt-0 leading-relaxed text-slate-700">
              {t}
            </p>
          ))}
          <p className="mt-6 font-semibold text-slate-900">{job.aufgabenTitel}</p>
          <ul className="mt-3 space-y-2.5">
            {job.aufgaben.map((t) => (
              <li key={t} className="flex gap-3 leading-relaxed text-slate-700">
                <span
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#38bdf8]"
                  aria-hidden="true"
                />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 leading-relaxed text-slate-700">{job.schluss}</p>
        </article>

        {/* Bewerbung */}
        <div className="mt-12 max-w-3xl rounded-3xl bg-[#0f2742] px-8 py-10">
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            Bewerben Sie sich {jobApplyPhrase(job)}
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            Kontaktieren Sie uns unter 02254 – 96 10 31 oder senden Sie uns Ihre Bewerbung an
            s.widera@bit-gmbh.de – Ihr Ansprechpartner ist Herr Simon Widera.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#38bdf8]" aria-hidden="true" />
              <a href="tel:+4922549610-31" className="hover:text-white">
                02254 – 96 10 31
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#38bdf8]" aria-hidden="true" />
              <a href="mailto:s.widera@bit-gmbh.de" className="hover:text-white">
                s.widera@bit-gmbh.de
              </a>
            </li>
          </ul>
          <a
            href={`mailto:s.widera@bit-gmbh.de?subject=${encodeURIComponent(
              `Bewerbung: ${job.title.replace("*", "")}`,
            )}`}
            className="mt-6 inline-flex rounded-xl bg-[#38bdf8] px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-[#0ea5e9]"
          >
            Jetzt bewerben
          </a>
        </div>

        {/* Gleichstellungshinweis (Fußnote zum * in den Überschriften) */}
        <p className="mt-12 max-w-4xl border-t border-slate-200 pt-6 text-sm leading-relaxed text-slate-600">
          * Um Ihnen den Lesefluss zu erleichtern, beschränken wir uns im Textverlauf auf die
          Verwendung männlicher Bezeichnungen sowie die entsprechenden Personal- und
          Possessivpronomen. Wir betonen ausdrücklich, dass diese Begriffe funktionsbezogen und
          nicht geschlechterbezogen zu verstehen sind, da bei uns alle Menschen – unabhängig von
          Geschlecht, Nationalität, ethnischer und sozialer Herkunft, Religion/Weltanschauung,
          Behinderung, Alter sowie sexueller Orientierung – gleichermaßen willkommen sind. In
          unserem Fokus stehen gegenseitiger Respekt und Wertschätzung sowie Spaß und Motivation an
          der Arbeit.
        </p>
      </section>
    </>
  );
}
