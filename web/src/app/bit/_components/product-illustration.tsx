import type { CategoryId } from "../_data/catalog";

/**
 * Markenkonforme SVG-Illustrationen je Produktkategorie.
 * Ersetzen externe Produktfotos und halten die Seite asset-frei.
 */
export function ProductIllustration({
  category,
  className,
}: {
  category: CategoryId;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`bg-${category}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f2742" />
          <stop offset="100%" stopColor="#1e4a7a" />
        </linearGradient>
        <linearGradient id={`tube-${category}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#cdd9e8" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#bg-${category})`} />
      <Pattern category={category} />
      <CategoryArt category={category} />
    </svg>
  );
}

function Pattern({ category }: { category: CategoryId }) {
  return (
    <g opacity="0.08" stroke="#ffffff" strokeWidth="1.5" fill="none">
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1={i * 60 - 40} y1="0" x2={i * 60 + 80} y2="300" />
      ))}
    </g>
  );
}

function CategoryArt({ category }: { category: CategoryId }) {
  const accent = "#f59e0b";
  switch (category) {
    case "schrumpfschlauch":
      return (
        <g>
          <path d="M40 150 H170" stroke="#9fb6cf" strokeWidth="34" strokeLinecap="round" fill="none" />
          <path d="M170 150 C 210 150 210 150 250 150" stroke={accent} strokeWidth="34" fill="none" />
          <path d="M250 150 H360" stroke="url(#tube-schrumpfschlauch)" strokeWidth="20" strokeLinecap="round" fill="none" />
          <path d="M250 138 l 14 -10 M250 162 l 14 10" stroke="#ffffff" strokeWidth="3" />
          <circle cx="350" cy="150" r="6" fill="#0f2742" />
        </g>
      );
    case "isolierschlauch":
      return (
        <g fill="none" strokeLinecap="round">
          <path d="M50 220 C 130 120, 270 320, 350 200" stroke="url(#tube-isolierschlauch)" strokeWidth="22" />
          <path d="M50 180 C 130 80, 270 280, 350 160" stroke={accent} strokeWidth="14" opacity="0.9" />
          <path d="M50 110 C 130 30, 270 230, 350 110" stroke="#9fb6cf" strokeWidth="10" />
        </g>
      );
    case "geflechtschlauch":
      return (
        <g stroke="url(#tube-geflechtschlauch)" strokeWidth="6" fill="none" opacity="0.95">
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={`a${i}`} d={`M30 ${70 + i * 26} q 60 30 120 0 t 120 0 t 120 0`} />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={`b${i}`} d={`M30 ${70 + i * 26} q 60 -30 120 0 t 120 0 t 120 0`} stroke={accent} opacity="0.5" />
          ))}
        </g>
      );
    case "wellrohr":
      return (
        <g fill="none" strokeLinecap="round">
          <path
            d="M40 150 q 12 -34 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0"
            stroke="url(#tube-wellrohr)"
            strokeWidth="30"
          />
          <path
            d="M40 150 q 12 -34 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0"
            stroke={accent}
            strokeWidth="3"
          />
        </g>
      );
    case "kabelbinder":
      return (
        <g fill="none" strokeLinecap="round">
          <path d="M120 60 C 60 120, 60 200, 200 200 C 320 200, 320 110, 250 90" stroke="url(#tube-kabelbinder)" strokeWidth="14" />
          <rect x="180" y="186" width="46" height="30" rx="6" fill={accent} transform="rotate(8 200 200)" />
          <path d="M250 90 l 18 -6 l -4 18 z" fill="#ffffff" />
        </g>
      );
    case "konfektion":
      return (
        <g fill="none" strokeLinecap="round">
          <path d="M60 110 H150" stroke="url(#tube-konfektion)" strokeWidth="24" />
          <path d="M180 110 H270" stroke="url(#tube-konfektion)" strokeWidth="24" />
          <path d="M300 110 H360" stroke="url(#tube-konfektion)" strokeWidth="24" />
          <g stroke={accent} strokeWidth="3" strokeDasharray="4 6">
            <path d="M165 80 V200 M285 80 V200" />
          </g>
          <path d="M60 200 H360" stroke="#9fb6cf" strokeWidth="14" />
        </g>
      );
  }
}
