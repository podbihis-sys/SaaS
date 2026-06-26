import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import Gallery from "@/components/Gallery";
import { sortedPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Naturnaher Garten- & Landschaftsbau in der Eifel",
  description: site.description,
  alternates: { canonical: "/" },
};

const badges = [
  "BIOLAND ZERTIFIZIERT",
  "HEIMISCH & BIODIVERS",
  "NACHHALTIGE PFLEGE",
  "PERSÖNLICHE BERATUNG",
];

const competencies = [
  {
    title: "Ökologisch gestaltete Gärten für mehr Biodiversität",
    text: "Wir planen und bauen naturnahe Pflanzanlagen, die heimische Arten fördern und Lebensraum für Bienen, Schmetterlinge und Vögel bieten. Unsere nachhaltigen Gartenkonzepte stärken lokale Ökosysteme und sorgen für blühende Vielfalt direkt vor Ihrer Haustür.",
  },
  {
    title: "Umweltfreundliche Gartenpflege – Ihr grüner Service",
    text: "Wir bieten Ihnen professionelle Gartenpflege, die nachhaltig und ökologisch orientiert ist. Vom biologischen Gehölzschnitt bis zur langfristigen Erhaltung der Artenvielfalt: Unsere Pflegemaßnahmen sorgen für gesunde und natürliche Gärten – zuverlässig, lokal und ökologisch.",
  },
  {
    title: "Persönliche Gartenberatung für nachhaltige Lösungen",
    text: "Eine nachhaltige Gartengestaltung beginnt mit persönlicher Beratung. Wir begleiten Sie von der Erstberatung bis zur Umsetzung individueller Gartenkonzepte. Profitieren Sie von unserer ökologischen Expertise und unseren maßgeschneiderten Lösungen für naturnahe Gärten.",
  },
];

const galabauServices = [
  "Wege- und Terrassenbau",
  "Naturstein und Trockenmauern",
  "Zaun- und Sichtschutzanlagen",
  "Einsaaten",
];

export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-moss-100 via-sand to-moss-50">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-moss-200/50 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-moss-300/40 blur-3xl"
        />
        <div className="container-content relative grid items-center gap-10 py-20 sm:py-28 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-moss-700">
              <span className="h-2 w-2 rounded-full bg-moss-500" />
              Bioland-zertifiziert · seit {site.foundedYear}
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              Naturnaher Garten- und Landschaftsbau
              <span className="text-moss-600"> in der Eifel seit 2015.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-anthracite-700">
              Wir bauen Gärten für Menschen, die zuhause Natur erleben möchten.
              Authentisch, ästhetisch, mit Liebe zum Detail. Dabei setzen wir
              konsequent auf heimische Arten und nachhaltige Materialien aus der
              Region.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/kontakt" className="btn-primary">
                Kontakt aufnehmen
              </Link>
              <Link href="/leistungen" className="btn-secondary">
                Unsere Leistungen
              </Link>
            </div>
          </div>
          <Reveal className="relative">
            <div className="rounded-organic bg-gradient-to-br from-moss-300 to-moss-600 p-1 shadow-xl">
              <div className="flex aspect-[4/3] flex-col justify-end rounded-[1.6rem] bg-gradient-to-br from-moss-400/90 to-moss-700/90 p-8 text-white">
                <p className="font-display text-2xl">
                  „Gärten, die mit dem Standort arbeiten – nicht gegen ihn.“
                </p>
                <p className="mt-3 text-moss-50">
                  {site.owner} · Gärtnermeister
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. Bioland */}
      <section className="container-content py-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Image
            src={site.assets.biolandSeal}
            alt="Bioland-Siegel – zertifizierter Gartenbaubetrieb"
            width={200}
            height={75}
            className="mx-auto mb-6 h-16 w-auto"
          />
          <h2 className="text-3xl sm:text-4xl">
            Bioland-zertifizierter Gartenbau in der Eifel
          </h2>
          <p className="mt-5 text-lg text-anthracite-600">
            Ihr nachhaltiger Partner für ökologische Gartenplanung, Pflanzungen
            und Gartenpflege – zertifiziert nach den hohen Standards von Bioland.
            Gemeinsam schaffen wir lebendige Gärten für Mensch und Natur in der
            Eifel.
          </p>
        </Reveal>
        <ul className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
          {badges.map((badge) => (
            <li
              key={badge}
              className="rounded-full border border-moss-200 bg-moss-50 px-5 py-2 text-sm font-semibold tracking-wide text-moss-700"
            >
              {badge}
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Kompetenzen */}
      <section className="bg-white py-20">
        <div className="container-content">
          <Reveal>
            <h2 className="text-center text-3xl sm:text-4xl">
              Unsere Kompetenzen für Ihren Garten
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {competencies.map((c, i) => (
              <Reveal key={c.title} delay={i * 100}>
                <article className="h-full rounded-organic border border-moss-100 bg-sand p-7">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-moss-100 text-moss-700">
                    <span className="font-display text-xl">{i + 1}</span>
                  </div>
                  <h3 className="text-xl">{c.title}</h3>
                  <p className="mt-3 text-anthracite-600">{c.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Galabau */}
      <section className="container-content py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wider text-moss-600">
              Klassischer Galabau mit Kreativität und Erfahrung? Kein Problem.
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              Garten- und Landschaftsbau – solide, funktional &amp; naturnah
            </h2>
            <p className="mt-5 text-lg text-anthracite-600">
              Ob Wege, Terrassen, Mauern oder Rasenflächen – wir verbinden
              klassisches Galabau-Handwerk mit ökologischer Verantwortung. Mit
              hochwertigen, langlebigen Materialien gestalten wir Außenanlagen,
              die sowohl funktional als auch natürlich wirken. Regional,
              zuverlässig und mit Liebe zum Detail.
            </p>
            <Link href="/leistungen/gartenbau" className="btn-secondary mt-7">
              Mehr zum Galabau
            </Link>
          </Reveal>
          <Reveal delay={100}>
            <ul className="grid gap-4 sm:grid-cols-2">
              {galabauServices.map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-3 rounded-2xl border border-moss-100 bg-white p-5 font-medium text-anthracite-800"
                >
                  <svg className="h-6 w-6 shrink-0 text-moss-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 5. Pools / Schwimmteiche */}
      <section className="bg-anthracite-900 py-20 text-white">
        <div className="container-content grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-3xl text-white sm:text-4xl">
              Schwimmteiche in Bad Münstereifel – natürlich baden im eigenen
              Garten
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-anthracite-200">
              Erleben Sie echtes Badevergnügen im Einklang mit der Natur. Unsere
              Naturpools und Schwimmteiche kommen ganz ohne Chlor aus und reinigen
              sich auf natürliche Weise – mit biologischen Filtersystemen und
              Pflanzenzonen. Für gesundes Wasser, das gut für Mensch und Umwelt
              ist.
            </p>
            <Link href="/pools" className="btn-light mt-7">
              Mehr erfahren
            </Link>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-organic bg-gradient-to-br from-moss-500/30 to-anthracite-700 p-8">
              <ul className="space-y-4">
                {[
                  "Ohne Chlor – natürliche Wasserqualität",
                  "Biologische Filtersysteme & Pflanzenzonen",
                  "Individuell für Ihren Garten geplant",
                  "Steigert Grundstückswert & Artenvielfalt",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-3 text-anthracite-100">
                    <svg className="mt-1 h-5 w-5 shrink-0 text-moss-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
                    </svg>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. Galerie */}
      <section className="container-content py-20">
        <Reveal>
          <h2 className="max-w-3xl text-3xl sm:text-4xl">
            Wir können ja viel erzählen! Machen Sie sich doch selber ein Bild von
            unserer Arbeit.
          </h2>
        </Reveal>
        <Reveal delay={100} className="mt-10">
          <Gallery />
        </Reveal>
      </section>

      {/* 7. Blog-Teaser */}
      <section className="bg-white py-20">
        <div className="container-content">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl">Aus unserem Blog</h2>
            <Link href="/blog" className="font-medium text-moss-700 hover:text-moss-800">
              Alle Beiträge →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {sortedPosts.slice(0, 3).map((post, i) => (
              <Reveal key={post.slug} delay={i * 100}>
                <article className="flex h-full flex-col rounded-organic border border-moss-100 bg-sand p-7">
                  <time className="text-sm text-anthracite-500" dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <h3 className="mt-2 text-xl">
                    <Link href={`/blog/${post.slug}`} className="hover:text-moss-700">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-3 flex-1 text-anthracite-600">{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 font-medium text-moss-700 hover:text-moss-800"
                  >
                    Weiterlesen →
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Testimonials – PLATZHALTER */}
      <section className="container-content py-20">
        <Reveal>
          <h2 className="text-center text-3xl sm:text-4xl">
            Lassen wir die wichtigsten zu Wort kommen: Das sagen unsere Kunden.
          </h2>
        </Reveal>
        {/* ⚠️ PLATZHALTER-INHALT – durch echte Kundenstimmen ersetzen.
            Siehe README › Inhaltspflege. */}
        <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-dashed border-amber-400 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          Platzhalter – hier werden echte Kundenstimmen eingepflegt.
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[1, 2].map((n) => (
            <figure
              key={n}
              className="rounded-organic border border-moss-100 bg-white p-7"
            >
              <blockquote className="text-anthracite-600">
                „Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
                commodo ligula eget dolor. Aenean massa. Cum sociis natoque
                penatibus et magnis dis parturient montes, nascetur ridiculus
                mus.“
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-moss-100 font-display text-moss-700">
                  MM
                </span>
                <span>
                  <span className="block font-semibold text-anthracite-800">
                    Max Mustermann
                  </span>
                  <span className="block text-sm text-anthracite-500">
                    Platzhalter
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA-Abschluss */}
      <section className="container-content pb-24">
        <div className="rounded-organic bg-moss-600 px-8 py-14 text-center text-white">
          <h2 className="text-3xl text-white sm:text-4xl">
            Lassen Sie uns Ihren Garten gemeinsam entwickeln.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-moss-50">
            Von der ersten Idee bis zur langfristigen Pflege – naturnah,
            ökologisch und regional in der Eifel.
          </p>
          <Link href="/kontakt" className="btn-light mt-8">
            Jetzt Beratung anfragen
          </Link>
        </div>
      </section>
    </>
  );
}
