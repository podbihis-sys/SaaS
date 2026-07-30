"use client";

import { useEffect, useState } from "react";

export interface HeroSlide {
  src: string;
  alt: string;
}

/** Automatisch wechselnde Diashow für den Hero-Bereich (rechte Seite) – große Bilder ohne Rahmen. */
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div className="relative mx-auto w-full max-w-lg xl:max-w-xl">
      <div className="relative aspect-square">
        {slides.map((slide, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            loading={i === 0 ? "eager" : "lazy"}
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
        <div className="mt-8 flex justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              onClick={() => setIndex(i)}
              aria-label={`Bild ${i + 1} anzeigen`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-[#1e4a7a]" : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
