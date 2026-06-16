import "server-only";
import { Resend } from "resend";
import type { Booking } from "@/types/database";

/**
 * Transactional email via Resend (prompt §8/§10). All senders are best-effort:
 * if RESEND_API_KEY is unset (local dev) they log and no-op instead of throwing.
 */
let cached: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!cached) cached = new Resend(key);
  return cached;
}

const FROM = process.env.RESEND_FROM ?? "RentFlow <onboarding@resend.dev>";

async function send(to: string | null | undefined, subject: string, html: string) {
  if (!to) return;
  const resend = getResend();
  if (!resend) {
    console.info(`[email skipped: no RESEND_API_KEY] to=${to} subject="${subject}"`);
    return;
  }
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(`Resend error: ${error.message}`);
}

function euro(n: number | null | undefined): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    Number(n ?? 0),
  );
}

function layout(title: string, body: string): string {
  return `<!doctype html><html lang="de"><body style="font-family:system-ui,sans-serif;color:#0f172a;line-height:1.5">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <h1 style="font-size:20px">${title}</h1>
    ${body}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
    <p style="font-size:12px;color:#64748b">Diese Buchung wurde über RentFlow abgewickelt.</p>
  </div></body></html>`;
}

function bookingDetails(b: Booking): string {
  return `<table style="font-size:14px;border-collapse:collapse">
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Zeitraum</td><td>${b.start_date} – ${b.end_date}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Menge</td><td>${b.quantity}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Miete</td><td>${euro(b.rental_total)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Kaution</td><td>${euro(b.deposit_total)}</td></tr>
  </table>`;
}

export async function sendBookingConfirmation(b: Booking) {
  await send(
    b.customer_email,
    "Buchungsbestätigung",
    layout(
      `Hallo ${b.customer_name ?? ""}, deine Buchung ist bestätigt`,
      `<p>Vielen Dank! Deine Buchung wurde bezahlt und bestätigt.</p>${bookingDetails(b)}
       <p>Die Kaution wird bei ordnungsgemäßer Rückgabe erstattet.</p>`,
    ),
  );
}

export async function sendPickupReminder(b: Booking) {
  await send(
    b.customer_email,
    "Erinnerung: Abholung morgen",
    layout(
      "Deine Abholung steht an",
      `<p>Hallo ${b.customer_name ?? ""}, deine Buchung beginnt am <strong>${b.start_date}</strong>.</p>${bookingDetails(b)}`,
    ),
  );
}

export async function sendReturnReminder(b: Booking) {
  await send(
    b.customer_email,
    "Erinnerung: Rückgabe steht an",
    layout(
      "Bitte denke an die Rückgabe",
      `<p>Hallo ${b.customer_name ?? ""}, deine Mietzeit endet am <strong>${b.end_date}</strong>.</p>${bookingDetails(b)}`,
    ),
  );
}

export async function sendDepositRefunded(b: Booking) {
  await send(
    b.customer_email,
    "Kaution erstattet",
    layout(
      "Deine Kaution wurde erstattet",
      `<p>Hallo ${b.customer_name ?? ""}, vielen Dank für die Rückgabe. Deine Kaution in Höhe von
       <strong>${euro(b.deposit_total)}</strong> wurde erstattet.</p>`,
    ),
  );
}

export async function sendOverdueNotice(b: Booking, tenantEmail: string | null) {
  await send(
    tenantEmail,
    "Überfällige Rückgabe",
    layout(
      "Eine Rückgabe ist überfällig",
      `<p>Die Buchung von ${b.customer_name ?? "einem Kunden"} (Ende ${b.end_date}) wurde noch nicht als zurückgegeben markiert.</p>${bookingDetails(b)}`,
    ),
  );
}
