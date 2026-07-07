import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale, locales, type Locale } from "@/i18n/config";

/**
 * Map the visitor's country (from Vercel's geo-IP header) to the locale that
 * serves that market. Montenegro has no dedicated locale, so it gets Serbian.
 */
const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  DE: "de",
  AT: "de",
  CH: "de",
  LI: "de",
  LU: "de",
  HR: "hr",
  BA: "bs",
  RS: "sr",
  ME: "sr",
};

function localeFromAcceptLanguage(header: string): Locale | null {
  for (const part of header.split(",")) {
    const code = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return null;
}

function detectLocale(request: NextRequest): Locale {
  // 1. An explicit choice via the switcher always wins.
  const cookieLocale = request.cookies.get("locale")?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

  // 2. Real geographic location (Vercel injects this header at the edge).
  const country = (
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    ""
  ).toUpperCase();
  if (country && COUNTRY_TO_LOCALE[country]) return COUNTRY_TO_LOCALE[country];

  // 3. Browser language for everyone else (English default for non-markets).
  const byLang = localeFromAcceptLanguage(request.headers.get("accept-language") ?? "");
  if (byLang) return byLang;
  if (country) return "en"; // known country, but not one of our markets

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.redirect(url);
  // Remember the resolved locale so subsequent visits are stable and fast.
  res.cookies.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|og-image.png|manifest.webmanifest|.*\\..*).*)",
  ],
};
