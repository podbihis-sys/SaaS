"use client";

import { useId } from "react";

/**
 * Flaggen für die Sprachumschaltung (Kundenvorgabe: Flaggen statt „DE/EN").
 * Inline-SVG, damit keine Bilddateien nachgeladen werden müssen.
 */
export function FlagIcon({ code, className = "" }: { code: "de" | "gb"; className?: string }) {
  const id = useId();
  if (code === "de") {
    return (
      <svg viewBox="0 0 5 3" className={className} aria-hidden="true" focusable="false">
        <rect width="5" height="3" fill="#000" />
        <rect width="5" height="2" y="1" fill="#D00" />
        <rect width="5" height="1" y="2" fill="#FFCE00" />
      </svg>
    );
  }
  const clipAll = `${id}-all`;
  const clipQuarters = `${id}-q`;
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden="true" focusable="false">
      <clipPath id={clipAll}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={clipQuarters}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${clipAll})`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path
          d="M0,0 L60,30 M60,0 L0,30"
          clipPath={`url(#${clipQuarters})`}
          stroke="#C8102E"
          strokeWidth="4"
        />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}
