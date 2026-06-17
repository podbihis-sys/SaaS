import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { createServiceClient } from "@/lib/supabase/service";
import { BookingDocument } from "@/lib/pdf/booking-document";
import type { Booking } from "@/types/database";

const BUCKET = "documents";

/**
 * Renders the confirmation + contract PDF for a booking, stores it in the
 * private `documents` bucket under <user_id>/<booking_id>.pdf and writes the
 * path back to bookings.confirmation_pdf_path. Returns the storage path.
 */
export async function generateAndStoreBookingPdf(booking: Booking): Promise<string | null> {
  const supabase = createServiceClient();

  const [{ data: item }, { data: profile }] = await Promise.all([
    supabase.from("items").select("name").eq("id", booking.item_id).maybeSingle(),
    supabase.from("profiles").select("company_name").eq("user_id", booking.user_id).maybeSingle(),
  ]);

  const buffer = await renderToBuffer(
    BookingDocument({
      booking,
      itemName: item?.name ?? "Artikel",
      companyName: profile?.company_name ?? "Verleih",
    }),
  );

  const path = `${booking.user_id}/${booking.id}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: "application/pdf", upsert: true });
  if (uploadError) throw uploadError;

  await supabase.from("bookings").update({ confirmation_pdf_path: path }).eq("id", booking.id);
  return path;
}

/** Owner-scoped signed URL (default 10 min) for a stored document path. */
export async function signedDocumentUrl(path: string, expiresIn = 600): Promise<string | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}
