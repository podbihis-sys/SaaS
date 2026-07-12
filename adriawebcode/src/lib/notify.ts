import { isLocale, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import type { LeadInput, Quote } from "./quote";
import { ITEM_LABELS } from "./quote";
import type { SiteAnalysis } from "./scraper";
import { COUNTRY_NAME, type RegionCheck } from "./region";

const FROM = process.env.MAIL_FROM ?? "adriawebcode <onboarding@resend.dev>";
const OWNER = process.env.LEAD_NOTIFY_EMAIL ?? "podbihis@gmail.com";

function euro(amount: number): string {
  return `${amount.toLocaleString("de-DE")} €`;
}

function esc(value: string | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Collapse control characters so a company name can't inject email headers. */
function headerSafe(value: string | undefined): string {
  return (value ?? "").replace(/[\r\n]+/g, " ").trim();
}

function offerHtml(lead: LeadInput, quote: Quote, analysis: SiteAnalysis | null): string {
  const locale = isLocale(lead.locale) ? lead.locale : defaultLocale;
  const dict = getDictionary(locale);
  const t = dict.offer;
  const maintenanceName = dict.maintenance.plans[
    quote.recommendedMaintenance === "basic" ? 0 : quote.recommendedMaintenance === "business" ? 1 : 2
  ].name;

  const rows = quote.items
    .map((item) => {
      const label = esc(
        ITEM_LABELS[item.key]?.[locale] ?? ITEM_LABELS[item.key]?.de ?? item.key,
      );
      return `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${euro(item.amount)}</td></tr>`;
    })
    .join("");

  const analysisBlock = analysis?.reachable
    ? `<p style="margin:16px 0 4px"><strong>${esc(t.analysisTitle)} (${esc(analysis.url)}):</strong> ${esc(t.scoreLabel)} ${analysis.score}/100 · ${esc(analysis.techStack.join(", ")) || "—"}</p>`
    : "";

  const localTotal = quote.localCurrency
    ? ` <span style="font-size:14px;color:#1e6d77">(≈ ${quote.localCurrency.totalMax.toLocaleString("de-DE")} ${esc(quote.localCurrency.code)})</span>`
    : "";
  const maintenancePrice = quote.localCurrency
    ? `${quote.localCurrency.maintenanceMonthly.toLocaleString("de-DE")} ${esc(quote.localCurrency.code)} (≈ ${euro(quote.maintenancePriceMonthly)})`
    : euro(quote.maintenancePriceMonthly);

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#0a1230">
    <div style="background:linear-gradient(135deg,#0a1230,#1e6d77);padding:28px 32px;border-radius:12px 12px 0 0">
      <h1 style="color:#fff;margin:0;font-size:22px">adriawebcode</h1>
      <p style="color:#79dede;margin:6px 0 0;font-size:14px">${esc(t.title)}</p>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:0;padding:28px 32px;border-radius:0 0 12px 12px">
      <p>${esc(t.forCompany)} <strong>${esc(lead.company)}</strong> (${esc(lead.name)})</p>
      ${analysisBlock}
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">${rows}</table>
      <p style="font-size:18px"><strong>${esc(t.totalLabel)}: ${euro(quote.totalMax)}</strong>${localTotal} <span style="font-size:12px;color:#666">${esc(t.vatNote)}</span></p>
      <p style="font-size:14px">${esc(t.timelineLabel)}: ${quote.timelineWeeksMin}–${quote.timelineWeeksMax} ${esc(t.weeks)} · ${esc(t.maintenanceLabel)}: <strong>${esc(maintenanceName)}</strong> (${maintenancePrice})</p>
      <p style="font-size:12px;color:#666">${esc(t.validity)}</p>
    </div>
  </div>`;
}

/**
 * Sends the offer to the lead and a notification to the owner via Resend.
 * Silently skips when RESEND_API_KEY is not configured.
 */
export async function sendEmails(
  lead: LeadInput,
  quote: Quote,
  analysis: SiteAnalysis | null,
  region?: RegionCheck,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const send = (payload: object) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

  const html = offerHtml(lead, quote, analysis);

  const leadLocale = isLocale(lead.locale) ? lead.locale : defaultLocale;
  const leadSubject = getDictionary(leadLocale).offer.title;

  const mismatchBanner =
    region?.mismatch
      ? `<p style="margin:0 0 12px;padding:12px 14px;border-radius:8px;background:#fff4e5;border:1px solid #ffb877;color:#8a4b00">
           ⚠️ <strong>Standort-Hinweis:</strong> Der Interessent wählte
           „${esc(COUNTRY_NAME[region.claimed] ?? region.claimed)}", der Firmensitz
           laut Adresse liegt aber in
           <strong>${esc(COUNTRY_NAME[region.effective] ?? region.effective)}</strong>
           (${esc(region.reasons.join(", ")) || "—"}). Das Angebot wurde daher
           zum Preis für ${esc(COUNTRY_NAME[region.effective] ?? region.effective)} berechnet.
         </p>`
      : "";

  const ownerEmail = send({
    from: FROM,
    to: [OWNER],
    // Replying to the notification should reach the customer directly.
    reply_to: lead.email,
    subject: `${region?.mismatch ? "⚠️ " : "🔥 "}Neuer Lead: ${headerSafe(lead.company)} (${lead.country.toUpperCase()}, ${euro(quote.totalMin)}–${euro(quote.totalMax)})`,
    html:
      `<h2>Neuer Lead über adriawebcode.com</h2>
       ${mismatchBanner}
       <ul>
         <li><strong>Name:</strong> ${esc(lead.name)}</li>
         <li><strong>Firma:</strong> ${esc(lead.company)}</li>
         <li><strong>E-Mail:</strong> ${esc(lead.email)}</li>
         <li><strong>Telefon:</strong> ${esc(lead.phone) || "–"}</li>
         <li><strong>Adresse:</strong> ${esc(lead.address)}</li>
         <li><strong>Markt (gewählt):</strong> ${esc(lead.country)}${region?.mismatch ? ` → <strong>berechnet als ${esc(region.effective)}</strong>` : ""}</li>
         <li><strong>Projekt:</strong> ${lead.projectType}, ${lead.pages}, Sprachen: ${lead.languages}</li>
         <li><strong>Wartung:</strong> ${lead.maintenance}</li>
         <li><strong>Website:</strong> ${esc(lead.websiteUrl) || "keine"}</li>
         <li><strong>Nachricht:</strong> ${esc(lead.message) || "–"}</li>
       </ul>` + html,
  });

  const leadEmail = send({
    from: FROM,
    to: [lead.email],
    // Customer replies to the offer land in the business inbox, since the
    // sending identity (angebot@) is not a monitored mailbox.
    reply_to: OWNER,
    subject: `adriawebcode – ${headerSafe(leadSubject)}`,
    html,
  });

  // Owner notification and the customer copy are independent: a failed
  // customer copy (e.g. Resend still in test mode) must not swallow the lead.
  const [ownerRes, leadRes] = await Promise.allSettled([ownerEmail, leadEmail]);
  const ownerOk = ownerRes.status === "fulfilled" && ownerRes.value.ok;
  const leadOk = leadRes.status === "fulfilled" && leadRes.value.ok;

  if (!ownerOk) {
    const detail =
      ownerRes.status === "fulfilled"
        ? await ownerRes.value.text().catch(() => "")
        : String(ownerRes.reason);
    console.error(JSON.stringify({ type: "owner_email_failed", detail: detail.slice(0, 300) }));
  }

  // `emailSent` reflects the customer copy — that's what the UI promises them.
  return leadOk;
}
