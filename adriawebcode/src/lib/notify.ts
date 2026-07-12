import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import type { LeadInput, Quote } from "./quote";
import { ITEM_LABELS } from "./quote";
import type { SiteAnalysis } from "./scraper";
import { COUNTRY_NAME, type RegionCheck } from "./region";
import { createAcceptToken, type AcceptPayload } from "./accept-token";
import {
  emailShell,
  emailButton,
  emailHighlight,
  emailRow,
  emailParagraph,
  emailSmall,
  emailHeading,
  escHtml as esc,
} from "./email-template";

const OWNER = process.env.LEAD_NOTIFY_EMAIL ?? "adriawebcode@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://adriawebcode.com";

/**
 * The sending identity is localised so every market gets a native-looking
 * sender. The whole domain is verified at Resend, so any local part may send.
 */
const FROM_BY_LOCALE: Record<Locale, string> = {
  de: "adriawebcode <angebot@adriawebcode.com>",
  en: "adriawebcode <offers@adriawebcode.com>",
  hr: "adriawebcode <ponuda@adriawebcode.com>",
  bs: "adriawebcode <ponuda@adriawebcode.com>",
  sr: "adriawebcode <ponuda@adriawebcode.com>",
};

const FROM_OWNER = process.env.MAIL_FROM ?? "adriawebcode <angebot@adriawebcode.com>";

/** Days until the automatic follow-up reminder is sent (cancelled on accept). */
const FOLLOWUP_DELAY_DAYS = 3;

/** Localised strings for the acceptance flow e-mails. */
const ACCEPT_L10N: Record<
  Locale,
  {
    acceptCta: string;
    acceptHint: string;
    followupSubject: string;
    followupBody: string;
    confirmSubject: string;
    confirmTitle: string;
    confirmBody: string;
    greeting: string;
  }
> = {
  de: {
    acceptCta: "Angebot verbindlich annehmen",
    acceptHint: "Ein Klick genügt – Sie erhalten sofort eine Auftragsbestätigung und wir legen los.",
    followupSubject: "Ihr Angebot wartet – haben Sie noch Fragen?",
    followupBody:
      "vor ein paar Tagen haben wir Ihnen Ihr persönliches Angebot geschickt. Falls Sie Fragen haben, antworten Sie einfach auf diese E-Mail. Wenn alles passt, können Sie das Angebot direkt annehmen:",
    confirmSubject: "Auftragsbestätigung – wir legen los! 🚀",
    confirmTitle: "Vielen Dank für Ihren Auftrag!",
    confirmBody:
      "Sie haben unser Angebot angenommen. Wir melden uns innerhalb von 24 Stunden mit den nächsten Schritten und dem Zeitplan. Bei Fragen antworten Sie einfach auf diese E-Mail.",
    greeting: "Guten Tag",
  },
  en: {
    acceptCta: "Accept this offer",
    acceptHint: "One click is all it takes – you'll receive an order confirmation right away and we'll get started.",
    followupSubject: "Your offer is waiting – any questions?",
    followupBody:
      "a few days ago we sent you your personal quote. If you have any questions, just reply to this e-mail. If everything looks good, you can accept the offer directly:",
    confirmSubject: "Order confirmation – we're getting started! 🚀",
    confirmTitle: "Thank you for your order!",
    confirmBody:
      "You have accepted our offer. We'll get back to you within 24 hours with the next steps and the timeline. If you have questions, just reply to this e-mail.",
    greeting: "Hello",
  },
  hr: {
    acceptCta: "Prihvati ponudu",
    acceptHint: "Dovoljan je jedan klik – odmah dobivate potvrdu narudžbe i mi krećemo s radom.",
    followupSubject: "Vaša ponuda čeka – imate li pitanja?",
    followupBody:
      "prije nekoliko dana poslali smo vam vašu osobnu ponudu. Ako imate pitanja, jednostavno odgovorite na ovaj e-mail. Ako vam sve odgovara, ponudu možete odmah prihvatiti:",
    confirmSubject: "Potvrda narudžbe – krećemo! 🚀",
    confirmTitle: "Hvala vam na narudžbi!",
    confirmBody:
      "Prihvatili ste našu ponudu. Javit ćemo vam se u roku od 24 sata s daljnjim koracima i vremenskim planom. Za pitanja jednostavno odgovorite na ovaj e-mail.",
    greeting: "Poštovani",
  },
  bs: {
    acceptCta: "Prihvati ponudu",
    acceptHint: "Dovoljan je jedan klik – odmah dobijate potvrdu narudžbe i mi krećemo s radom.",
    followupSubject: "Vaša ponuda čeka – imate li pitanja?",
    followupBody:
      "prije nekoliko dana poslali smo vam vašu ličnu ponudu. Ako imate pitanja, jednostavno odgovorite na ovaj e-mail. Ako vam sve odgovara, ponudu možete odmah prihvatiti:",
    confirmSubject: "Potvrda narudžbe – krećemo! 🚀",
    confirmTitle: "Hvala vam na narudžbi!",
    confirmBody:
      "Prihvatili ste našu ponudu. Javit ćemo vam se u roku od 24 sata s daljim koracima i vremenskim planom. Za pitanja jednostavno odgovorite na ovaj e-mail.",
    greeting: "Poštovani",
  },
  sr: {
    acceptCta: "Prihvati ponudu",
    acceptHint: "Dovoljan je jedan klik – odmah dobijate potvrdu porudžbine i mi krećemo s radom.",
    followupSubject: "Vaša ponuda čeka – imate li pitanja?",
    followupBody:
      "pre nekoliko dana poslali smo vam vašu ličnu ponudu. Ako imate pitanja, jednostavno odgovorite na ovaj e-mail. Ako vam sve odgovara, ponudu možete odmah prihvatiti:",
    confirmSubject: "Potvrda porudžbine – krećemo! 🚀",
    confirmTitle: "Hvala vam na porudžbini!",
    confirmBody:
      "Prihvatili ste našu ponudu. Javićemo vam se u roku od 24 sata sa daljim koracima i vremenskim planom. Za pitanja jednostavno odgovorite na ovaj e-mail.",
    greeting: "Poštovani",
  },
};

function euro(amount: number): string {
  return `${amount.toLocaleString("de-DE")} €`;
}

/** Collapse control characters so a company name can't inject email headers. */
function headerSafe(value: string | undefined): string {
  return (value ?? "").replace(/[\r\n]+/g, " ").trim();
}

function offerHtml(
  lead: LeadInput,
  quote: Quote,
  analysis: SiteAnalysis | null,
  acceptUrl: string | null,
): string {
  const locale = isLocale(lead.locale) ? lead.locale : defaultLocale;
  const dict = getDictionary(locale);
  const t = dict.offer;
  const l = ACCEPT_L10N[locale];
  const maintenanceName = dict.maintenance.plans[
    quote.recommendedMaintenance === "basic" ? 0 : quote.recommendedMaintenance === "business" ? 1 : 2
  ].name;

  const rows = quote.items
    .map((item) =>
      emailRow(
        esc(ITEM_LABELS[item.key]?.[locale] ?? ITEM_LABELS[item.key]?.de ?? item.key),
        euro(item.amount),
      ),
    )
    .join("");

  const analysisBlock = analysis?.reachable
    ? emailParagraph(
        `<strong>${esc(t.analysisTitle)}</strong> (${esc(analysis.url)}): ${esc(t.scoreLabel)} <strong>${analysis.score}/100</strong>${analysis.techStack.length ? ` · ${esc(analysis.techStack.join(", "))}` : ""}`,
      )
    : "";

  const totalStr = quote.localCurrency
    ? `${quote.localCurrency.totalMax.toLocaleString("de-DE")} ${quote.localCurrency.code}`
    : euro(quote.totalMax);
  const totalSub = quote.localCurrency
    ? `≈ ${euro(quote.totalMax)} · ${t.vatNote}`
    : t.vatNote;

  const maintenancePrice = quote.localCurrency
    ? `${quote.localCurrency.maintenanceMonthly.toLocaleString("de-DE")} ${quote.localCurrency.code} (≈ ${euro(quote.maintenancePriceMonthly)})`
    : euro(quote.maintenancePriceMonthly);

  const content = `
    ${emailParagraph(`${esc(l.greeting)} ${esc(lead.name)},`)}
    ${emailParagraph(`${esc(t.forCompany)} <strong>${esc(lead.company)}</strong>:`)}
    ${analysisBlock}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px">${rows}</table>
    ${emailHighlight(t.totalLabel, totalStr, totalSub)}
    ${emailParagraph(`${esc(t.timelineLabel)}: <strong>${quote.timelineWeeksMin}–${quote.timelineWeeksMax} ${esc(t.weeks)}</strong> &nbsp;·&nbsp; ${esc(t.maintenanceLabel)}: <strong>${esc(maintenanceName)}</strong> (${esc(maintenancePrice)})`)}
    ${acceptUrl ? emailButton(acceptUrl, l.acceptCta, l.acceptHint) : ""}
    ${emailSmall(esc(t.validity))}
  `;

  return emailShell({
    preheader: `${t.totalLabel}: ${totalStr}`,
    tagline: t.title,
    content,
    siteUrl: SITE_URL,
  });
}

type SendFn = (payload: object) => Promise<Response>;

function makeSend(apiKey: string): SendFn {
  return (payload: object) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
}

export interface SendResult {
  /** Whether the customer offer copy was delivered (what the UI promises). */
  leadOk: boolean;
  /** Signed acceptance URL, when the acceptance flow is configured. */
  acceptUrl: string | null;
}

/**
 * Sends the offer to the lead and a notification to the owner via Resend, and
 * schedules an automatic follow-up reminder that is cancelled on acceptance.
 * Silently skips when RESEND_API_KEY is not configured.
 */
export async function sendEmails(
  lead: LeadInput,
  quote: Quote,
  analysis: SiteAnalysis | null,
  region?: RegionCheck,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { leadOk: false, acceptUrl: null };
  const send = makeSend(apiKey);

  const leadLocale = isLocale(lead.locale) ? lead.locale : defaultLocale;
  const l = ACCEPT_L10N[leadLocale];
  const from = FROM_BY_LOCALE[leadLocale];
  const leadSubject = getDictionary(leadLocale).offer.title;

  const localTotalStr = quote.localCurrency
    ? `${quote.localCurrency.totalMax.toLocaleString("de-DE")} ${quote.localCurrency.code}`
    : undefined;

  // 1) Schedule the follow-up reminder first so its id can be embedded in the
  //    acceptance token (accepting cancels the reminder). Its own accept link
  //    simply carries no followup id — by the time it lands, cancelling is moot.
  let followupId: string | undefined;
  const basePayload: Omit<AcceptPayload, "followupId"> = {
    name: lead.name,
    email: lead.email,
    company: lead.company,
    total: quote.totalMax,
    localTotal: localTotalStr,
    locale: leadLocale,
    ts: Date.now(),
  };
  const followupToken = createAcceptToken({ ...basePayload });
  if (followupToken) {
    const followupAccept = `${SITE_URL}/api/offer/accept?t=${followupToken}`;
    const scheduledAt = new Date(Date.now() + FOLLOWUP_DELAY_DAYS * 86_400_000).toISOString();
    const followupHtml = emailShell({
      preheader: l.followupSubject,
      tagline: l.followupSubject,
      content: `
        ${emailParagraph(`${esc(l.greeting)} ${esc(lead.name)},`)}
        ${emailParagraph(esc(l.followupBody))}
        ${emailButton(followupAccept, l.acceptCta, l.acceptHint)}
      `,
      siteUrl: SITE_URL,
    });
    try {
      const res = await send({
        from,
        to: [lead.email],
        reply_to: OWNER,
        subject: `adriawebcode – ${headerSafe(l.followupSubject)}`,
        scheduled_at: scheduledAt,
        html: followupHtml,
      });
      if (res.ok) {
        const body = (await res.json()) as { id?: string };
        followupId = body.id;
      }
    } catch {
      // A failed reminder must never block the offer itself.
    }
  }

  // 2) The offer's accept link — cancelling the reminder on acceptance.
  const acceptToken = createAcceptToken({ ...basePayload, followupId });
  const acceptUrl = acceptToken ? `${SITE_URL}/api/offer/accept?t=${acceptToken}` : null;

  const html = offerHtml(lead, quote, analysis, acceptUrl);

  const mismatchBanner =
    region?.mismatch
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px"><tr>
           <td style="background:#fff4e5;border:1px solid #ffb877;border-radius:10px;padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#8a4b00">
             ⚠️ <strong>Standort-Hinweis:</strong> Der Interessent wählte
             „${esc(COUNTRY_NAME[region.claimed] ?? region.claimed)}", der Firmensitz
             laut Adresse liegt aber in
             <strong>${esc(COUNTRY_NAME[region.effective] ?? region.effective)}</strong>
             (${esc(region.reasons.join(", ")) || "—"}). Das Angebot wurde daher
             zum Preis für ${esc(COUNTRY_NAME[region.effective] ?? region.effective)} berechnet.
           </td>
         </tr></table>`
      : "";

  const detail = (label: string, value: string) =>
    emailRow(`<strong>${label}</strong>`, value);

  const ownerContent = `
    ${mismatchBanner}
    ${emailHeading("🔥 Neuer Lead über adriawebcode.com")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 8px">
      ${detail("Name", esc(lead.name))}
      ${detail("Firma", esc(lead.company))}
      ${detail("E-Mail", esc(lead.email))}
      ${detail("Telefon", esc(lead.phone) || "–")}
      ${detail("Adresse", esc(lead.address))}
      ${detail("Markt (gewählt)", esc(lead.country) + (region?.mismatch ? ` → <strong>berechnet als ${esc(region.effective)}</strong>` : ""))}
      ${detail("Projekt", `${lead.projectType}, ${lead.pages}, Sprachen: ${lead.languages}`)}
      ${detail("Wartung", esc(lead.maintenance))}
      ${detail("Website", esc(lead.websiteUrl) || "keine")}
      ${detail("Nachricht", esc(lead.message) || "–")}
      ${detail("Nachfass-Erinnerung", followupId ? `geplant in ${FOLLOWUP_DELAY_DAYS} Tagen (wird bei Annahme storniert)` : "nicht geplant")}
    </table>
    ${emailHighlight("Angebotssumme", euro(quote.totalMax), localTotalStr ? `≈ ${localTotalStr}` : undefined)}
    ${emailSmall("Antworten auf diese E-Mail gehen direkt an den Interessenten.")}
  `;

  const ownerEmail = send({
    from: FROM_OWNER,
    to: [OWNER],
    // Replying to the notification should reach the customer directly.
    reply_to: lead.email,
    subject: `${region?.mismatch ? "⚠️ " : "🔥 "}Neuer Lead: ${headerSafe(lead.company)} (${lead.country.toUpperCase()}, ${euro(quote.totalMax)})`,
    html: emailShell({
      preheader: `Neuer Lead: ${lead.company}`,
      tagline: "Interne Lead-Benachrichtigung",
      content: ownerContent,
      siteUrl: SITE_URL,
    }),
  });

  const leadEmail = send({
    from,
    to: [lead.email],
    // Customer replies to the offer land in the business inbox, since the
    // sending identity (angebot@/ponuda@/offers@) is not a monitored mailbox.
    reply_to: OWNER,
    subject: `adriawebcode – ${headerSafe(leadSubject)}`,
    html,
  });

  // Owner notification and the customer copy are independent: a failed
  // customer copy must not swallow the lead.
  const [ownerRes, leadRes] = await Promise.allSettled([ownerEmail, leadEmail]);
  const ownerOk = ownerRes.status === "fulfilled" && ownerRes.value.ok;
  const leadOk = leadRes.status === "fulfilled" && leadRes.value.ok;

  if (!ownerOk) {
    const detailText =
      ownerRes.status === "fulfilled"
        ? await ownerRes.value.text().catch(() => "")
        : String(ownerRes.reason);
    console.error(JSON.stringify({ type: "owner_email_failed", detail: detailText.slice(0, 300) }));
  }

  return { leadOk, acceptUrl };
}

/**
 * Runs the acceptance flow: cancels the scheduled follow-up, notifies the
 * owner ("accepted — start working / send invoice") and sends the customer an
 * order confirmation. Returns false when e-mail is not configured.
 */
export async function sendAcceptanceEmails(payload: AcceptPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const send = makeSend(apiKey);

  const locale = isLocale(payload.locale) ? payload.locale : defaultLocale;
  const l = ACCEPT_L10N[locale];
  const from = FROM_BY_LOCALE[locale];
  const totalStr = payload.localTotal ?? euro(payload.total);
  const totalSub = payload.localTotal ? `≈ ${euro(payload.total)}` : undefined;

  // Cancel the pending follow-up reminder — best effort.
  if (payload.followupId) {
    try {
      await fetch(`https://api.resend.com/emails/${payload.followupId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
      });
    } catch {
      // Ignore: a stray reminder is harmless.
    }
  }

  const invoiceConfigured = Boolean(process.env.INVOICE_COMPANY_NAME);

  const ownerEmail = send({
    from: FROM_OWNER,
    to: [OWNER],
    reply_to: payload.email,
    subject: `✅ ANGENOMMEN: ${headerSafe(payload.company)} (${euro(payload.total)})`,
    html: emailShell({
      preheader: `Angebot angenommen: ${payload.company}`,
      tagline: "Auftrag bestätigt 🎉",
      content: `
        ${emailHeading("🎉 Angebot angenommen!")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 8px">
          ${emailRow("<strong>Firma</strong>", esc(payload.company))}
          ${emailRow("<strong>Name</strong>", esc(payload.name))}
          ${emailRow("<strong>E-Mail</strong>", esc(payload.email))}
        </table>
        ${emailHighlight("Auftragssumme", totalStr, totalSub)}
        ${emailParagraph("<strong>Nächste Schritte:</strong>")}
        ${emailParagraph(`1. Kunde hat automatisch eine Auftragsbestätigung erhalten.<br/>2. ${invoiceConfigured ? "Rechnung wurde automatisch versendet." : "⚠️ Rechnungsdaten noch nicht hinterlegt – bitte Rechnung manuell senden (Anzahlung)."}<br/>3. Mit der Arbeit beginnen 🚀`)}
      `,
      siteUrl: SITE_URL,
    }),
  });

  const customerEmail = send({
    from,
    to: [payload.email],
    reply_to: OWNER,
    subject: `adriawebcode – ${headerSafe(l.confirmSubject)}`,
    html: emailShell({
      preheader: l.confirmTitle,
      tagline: l.confirmTitle,
      content: `
        ${emailParagraph(`${esc(l.greeting)} ${esc(payload.name)},`)}
        ${emailParagraph(esc(l.confirmBody))}
        ${emailHighlight(esc(payload.company), totalStr, totalSub)}
      `,
      siteUrl: SITE_URL,
    }),
  });

  const [ownerRes, customerRes] = await Promise.allSettled([ownerEmail, customerEmail]);
  const ownerOk = ownerRes.status === "fulfilled" && ownerRes.value.ok;
  if (!ownerOk) {
    console.error(JSON.stringify({ type: "acceptance_owner_email_failed" }));
  }
  return ownerOk || (customerRes.status === "fulfilled" && customerRes.value.ok);
}
