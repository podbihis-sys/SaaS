import { NextResponse } from "next/server";
import { z } from "zod";

// Allgemeines Kontaktformular (ohne Warenkorb-Positionen) – Muster wie
// ../anfrage/route.ts.
const contactSchema = z.object({
  company: z.string().optional().default(""),
  name: z.string().min(1, "Name ist erforderlich"),
  email: z.string().email("Gültige E-Mail erforderlich"),
  phone: z.string().optional().default(""),
  message: z.string().min(1, "Bitte geben Sie eine Nachricht ein"),
});

function reference() {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
    date.getDate(),
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KON-${ymd}-${rand}`;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validierung fehlgeschlagen." },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const ref = reference();

  // Serverseitiges Protokoll. In Produktion kann hier eine E-Mail an
  // info@bit-gmbh.de versendet oder ein CRM-Vorgang angelegt werden.
  console.info(
    `[Kontakt ${ref}] ${data.name} <${data.email}>${data.company ? ` (${data.company})` : ""}`,
  );

  return NextResponse.json({ reference: ref, receivedAt: new Date().toISOString() });
}
