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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#0B1F33",
            borderRadius: 14,
            padding: "16px 26px",
            alignSelf: "flex-start",
          }}
        >
          <span style={{ fontSize: 34, fontWeight: 700, color: "#33C6DC" }}>{"<"}</span>
          <span style={{ fontSize: 34, fontWeight: 700, color: "#ffffff" }}>adriawebcode</span>
          <span style={{ fontSize: 34, fontWeight: 700, color: "#33C6DC" }}>{"/>"}</span>
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
            adriawebcode.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
