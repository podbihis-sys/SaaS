import type { CSSProperties } from "react";

/**
 * The <adriawebcode/> wordmark from the final logo spec: JetBrains Mono Bold
 * (ligatures off), lowercase, on a navy chip with turquoise brackets and an
 * optional blinking cursor. Sizes follow the spec sheet: hero / header
 * navigation / footer & e-mail / document (static, no cursor).
 */

const NAVY = "#0B1F33";
const ACCENT = "#33C6DC";

const SIZES = {
  hero: { font: 26, pad: "18px 26px", radius: 14, cursorW: 12, tracking: "-1px" },
  nav: { font: 15, pad: "9px 14px", radius: 10, cursorW: 7, tracking: "-0.5px" },
  sm: { font: 11, pad: "6px 10px", radius: 7, cursorW: 5, tracking: "0" },
  doc: { font: 12, pad: "7px 11px", radius: 8, cursorW: 6, tracking: "-0.5px" },
} as const;

const MONO: CSSProperties = {
  fontFamily: "var(--font-logo), 'JetBrains Mono', Consolas, Menlo, monospace",
  fontVariantLigatures: "none",
  fontFeatureSettings: "'liga' 0, 'calt' 0",
  fontWeight: 700,
};

export function Logo({
  size = "nav",
  inverted = false,
  cursor = false,
}: {
  size?: keyof typeof SIZES;
  /** White chip with navy name — for placement on dark grounds. */
  inverted?: boolean;
  /** Blinking cursor block (website use only, never on documents). */
  cursor?: boolean;
}) {
  const s = SIZES[size];
  const chipBg = inverted ? "#FFFFFF" : NAVY;
  const nameColor = inverted ? NAVY : "#FFFFFF";

  return (
    <span
      className="inline-flex items-center"
      style={{ background: chipBg, borderRadius: s.radius, padding: s.pad, gap: 1 }}
    >
      <span style={{ ...MONO, fontSize: s.font, color: ACCENT }}>&lt;</span>
      <span style={{ ...MONO, fontSize: s.font, color: nameColor, letterSpacing: s.tracking }}>
        adriawebcode<span style={{ color: ACCENT }}>/&gt;</span>
      </span>
      {cursor && (
        <span
          aria-hidden
          className="logo-cursor"
          style={{
            width: s.cursorW,
            height: s.font,
            background: ACCENT,
            marginLeft: Math.max(4, Math.round(s.font / 3)),
          }}
        />
      )}
    </span>
  );
}
