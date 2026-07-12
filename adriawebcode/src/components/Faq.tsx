import type { Dictionary } from "@/i18n/get-dictionary";

/**
 * Every answer is visible — a reader (and a crawler) never has to click to
 * see content. On large screens a sticky index of questions runs alongside.
 */
export function Faq({ dict }: { dict: Dictionary["faq"] }) {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-rule py-24 sm:py-32">
      <div className="container-site grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div>
            <h2 className="section-title">{dict.title}</h2>
            <nav aria-label={dict.title} className="mt-8 hidden lg:block">
              <ul className="sticky top-28 flex flex-col gap-2.5 border-l border-rule pl-5">
                {dict.items.map((item, i) => (
                  <li key={item.q}>
                    <a
                      href={`#faq-${i}`}
                      className="block text-sm leading-snug text-muted transition-colors hover:text-tiefsee"
                    >
                      {item.q}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
        <div className="lg:col-span-8">
          {dict.items.map((item, i) => (
            <div key={item.q} id={`faq-${i}`} className="scroll-mt-28 border-b border-rule py-7 first:pt-0">
              <h3 className="text-[1.1rem] font-semibold leading-snug text-ink">{item.q}</h3>
              <p className="mt-2.5 max-w-[68ch] text-[0.95rem] leading-relaxed text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
