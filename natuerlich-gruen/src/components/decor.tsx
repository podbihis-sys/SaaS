import type { CSSProperties } from "react";

/**
 * Thematische Deko-Elemente für den Galabau-Look: Blatt-Akzent,
 * organische Hügel-Übergänge zwischen Sektionen und aufsteigende
 * Pollen/Samen. Alles rein dekorativ (aria-hidden) und CSS-animiert –
 * bei `prefers-reduced-motion` stehen die Animationen global still.
 */

export function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`inline-block text-moss-500 ${className}`}
    >
      <path
        fill="currentColor"
        d="M6.05 8.05c-2.73 2.73-2.73 7.15-.02 9.88 1.47-3.4 4.09-6.24 7.36-7.93-2.77 2.34-4.71 5.61-5.39 9.32 2.6 1.23 5.8.78 7.95-1.37C19.43 14.47 20 4 20 4S9.53 4.57 6.05 8.05z"
      />
    </svg>
  );
}

/** Sanfter Hügel-/Wiesenrand als Übergang zwischen Sektionen. */
export function OrganicDivider({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 70"
      preserveAspectRatio="none"
      className={`block h-10 w-full sm:h-16 ${flip ? "rotate-180" : ""} ${className}`}
    >
      <path
        d="M0 70 L0 42 Q 180 4 360 30 T 720 26 T 1080 36 T 1440 20 L1440 70 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Aufsteigende Pollen/Samen (für den Hero). */
export function Pollen({ count = 7 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="pollen"
          style={
            {
              left: `${8 + i * (84 / count)}%`,
              bottom: "6%",
              width: i % 2 ? 7 : 5,
              height: i % 2 ? 7 : 5,
              animationDuration: `${9 + (i % 4) * 2.5}s`,
              animationDelay: `${i * 1.3}s`,
              "--drift": `${i % 2 ? -26 : 30}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
