import { NextResponse } from "next/server";
import { createPublicClient } from "@/app/bit/_lib/supabase-public";

export const dynamic = "force-dynamic";

/** Diagnose: Erreicht die Server-Runtime das CMS? (keine Geheimnisse im Output) */
export async function GET() {
  const started = Date.now();
  const env = {
    url: Boolean(process.env.NEXT_PUBLIC_BIT_SUPABASE_URL),
    key: Boolean(process.env.NEXT_PUBLIC_BIT_SUPABASE_ANON_KEY),
  };
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("bit_faq")
      .select("answer")
      .eq("question", "Wie lange gibt es die BIT Bierther GmbH schon?")
      .maybeSingle();
    return NextResponse.json({
      env,
      ms: Date.now() - started,
      error: error?.message ?? null,
      answer: data?.answer ?? null,
    });
  } catch (e) {
    return NextResponse.json({ env, ms: Date.now() - started, thrown: String(e) });
  }
}
