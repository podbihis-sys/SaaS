import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Markenfarben – warmes Grün & dunkles Anthrazit
        moss: {
          50: "#f3f8f0",
          100: "#e3efdd",
          200: "#c9e1be",
          300: "#a9cf97",
          400: "#98c188", // Primärgrün der Marke
          500: "#7aab68",
          600: "#5f8c50",
          700: "#4b6e41",
          800: "#3e5837",
          900: "#34492f",
        },
        anthracite: {
          DEFAULT: "#3f3e3e",
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#3f3e3e",
          900: "#2b2a2a",
        },
        sand: "#f7f5ef",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      maxWidth: {
        content: "72rem",
      },
      borderRadius: {
        organic: "1.75rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
