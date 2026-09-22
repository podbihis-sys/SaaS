import type { Metadata } from "next";
import Link from "next/link";
import {
  Apple,
  ArrowRight,
  BadgeEuro,
  Coffee,
  CupSoda,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Laptop,
  Lightbulb,
  PartyPopper,
  PiggyBank,
  Trophy,
  Users,
} from "lucide-react";
import { COMPANY } from "../../_data/catalog";
import { JOBS, jobShortLabelEn } from "../../_data/jobs";
import { getCmsJobs, localizeJob } from "../../_data/misc-server";

/**
 * Englische Karriere-Seite – gleicher Aufbau wie /bit/karriere. Die
 * Stellenausschreibungen werden im CMS auf Deutsch gepflegt und verlinken
 * auf die deutschen Stellen-Unterseiten.
 */

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/bit/en/career" },
  title: "Career",
  description:
    "Career at BIT: sales, warehouse and apprenticeship in wholesale and foreign trade management – with the family-run specialist for heat-shrink and insulating tubing.",
};

const BENEFITS = [
  { icon: BadgeEuro, title: "Fair salary & commission", text: "A fair salary and attractive commission models." },
  { icon: Trophy, title: "Performance-based bonuses", text: "Performance is noticed here – and rewarded." },
  {
    icon: Dumbbell,
    title: "In-house fitness area",
    text: "Our own fitness area which, like our in-house sunbed, may also be used in your free time.",
  },
  {
    icon: Coffee,
    title: "Fully equipped kitchen",
    text: "A fully equipped kitchen including a state-of-the-art coffee machine.",
  },
  { icon: Apple, title: "Fresh fruit & vegetables", text: "Fresh fruit and vegetables every day for your health." },
  { icon: CupSoda, title: "Soft drinks for everyone", text: "A wide selection of soft drinks for all staff." },
  {
    icon: Laptop,
    title: "Modern workplace",
    text: "Our advanced IT infrastructure makes work easier and more enjoyable.",
  },
  {
    icon: Lightbulb,
    title: "Everyone is different",
    text: "We support individual development, your own ideas are always welcome and problems are solved as quickly as possible.",
  },
  {
    icon: PiggyBank,
    title: "We think of your future",
    text: "Contributions to capital-forming benefits and company pension schemes beyond the statutory requirements.",
  },
];

const ENGAGEMENT = [
  { icon: GraduationCap, text: "Training company since our foundation" },
  { icon: Users, text: "Internships for pupils from local schools" },
  { icon: Lightbulb, text: "Further training opportunities" },
  { icon: HeartPulse, text: "Workplace health promotion" },
  { icon: PartyPopper, text: "Company events" },
];

export default async function EnglishCareerPage() {
  // CMS-first: Stellen aus bit_jobs; Fallback ist die eingebaute Liste.
  const jobs = (await getCmsJobs(JOBS)).map((j) => localizeJob(j, "en"));
  return (
    <>
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="bit-page-hero container py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">Career</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Career at BIT
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            Sales, warehouse or apprenticeship: become part of a family-like team at the
            specialist for heat-shrink and insulating tubing in Swisttal-Heimerzheim.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {jobs.map((j) => (
              <Link
                key={j.id}
                href={`/bit/en/career/${j.id}`}
                className="rounded-full border border-slate-600 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-[#38bdf8] hover:text-[#38bdf8]"
              >
                {jobShortLabelEn(j)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Open positions
        </h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/bit/en/career/${job.id}`}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-7 transition-colors hover:border-[#1e4a7a]"
            >
              <h3 className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-[#1e4a7a]">
                {job.title}
              </h3>
              <p className="mt-3 flex-1 leading-relaxed text-slate-600">{job.intro}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]">
                View job advertisement
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-8 max-w-3xl leading-relaxed text-slate-700">
          Do you recognise yourself in one of these profiles? Or is this the job you are aiming
          for? Then we look forward to getting to know you in person.
        </p>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="container">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Who we are
            </h2>
            <p className="mt-4 leading-relaxed text-slate-700">
              {COMPANY.shortName} is a family-run, successful company specialising in the
              distribution of heat-shrink and insulating tubing. Our current team of 25 employees
              forms a dynamic, cross-departmental team in purchasing, sales, administration,
              warehouse and production.
            </p>
            <p className="mt-4 leading-relaxed text-slate-700">
              Would you like to learn more about {COMPANY.shortName}?{" "}
              <Link href="/bit/en/about-bit" className="text-[#1e4a7a] underline hover:no-underline">
                Get to know BIT
              </Link>
              .
            </p>
            <h2 className="mt-10 text-2xl font-bold tracking-tight text-slate-900">Benefits</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              In addition to exciting tasks, we can also offer a number of benefits:
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-3xl font-medium leading-relaxed text-slate-800">
            Become part of our team and start into an even more successful future with us!
          </p>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          We are committed across the board
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENGAGEMENT.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 p-5 text-slate-700"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#38bdf8]/15 text-[#1d4ed8]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="self-center font-medium">{text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-12 max-w-4xl border-t border-slate-200 pt-6 text-sm leading-relaxed text-slate-600">
          Everyone is equally welcome at BIT – regardless of gender, nationality, ethnic and
          social origin, religion or belief, disability, age or sexual orientation. Our focus is
          on mutual respect and appreciation as well as fun and motivation at work.
        </p>
      </section>
    </>
  );
}
