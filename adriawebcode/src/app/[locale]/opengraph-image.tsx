import { ImageResponse } from "next/og";
import { isLocale, locales, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "adriawebcode – Web Design Agency";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0E4B5A",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#111d4a" />
            <path
              d="M14 46 L28 18 L34 30 L40 18 L54 46"
              fill="none"
              stroke="#3cc5c9"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="34" cy="46" r="3.5" fill="#ff6b4a" />
          </svg>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#ffffff" }}>
            adria
            <span style={{ color: "#ffffff" }}>web</span>
            code
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.15,
              maxWidth: 980,
            }}
          >
            {`${dict.hero.title1} ${dict.hero.titleHighlight}`}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "rgba(255,255,255,0.75)", maxWidth: 920 }}>
            {dict.hero.badge}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#0E4B5A",
              background: "#ffffff",
              padding: "14px 34px",
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            {dict.hero.cta1}
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "rgba(255,255,255,0.7)" }}>
            adriawebcode.vercel.app
          </div>
        </div>
      </div>
    ),
    size,
  );
}
