import { NextResponse } from "next/server";

import { getEntitlements } from "@/lib/entitlements";
import { buildReportPdf } from "@/lib/report-pdf";
import type { ScanSummary } from "@/lib/scan-types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Generates the PDF evidence report for a scan, stores it in the private
 * `reports` bucket, and redirects to a short-lived signed URL. Falls back to
 * streaming the PDF directly if storage is unavailable.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ scanId: string }> },
) {
  const { scanId } = await ctx.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: scan } = await supabase
    .from("scans")
    .select("id, target_url, raw_result, created_at")
    .eq("id", scanId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!scan || !scan.raw_result) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_status, company_name")
    .eq("user_id", user.id)
    .single();
  const entitlements = getEntitlements(profile);
  if (!entitlements.pdf) {
    return NextResponse.json({ error: "upgrade_required" }, { status: 403 });
  }

  const summary = scan.raw_result as unknown as ScanSummary;
  const pdf = await buildReportPdf(summary, {
    targetUrl: scan.target_url ?? summary.url,
    companyName: profile?.company_name ?? null,
    createdAt: scan.created_at,
    branded: entitlements.brandedPdf,
  });

  const filename = `bfsg-bericht-${scanId}.pdf`;
  const path = `${user.id}/${scanId}.pdf`;
  const admin = createAdminClient();

  try {
    const { error: uploadError } = await admin.storage
      .from("reports")
      .upload(path, pdf, { contentType: "application/pdf", upsert: true });
    if (uploadError) throw uploadError;

    await admin.from("scans").update({ pdf_path: path }).eq("id", scanId);

    const { data: signed } = await admin.storage
      .from("reports")
      .createSignedUrl(path, 600, { download: filename });
    if (signed?.signedUrl) {
      return NextResponse.redirect(signed.signedUrl);
    }
  } catch (err) {
    console.error("report storage failed, streaming directly", err);
  }

  // Fallback: stream the generated PDF directly.
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
