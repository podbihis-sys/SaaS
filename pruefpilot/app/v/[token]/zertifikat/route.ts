import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderVerifyCertificate } from "@/lib/verify-certificate";
import type { VerificationPayload } from "@/lib/verification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("verify_device", { p_token: token });
  const payload = (data ?? null) as VerificationPayload | null;
  if (!payload) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const buffer = await renderVerifyCertificate(payload, `${appUrl}/v/${token}`);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="pruefnachweis.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
