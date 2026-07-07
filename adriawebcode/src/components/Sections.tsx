import type { Dictionary } from "@/i18n/get-dictionary";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { GlowCard } from "./ui/GlowCard";

const SERVICE_ICONS = [
  <path key="0" d="M4 6h16M4 6v12h16V6M4 6l2-2h12l2 2M9 14l2 2 4-5" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="1" d="M4 12a8 8 0 1 1 2.3 5.6M4 12H2m2 0h3m5-8v2m0 12v2m8-8h-2" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="2" d="M11 4a7 7 0 1 0 4.9 12L21 21m-5-10h-4m2-2v4" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="3" d="M12 3a15 15 0 0 0 0 18a15 15 0 0 0 0-18ZM3 12h18M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="4" d="M4 7h16l-1.5 10a2 2 0 0 1-2 1.7h-9A2 2 0 0 1 5.5 17L4 7Zm4 0V6a4 4 0 0 1 8 0v1" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="5" d="M10.5 6.5 12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5ZM5 15l.9 2.1L8 18l-2.1.9L5 21l-.9-2.1L2 18l2.1-.9L5 15Zm13 1 .7 1.6L20.3 18l-1.6.7L18 20.3l-.7-1.6L15.7 18l1.6-.7L18 16Z" strokeLinecap="round" strokeLinejoin="round" />,
];

function ServiceIcon({ i, size = "h-6 w-6" }: { i: number; size?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={size} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      {SERVICE_ICONS[i]}
    </svg>
  );
}

/** Editorial section header: a monospace wayfinding tag + a large title. */
function SectionHead({
  tag,
  title,
  lead,
  align = "left",
}: {
  tag: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className={`section-index ${align === "center" ? "justify-center" : ""}`}>
        <span className="text-adriatic-400">/</span> {tag.toLowerCase()}
      </p>
      <h2 className="section-title mt-4">{title}</h2>
      {lead && <p className="mt-5 text-[1.02rem] leading-relaxed text-slate-400">{lead}</p>}
    </Reveal>
  );
}

export function TrustMarquee({ dict }: { dict: Dictionary["trust"] }) {
  const items = [...dict.items, ...dict.items];
  return (
    <section className="relative border-y border-white/[0.06] bg-white/[0.015] py-7" aria-label={dict.title}>
      <div className="container-site mb-5 flex items-center gap-4">
        <span className="h-px flex-1 hairline" aria-hidden />
        <p className="whitespace-nowrap text-[0.7rem] font-medium uppercase tracking-[0.2em] text-slate-500">
          {dict.title}
        </p>
        <span className="h-px flex-1 hairline" aria-hidden />
      </div>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-[#04060f] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-[#04060f] to-transparent" />
        <div className="flex w-max animate-marquee gap-10">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-2.5 whitespace-nowrap font-display text-lg font-medium text-slate-400">
              <span className="h-1 w-1 rounded-full bg-adriatic-400/70" aria-hidden />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Services({ dict }: { dict: Dictionary["services"] }) {
  // Bento that fills without gaps: a tall 2x2 feature, four compact tiles,
  // and a full-width banner across the bottom.
  const spans = [
    "sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2",
    "lg:col-span-1",
    "lg:col-span-1",
    "lg:col-span-1",
    "lg:col-span-1",
    "sm:col-span-2 lg:col-span-4",
  ];

  return (
    <section id="services" className="scroll-mt-24 py-24 sm:py-32">
      <div className="container-site">
        <SectionHead tag={dict.kicker} title={dict.title} lead={dict.subtitle} />
        <Stagger className="mt-14 grid auto-rows-[minmax(9.5rem,1fr)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dict.items.map((item, i) => {
            const featured = i === 0;
            const wide = i === dict.items.length - 1;
            return (
              <StaggerItem key={item.title} className={`${spans[i] ?? "lg:col-span-1"} min-h-0`}>
                <GlowCard className="h-full">
                  <div
                    className={`flex h-full ${
                      wide ? "flex-col gap-4 p-7 sm:flex-row sm:items-center sm:gap-6" : "flex-col p-6"
                    } ${featured ? "p-8" : ""}`}
                  >
                    <div
                      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-adriatic-500/10 text-adriatic-300 ring-1 ring-inset ring-adriatic-400/20 ${
                        featured ? "mb-5 h-14 w-14" : wide ? "h-12 w-12" : "mb-4 h-11 w-11"
                      }`}
                    >
                      <ServiceIcon i={i} size={featured ? "h-7 w-7" : "h-5 w-5"} />
                    </div>
                    <div className={wide ? "flex-1" : "flex flex-1 flex-col"}>
                      <h3
                        className={`font-display font-semibold text-white ${
                          featured ? "text-2xl" : "text-lg"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={`mt-2 leading-relaxed text-slate-400 ${
                          featured ? "max-w-md text-[0.98rem]" : "text-sm"
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </GlowCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

export function Process({ dict }: { dict: Dictionary["process"] }) {
  return (
    <section id="process" className="relative scroll-mt-24 overflow-hidden border-y border-white/[0.06] bg-white/[0.015] py-24 sm:py-32">
      <div className="container-site">
        <SectionHead tag={dict.kicker} title={dict.title} align="center" />
        <Stagger className="relative mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div
            className="absolute left-0 right-0 top-8 hidden h-px hairline lg:block"
            aria-hidden
          />
          {dict.steps.map((step, i) => (
            <StaggerItem key={step.title}>
              <div className="relative">
                <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-adriatic-400/25 bg-[#070b1a] font-display text-2xl font-semibold text-adriatic-300 shadow-[0_0_40px_-12px_rgba(60,197,201,0.5)]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{step.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-adriatic-400" fill="none" aria-hidden>
      <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Pricing({ dict }: { dict: Dictionary["pricing"] }) {
  return (
    <section id="pricing" className="scroll-mt-24 py-24 sm:py-32">
      <div className="container-site">
        <SectionHead tag={dict.kicker} title={dict.title} lead={dict.subtitle} align="center" />
        <Stagger className="mt-16 grid items-stretch gap-5 lg:grid-cols-3">
          {dict.plans.map((plan, i) => {
            const highlighted = i === 1;
            return (
              <StaggerItem key={plan.name} className={highlighted ? "lg:-my-3" : ""}>
                <GlowCard
                  glow={highlighted ? "rgba(60,197,201,0.2)" : "rgba(60,197,201,0.12)"}
                  className={`h-full ${highlighted ? "border-adriatic-400/40 shadow-[0_30px_80px_-40px_rgba(33,168,174,0.6)]" : ""}`}
                >
                  <div className="flex h-full flex-col p-8">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl font-semibold text-white">{plan.name}</h3>
                      {highlighted && (
                        <span className="rounded-full bg-adriatic-400/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-adriatic-300 ring-1 ring-inset ring-adriatic-400/30">
                          {dict.popular}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 min-h-10 text-sm text-slate-400">{plan.desc}</p>
                    <div className="mt-6 flex items-end gap-2">
                      <span className="mb-1.5 text-sm text-slate-400">{dict.from}</span>
                      <span className="font-display text-[2.75rem] font-semibold leading-none tracking-tight text-white">
                        {plan.price}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {plan.eurHint ? `${plan.eurHint} · ` : ""}
                      {dict.once}
                    </p>
                    <div className="my-6 h-px w-full hairline" />
                    <ul className="flex flex-col gap-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <CheckIcon />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <a href="#contact" className={`${highlighted ? "btn-primary" : "btn-secondary"} mt-8 w-full`}>
                      {dict.cta}
                    </a>
                  </div>
                </GlowCard>
              </StaggerItem>
            );
          })}
        </Stagger>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-relaxed text-slate-500">{dict.note}</p>
        </Reveal>
      </div>
    </section>
  );
}

export function Maintenance({ dict }: { dict: Dictionary["maintenance"] }) {
  return (
    <section id="maintenance" className="scroll-mt-24 border-y border-white/[0.06] bg-white/[0.015] py-24 sm:py-32">
      <div className="container-site">
        <SectionHead tag={dict.kicker} title={dict.title} lead={dict.subtitle} align="center" />
        <Stagger className="mt-16 grid gap-5 lg:grid-cols-3">
          {dict.plans.map((plan, i) => {
            const highlighted = i === 1;
            return (
              <StaggerItem key={plan.name}>
                <GlowCard
                  glow="rgba(255,107,74,0.14)"
                  className={`h-full ${highlighted ? "border-coral-500/35" : ""}`}
                >
                  <div className="flex h-full flex-col p-8">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl font-semibold text-white">{plan.name}</h3>
                      {highlighted && (
                        <span className="rounded-full bg-coral-500/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-coral-400 ring-1 ring-inset ring-coral-500/30">
                          {dict.recommended}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{plan.desc}</p>
                    <div className="mt-6 flex items-end gap-1.5">
                      <span className="font-display text-[2.5rem] font-semibold leading-none tracking-tight text-white">
                        {plan.price}
                      </span>
                      <span className="mb-1 text-sm text-slate-500">{dict.perMonth}</span>
                    </div>
                    {plan.eurHint && <p className="mt-1.5 text-xs text-slate-500">{plan.eurHint}</p>}
                    <div className="my-6 h-px w-full hairline" />
                    <ul className="flex flex-col gap-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <CheckIcon />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <a href="#contact" className="btn-secondary mt-8 w-full">
                      {dict.cta}
                    </a>
                  </div>
                </GlowCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

export function Regions({ dict }: { dict: Dictionary["regions"] }) {
  return (
    <section className="py-24 sm:py-32">
      <div className="container-site">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHead tag={dict.kicker} title={dict.title} lead={dict.subtitle} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Reveal delay={0.05}>
              <GlowCard className="h-full">
                <div className="p-7">
                  <p className="mb-4 text-2xl" aria-hidden>🇩🇪 🇦🇹 🇨🇭</p>
                  <h3 className="mb-2 font-display text-lg font-semibold text-white">{dict.dach.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{dict.dach.desc}</p>
                </div>
              </GlowCard>
            </Reveal>
            <Reveal delay={0.14}>
              <GlowCard glow="rgba(255,107,74,0.14)" className="h-full sm:mt-8">
                <div className="p-7">
                  <p className="mb-4 text-2xl" aria-hidden>🇭🇷 🇧🇦 🇷🇸 🇲🇪</p>
                  <h3 className="mb-2 font-display text-lg font-semibold text-white">{dict.adria.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{dict.adria.desc}</p>
                </div>
              </GlowCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
