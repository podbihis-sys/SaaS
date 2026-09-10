"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export interface HeroSlide {
  src: string;
  alt: string;
  href: string;
  label: string;
}

/**
 * Automatisch durchlaufende Diashow im Hero – ein Bild je Produktkategorie,
 * jedes klickbar zur jeweiligen Kategorieseite (Kundenvorgabe: ohne
 * sichtbare Steuerleiste und ohne Badge).
 *
 * Barrierefreiheit: Der Lauf pausiert bei Hover und Tastatur-Fokus. Bei
 * prefers-reduced-motion läuft der Wechsel weiter (Kundenvorgabe), aber als
 * harter Bildwechsel ohne Überblendung.
 */
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
    }
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [slides.length, paused]);

  const current = slides[index];
  if (!current) return null;

  return (
    <div
      className="relative mx-auto w-full max-w-xl xl:max-w-2xl"
      role="group"
      aria-roledescription="Diashow"
      aria-label="Produktkategorien"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Link
        href={current.href}
        className="group block"
        aria-label={`Zur Kategorie ${current.label}`}
      >
        <div className="relative aspect-[3/2]">
          {slides.map((slide, i) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              loading={i === 0 ? "eager" : "lazy"}
              aria-hidden={i !== index}
              className={`absolute inset-0 h-full w-full object-contain object-top mix-blend-multiply ${
                reduced ? "" : "transition-opacity duration-1000"
              } ${i === index ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          {/* Kategorie-Label als Pill auf dem Bild – kostet keine Bauhöhe. */}
          <span className="absolute inset-x-0 bottom-3 flex items-center justify-center">
            <span className="rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-[#1e4a7a] shadow ring-1 ring-slate-200 transition-colors group-hover:bg-[#1e4a7a] group-hover:text-white">
              {current.label}
            </span>
          </span>
        </div>
      </Link>
    </div>
  );
}
