import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return { title: dict.legal.imprintTitle, robots: { index: false } };
}

export default async function ImprintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <main className="container-site max-w-3xl py-28">
      <Link href={`/${locale}`} className="text-sm text-adriatic-300 hover:text-adriatic-200">
        ← adriawebcode
      </Link>
      <h1 className="mt-6 font-display text-4xl font-bold text-white">{dict.legal.imprintTitle}</h1>
      <div className="prose-invert mt-8 flex flex-col gap-4 text-sm leading-relaxed text-slate-300">
        <p>
          <strong className="text-white">adriawebcode</strong>
          <br />
          {/* TODO: Vollständige Anschrift des Unternehmens eintragen */}
          Inhaber: [Name eintragen]
          <br />
          [Straße und Hausnummer]
          <br />
          [PLZ und Ort]
        </p>
        <p>
          E-Mail: hello@adriawebcode.com
          <br />
          {/* TODO: USt-IdNr. / Steuernummer eintragen */}
          USt-IdNr.: [eintragen]
        </p>
        <p>
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: [Name eintragen]
        </p>
      </div>
    </main>
  );
}
