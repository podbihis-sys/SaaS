import { NextResponse } from "next/server";
import { queryOne } from "@/app/bit/_lib/db";

export const dynamic = "force-dynamic";

/** Diagnose: Erreicht die Server-Runtime die MariaDB? (keine Geheimnisse im Output) */
export async function GET() {
  const started = Date.now();
  const env = {
    host: Boolean(process.env.BIT_DB_HOST ?? process.env.DB_HOST),
    name: Boolean(process.env.BIT_DB_NAME ?? process.env.DB_NAME),
    auth: Boolean(process.env.BIT_AUTH_SECRET),
  };
  try {
    const row = await queryOne<{ answer: string }>(
      "SELECT answer FROM bit_faq WHERE question = ? LIMIT 1",
      ["Wie lange gibt es die BIT Bierther GmbH schon?"],
    );
    return NextResponse.json({
      env,
      ms: Date.now() - started,
      error: null,
      answer: row?.answer ?? null,
    });
  } catch (e) {
    return NextResponse.json({ env, ms: Date.now() - started, thrown: String(e) });
  }
}
