import type { Dictionary } from "@/i18n/get-dictionary";
import { Reveal, Stagger, StaggerItem } from "./Reveal";

const SERVICE_ICONS = [
  <path key="0" d="M4 6h16M4 6v12h16V6M4 6l2-2h12l2 2M9 14l2 2 4-5" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="1" d="M4 12a8 8 0 1 1 2.3 5.6M4 12H2m2 0h3m5-8v2m0 12v2m8-8h-2" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="2" d="M11 4a7 7 0 1 0 4.9 12L21 21m-5-10h-4m2-2v4" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="3" d="M12 3a15 15 0 0 0 0 18a15 15 0 0 0 0-18ZM3 12h18M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="4" d="M4 7h16l-1.5 10a2 2 0 0 1-2 1.7h-9A2 2 0 0 1 5.5 17L4 7Zm4 0V6a4 4 0 0 1 8 0v1" strokeLinecap="round" strokeLinejoin="round" />,
  <path key="5" d="M10.5 6.5 12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5ZM5 15l.9 2.1L8 18l-2.1.9L5 21l-.9-2.1L2 18l2.1-.9L5 15Zm13 1 .7 1.6L20.3 18l-1.6.7L18 20.3l-.7-1.6L15.7 18l1.6-.7L18 16Z" strokeLinecap="round" strokeLinejoin="round" />,
];

export function TrustMarquee({ dict }: { dict: Dictionary["trust"] }) {
  const items = [...dict.items, ...dict.items];
  return (
    <section className="border-y border-white/5 bg-navy-900/40 py-8" aria-label={dict.title}>
      <p className="container-site mb-5 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
        {dict.title}
      </p>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-navy-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-navy-950 to-transparent" />
        <div className="flex w-max animate-marquee gap-12">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-adriatic-400" aria-hidden />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Services({ dict }: { dict: Dictionary["services"] }) {
  return (
    <section id="services" className="scroll-mt-24 py-24">
      <div className="container-site">
        <Reveal>
          <h2 className="section-title max-w-2xl">{dict.title}</h2>
          <p className="mt-4 max-w-2xl text-slate-400">{dict.subtitle}</p>
        </Reveal>
        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dict.items.map((item, i) => (
            <StaggerItem key={item.title}>
              <article className="card-glass group h-full p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-adriatic-400/40 hover:bg-white/[0.07]">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-adriatic-500/25 to-adriatic-500/5 text-adriatic-300 transition group-hover:scale-110">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                    {SERVICE_ICONS[i]}
                  </svg>
                </div>
                <h3 className="mb-2.5 font-display text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function Process({ dict }: { dict: Dictionary["process"] }) {
  return (
    <section id="process" className="scroll-mt-24 border-y border-white/5 bg-navy-900/30 py-24">
      <div className="container-site">
        <Reveal className="text-center">
          <h2 className="section-title">{dict.title}</h2>
        </Reveal>
        <Stagger className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {dict.steps.map((step, i) => (
            <StaggerItem key={step.title}>
              <div className="relative h-full">
                {i < dict.steps.length - 1 && (
                  <div
                    className="absolute left-14 top-7 hidden h-px w-[calc(100%-2rem)] bg-gradient-to-r from-adriatic-400/50 to-transparent lg:block"
                    aria-hidden
                  />
                )}
                <div className="relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-adriatic-400/30 bg-navy-900 font-display text-xl font-bold text-adriatic-300">
                  {i + 1}
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
      <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Pricing({ dict }: { dict: Dictionary["pricing"] }) {
  return (
    <section id="pricing" className="scroll-mt-24 py-24">
      <div className="container-site">
        <Reveal className="text-center">
          <h2 className="section-title">{dict.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">{dict.subtitle}</p>
        </Reveal>
        <Stagger className="mt-14 grid gap-6 lg:grid-cols-3">
          {dict.plans.map((plan, i) => {
            const highlighted = i === 1;
            return (
              <StaggerItem key={plan.name}>
                <article
                  className={`relative flex h-full flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1.5 ${
                    highlighted
                      ? "border-adriatic-400/50 bg-gradient-to-b from-adriatic-500/15 to-white/[0.03] shadow-2xl shadow-adriatic-500/10"
                      : "border-white/10 bg-white/[0.04] hover:border-white/25"
                  }`}
                >
                  {highlighted && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-adriatic-500 to-adriatic-400 px-4 py-1 text-xs font-bold text-navy-950">
                      {dict.popular}
                    </span>
                  )}
                  <h3 className="font-display text-xl font-semibold text-white">{plan.name}</h3>
                  <p className="mt-2 min-h-10 text-sm text-slate-400">{plan.desc}</p>
                  <p className="mt-5 flex items-baseline gap-2">
                    <span className="text-sm text-slate-400">{dict.from}</span>
                    <span className="font-display text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-slate-500">{dict.once}</span>
                  </p>
                  {plan.eurHint && <p className="mt-1 text-xs text-slate-500">{plan.eurHint}</p>}
                  <ul className="mt-7 flex flex-col gap-3">
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
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-10 max-w-3xl text-center text-sm text-slate-500">{dict.note}</p>
        </Reveal>
      </div>
    </section>
  );
}

export function Maintenance({ dict }: { dict: Dictionary["maintenance"] }) {
  return (
    <section id="maintenance" className="scroll-mt-24 border-y border-white/5 bg-navy-900/30 py-24">
      <div className="container-site">
        <Reveal className="text-center">
          <h2 className="section-title">{dict.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">{dict.subtitle}</p>
        </Reveal>
        <Stagger className="mt-14 grid gap-6 lg:grid-cols-3">
          {dict.plans.map((plan, i) => {
            const highlighted = i === 1;
            return (
              <StaggerItem key={plan.name}>
                <article
                  className={`relative flex h-full flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1.5 ${
                    highlighted
                      ? "border-coral-500/50 bg-gradient-to-b from-coral-500/10 to-white/[0.03]"
                      : "border-white/10 bg-white/[0.04] hover:border-white/25"
                  }`}
                >
                  {highlighted && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-coral-500 to-coral-400 px-4 py-1 text-xs font-bold text-navy-950">
                      {dict.recommended}
                    </span>
                  )}
                  <h3 className="font-display text-xl font-semibold text-white">{plan.name}</h3>
                  <p className="mt-2 text-sm text-slate-400">{plan.desc}</p>
                  <p className="mt-5 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-slate-500">{dict.perMonth}</span>
                  </p>
                  {plan.eurHint && <p className="mt-1 text-xs text-slate-500">{plan.eurHint}</p>}
                  <ul className="mt-7 flex flex-col gap-3">
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
                </article>
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
    <section className="py-24">
      <div className="container-site">
        <Reveal>
          <h2 className="section-title max-w-2xl">{dict.title}</h2>
          <p className="mt-4 max-w-3xl text-slate-400">{dict.subtitle}</p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Reveal delay={0.05}>
            <article className="card-glass relative h-full overflow-hidden p-8">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-adriatic-500/10 blur-2xl" aria-hidden />
              <p className="mb-3 text-3xl" aria-hidden>
                🇩🇪 🇦🇹 🇨🇭
              </p>
              <h3 className="mb-2 font-display text-xl font-semibold text-white">{dict.dach.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{dict.dach.desc}</p>
            </article>
          </Reveal>
          <Reveal delay={0.15}>
            <article className="card-glass relative h-full overflow-hidden p-8">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-coral-500/10 blur-2xl" aria-hidden />
              <p className="mb-3 text-3xl" aria-hidden>
                🇭🇷 🇧🇦 🇷🇸 🇲🇪
              </p>
              <h3 className="mb-2 font-display text-xl font-semibold text-white">{dict.adria.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{dict.adria.desc}</p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
