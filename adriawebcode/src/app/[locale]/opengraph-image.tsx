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
          background: "linear-gradient(120deg, #050a1c 0%, #0a1230 45%, #1e6d77 130%)",
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
            <span style={{ color: "#3cc5c9" }}>web</span>
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
          <div style={{ display: "flex", fontSize: 28, color: "#a8c5cc", maxWidth: 920 }}>
            {dict.hero.badge}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#050a1c",
              background: "linear-gradient(90deg, #21a8ae, #3cc5c9)",
              padding: "14px 34px",
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            {dict.hero.cta1}
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#79dede" }}>
            adriawebcode.vercel.app
          </div>
        </div>
      </div>
    ),
    size,
  );
}
