/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // A calm, institutional palette. The one saturated colour is reserved
        // for availability, so a free appointment is the only thing on screen
        // that shouts.
        background: '#ffffff',
        surface: '#f8fafc',
        foreground: '#0f172a',
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
        border: '#e2e8f0',
        primary: {
          DEFAULT: '#1d4ed8',
          foreground: '#ffffff',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        // Free slot.
        available: {
          DEFAULT: '#059669',
          soft: '#ecfdf5',
          border: '#a7f3d0',
        },
        warning: {
          DEFAULT: '#b45309',
          soft: '#fffbeb',
        },
        destructive: {
          DEFAULT: '#dc2626',
          soft: '#fef2f2',
        },
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
