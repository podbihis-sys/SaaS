import type { LeadInput, Quote } from "./quote";
import { ITEM_LABELS } from "./quote";
import type { SiteAnalysis } from "./scraper";

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

function offerHtml(lead: LeadInput, quote: Quote, analysis: SiteAnalysis | null): string {
  const rows = quote.items
    .map((item) => {
      const label = ITEM_LABELS[item.key]?.[lead.locale] ?? ITEM_LABELS[item.key]?.de ?? item.key;
      return `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${euro(item.amount)}</td></tr>`;
    })
    .join("");

  const analysisBlock = analysis?.reachable
    ? `<p style="margin:16px 0 4px"><strong>Website-Analyse (${esc(analysis.url)}):</strong> Score ${analysis.score}/100, ${analysis.issues.length} Optimierungspunkte, Technologie: ${analysis.techStack.join(", ") || "unbekannt"}</p>`
    : "";

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#0a1230">
    <div style="background:linear-gradient(135deg,#0a1230,#1e6d77);padding:28px 32px;border-radius:12px 12px 0 0">
      <h1 style="color:#fff;margin:0;font-size:22px">adriawebcode</h1>
      <p style="color:#79dede;margin:6px 0 0;font-size:14px">Ihr automatisches Angebot / Your automatic quote</p>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:0;padding:28px 32px;border-radius:0 0 12px 12px">
      <p>Angebot für <strong>${esc(lead.company)}</strong> (${esc(lead.name)})</p>
      ${analysisBlock}
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">${rows}</table>
      <p style="font-size:18px"><strong>Gesamt: ${euro(quote.totalMin)} – ${euro(quote.totalMax)}</strong>${
        quote.localCurrency
          ? ` <span style="font-size:14px;color:#1e6d77">(≈ ${quote.localCurrency.totalMin.toLocaleString("de-DE")} – ${quote.localCurrency.totalMax.toLocaleString("de-DE")} ${quote.localCurrency.code})</span>`
          : ""
      } <span style="font-size:12px;color:#666">(zzgl. USt.)</span></p>
      <p style="font-size:14px">Umsetzung: ca. ${quote.timelineWeeksMin}–${quote.timelineWeeksMax} Wochen · Empfohlener Wartungsvertrag: <strong>${quote.recommendedMaintenance}</strong> (${euro(quote.maintenancePriceMonthly)}/Monat)</p>
      <p style="font-size:12px;color:#666">Dieses Angebot wurde automatisch erstellt, ist unverbindlich und 14 Tage gültig. Wir melden uns innerhalb von 24 Stunden persönlich.</p>
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

  try {
    const [toLead, toOwner] = await Promise.all([
      send({
        from: FROM,
        to: [lead.email],
        subject: "Ihr Angebot von adriawebcode / Your quote",
        html,
      }),
      send({
        from: FROM,
        to: [OWNER],
        subject: `🔥 Neuer Lead: ${esc(lead.company)} (${lead.country.toUpperCase()}, ${euro(quote.totalMin)}–${euro(quote.totalMax)})`,
        html:
          `<h2>Neuer Lead über adriawebcode.com</h2>
           <ul>
             <li><strong>Name:</strong> ${esc(lead.name)}</li>
             <li><strong>Firma:</strong> ${esc(lead.company)}</li>
             <li><strong>E-Mail:</strong> ${esc(lead.email)}</li>
             <li><strong>Telefon:</strong> ${esc(lead.phone) || "–"}</li>
             <li><strong>Adresse:</strong> ${esc(lead.address)}</li>
             <li><strong>Markt:</strong> ${lead.country}</li>
             <li><strong>Projekt:</strong> ${lead.projectType}, ${lead.pages}, Sprachen: ${lead.languages}</li>
             <li><strong>Wartung:</strong> ${lead.maintenance}</li>
             <li><strong>Website:</strong> ${esc(lead.websiteUrl) || "keine"}</li>
             <li><strong>Nachricht:</strong> ${esc(lead.message) || "–"}</li>
           </ul>` + html,
      }),
    ]);
    return toLead.ok && toOwner.ok;
  } catch {
    return false;
  }
}
