import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050a1c",
          900: "#0a1230",
          800: "#111d4a",
          700: "#1a2b6b",
        },
        adriatic: {
          50: "#eefcfb",
          100: "#d5f6f4",
          200: "#b0edeb",
          300: "#79dede",
          400: "#3cc5c9",
          500: "#21a8ae",
          600: "#1e8792",
          700: "#1e6d77",
          800: "#205862",
          900: "#1f4a53",
        },
        coral: {
          400: "#ff8a70",
          500: "#ff6b4a",
          600: "#ed4f2c",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      animation: {
        "gradient-slow": "gradient 12s ease infinite",
        marquee: "marquee 30s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-soft": "pulseSoft 4s ease-in-out infinite",
      },
      keyframes: {
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
