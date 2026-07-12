import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Kalkweiß & Tiefsee" — one light surface, one deep accent, hairlines.
        kalk: "#F2F4F5",
        paper: "#FFFFFF",
        ink: "#1A2126",
        muted: "#46525A",
        tiefsee: {
          DEFAULT: "#0E4B5A",
          press: "#093642",
        },
        rule: "#C9D2D6",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
