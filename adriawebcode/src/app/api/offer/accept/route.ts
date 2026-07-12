import { NextRequest, NextResponse } from "next/server";
import { verifyAcceptToken } from "@/lib/accept-token";
import { sendAcceptanceEmails } from "@/lib/notify";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export const runtime = "nodejs";

const PAGE_L10N: Record<
  Locale,
  { title: string; body: string; back: string; invalidTitle: string; invalidBody: string }
> = {
  de: {
    title: "Vielen Dank – Auftrag bestätigt! 🎉",
    body: "Sie haben unser Angebot verbindlich angenommen. Eine Auftragsbestätigung ist auf dem Weg in Ihr Postfach, und wir melden uns innerhalb von 24 Stunden mit den nächsten Schritten.",
    back: "Zurück zur Website",
    invalidTitle: "Link ungültig oder abgelaufen",
    invalidBody: "Dieser Annahme-Link ist nicht mehr gültig. Bitte fordern Sie ein neues Angebot an oder antworten Sie direkt auf unsere E-Mail.",
  },
  en: {
    title: "Thank you – order confirmed! 🎉",
    body: "You have accepted our offer. An order confirmation is on its way to your inbox, and we'll get back to you within 24 hours with the next steps.",
    back: "Back to the website",
    invalidTitle: "Link invalid or expired",
    invalidBody: "This acceptance link is no longer valid. Please request a new quote or simply reply to our e-mail.",
  },
  hr: {
    title: "Hvala – narudžba potvrđena! 🎉",
    body: "Prihvatili ste našu ponudu. Potvrda narudžbe stiže u vaš sandučić, a javit ćemo vam se u roku od 24 sata s daljnjim koracima.",
    back: "Natrag na web stranicu",
    invalidTitle: "Poveznica nevažeća ili istekla",
    invalidBody: "Ova poveznica za prihvaćanje više nije važeća. Zatražite novu ponudu ili jednostavno odgovorite na naš e-mail.",
  },
  bs: {
    title: "Hvala – narudžba potvrđena! 🎉",
    body: "Prihvatili ste našu ponudu. Potvrda narudžbe stiže u vaš inbox, a javit ćemo vam se u roku od 24 sata s daljim koracima.",
    back: "Nazad na web stranicu",
    invalidTitle: "Link nevažeći ili istekao",
    invalidBody: "Ovaj link za prihvatanje više nije važeći. Zatražite novu ponudu ili jednostavno odgovorite na naš e-mail.",
  },
  sr: {
    title: "Hvala – porudžbina potvrđena! 🎉",
    body: "Prihvatili ste našu ponudu. Potvrda porudžbine stiže u vaš inbox, a javićemo vam se u roku od 24 sata sa daljim koracima.",
    back: "Nazad na veb stranicu",
    invalidTitle: "Link nevažeći ili istekao",
    invalidBody: "Ovaj link za prihvatanje više nije važeći. Zatražite novu ponudu ili jednostavno odgovorite na naš e-mail.",
  },
};

function page(locale: Locale, ok: boolean): string {
  const t = PAGE_L10N[locale];
  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>adriawebcode</title>
  <style>
    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#04060f;color:#e2e8f0;display:grid;place-items:center;min-height:100vh;padding:24px}
    .card{max-width:520px;text-align:center;background:rgba(255,255,255,.04);border:1px solid rgba(121,222,222,.25);border-radius:20px;padding:48px 36px}
    h1{font-size:1.5rem;margin:0 0 14px;color:#fff}
    p{line-height:1.65;color:#94a3b8;margin:0 0 28px}
    a{display:inline-block;background:linear-gradient(135deg,#1e6d77,#2a9d8f);color:#fff;text-decoration:none;font-weight:600;padding:12px 32px;border-radius:999px}
    .mark{font-size:2.6rem;margin-bottom:18px}
  </style>
</head>
<body>
  <div class="card">
    <div class="mark">${ok ? "✅" : "⚠️"}</div>
    <h1>${ok ? t.title : t.invalidTitle}</h1>
    <p>${ok ? t.body : t.invalidBody}</p>
    <a href="/${locale}">${t.back}</a>
  </div>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t") ?? "";
  const payload = verifyAcceptToken(token);

  if (!payload) {
    return new NextResponse(page(defaultLocale, false), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const locale = isLocale(payload.locale) ? payload.locale : defaultLocale;
  await sendAcceptanceEmails(payload);

  console.log(
    JSON.stringify({
      type: "offer_accepted",
      at: new Date().toISOString(),
      company: payload.company,
      email: payload.email,
      total: payload.total,
    }),
  );

  return new NextResponse(page(locale, true), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
