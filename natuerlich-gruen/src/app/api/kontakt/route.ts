import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { site } from "@/lib/site";

export const runtime = "nodejs";

// Eingabe-Schema (serverseitige Validierung).
const schema = z.object({
  name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an.").max(120),
  email: z.string().trim().email("Bitte geben Sie eine gültige E-Mail an.").max(180),
  phone: z.string().trim().max(60).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Bitte schreiben Sie uns ein paar Worte.")
    .max(5000),
  privacy: z.union([z.literal("on"), z.literal(true), z.literal("true")]),
  // Honeypot – muss leer sein.
  company: z.string().max(0).optional().or(z.literal("")),
  "cf-turnstile-response": z.string().optional(),
});

// Einfaches In-Memory-Rate-Limiting pro IP (5 Anfragen / 10 Minuten).
// Hinweis: Für mehrere Server-Instanzen sollte ein geteilter Store
// (z. B. Upstash Redis) verwendet werden.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Turnstile nicht konfiguriert -> überspringen.
  if (!token) return false;
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    },
  );
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

async function sendEmail(input: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || site.email;
  const from = process.env.CONTACT_FROM_EMAIL || `website@natuerlichgruen.net`;

  // Ohne API-Key wird der Versand übersprungen (lokale Entwicklung).
  if (!apiKey) {
    console.info("[kontakt] RESEND_API_KEY fehlt – Anfrage wird nur geloggt:", {
      ...input,
      message: input.message.slice(0, 80) + "…",
    });
    return;
  }

  const text = [
    `Neue Kontaktanfrage über natuerlichgruen.net`,
    ``,
    `Name:    ${input.name}`,
    `E-Mail:  ${input.email}`,
    `Telefon: ${input.phone || "-"}`,
    ``,
    `Nachricht:`,
    input.message,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: input.email,
      subject: `Kontaktanfrage von ${input.name}`,
      text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`E-Mail-Versand fehlgeschlagen: ${detail}`);
  }
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message || "Ungültige Eingabe.";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  const data = parsed.data;

  // Honeypot ausgelöst -> als Erfolg tarnen, aber nichts senden.
  if (data.company) {
    return NextResponse.json({ ok: true });
  }

  const human = await verifyTurnstile(data["cf-turnstile-response"], ip);
  if (!human) {
    return NextResponse.json(
      { error: "Spam-Schutz fehlgeschlagen. Bitte laden Sie die Seite neu." },
      { status: 400 },
    );
  }

  try {
    await sendEmail({
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      message: data.message,
    });
  } catch (err) {
    console.error("[kontakt] Versandfehler:", err);
    return NextResponse.json(
      {
        error:
          "Die Nachricht konnte nicht versendet werden. Bitte schreiben Sie uns direkt an " +
          site.email,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
