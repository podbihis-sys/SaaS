import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateAndStoreBookingPdf, signedDocumentUrl } from "@/lib/pdf/generate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/booking/[id]/document — owner-only. Returns a short-lived signed URL
 * to the booking's PDF, generating it on demand if it doesn't exist yet.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

  const { id } = await params;
  const supabase = createServiceClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id) // ownership check
    .maybeSingle();

  if (!booking) return NextResponse.json({ error: "Buchung nicht gefunden" }, { status: 404 });

  let path = booking.confirmation_pdf_path;
  if (!path) {
    try {
      path = await generateAndStoreBookingPdf(booking);
    } catch (err) {
      console.error("on-demand pdf generation failed", err);
      return NextResponse.json({ error: "PDF konnte nicht erstellt werden" }, { status: 500 });
    }
  }
  if (!path) return NextResponse.json({ error: "Kein Dokument" }, { status: 404 });

  const url = await signedDocumentUrl(path);
  if (!url) return NextResponse.json({ error: "Signierte URL fehlgeschlagen" }, { status: 500 });
  return NextResponse.redirect(url);
}
