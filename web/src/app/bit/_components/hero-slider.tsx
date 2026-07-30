"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";

export interface HeroSlide {
  src: string;
  alt: string;
}

/**
 * Automatisch wechselnde Diashow für den Hero-Bereich – große Bilder ohne
 * Rahmen. Barrierefrei nach WCAG 2.2.2: pausierbar über eine sichtbare
 * Taste; bei prefers-reduced-motion startet die Diashow pausiert.
 */
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPaused(true);
    }
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [slides.length, paused]);

  return (
    <div
      className="relative mx-auto w-full max-w-xl xl:max-w-2xl"
      role="group"
      aria-roledescription="Diashow"
      aria-label="Produktbilder"
    >
      <div className="relative aspect-square">
        {slides.map((slide, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            loading={i === 0 ? "eager" : "lazy"}
            aria-hidden={i !== index}
            className={`absolute inset-0 h-full w-full object-contain mix-blend-multiply transition-opacity duration-1000 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
      <div className="absolute -bottom-4 left-0 rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-xl ring-1 ring-slate-200">
        <div className="text-xl font-bold text-[#1e4a7a]">1.000+</div>
        <div className="text-[11px] uppercase tracking-wide text-slate-500">Artikel ab Lager</div>
      </div>

      {slides.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Diashow abspielen" : "Diashow pausieren"}
            className="mr-2 flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition-colors hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
          >
            {paused ? (
              <Play className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Pause className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              onClick={() => setIndex(i)}
              aria-label={`Bild ${i + 1} von ${slides.length} anzeigen`}
              aria-current={i === index ? "true" : undefined}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-[#1e4a7a]" : "w-2 bg-slate-400 hover:bg-slate-500"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
