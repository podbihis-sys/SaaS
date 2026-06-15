import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { PrintButton } from "@/components/print-button";
import { categoryName } from "@/lib/categories";
import { createClient } from "@/lib/supabase/server";
import type { DeviceRow } from "@/lib/types";

export default async function DeviceLabelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("devices").select("*").eq("id", id).maybeSingle();
  if (!data) {
    notFound();
  }
  const device = data as DeviceRow;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const qrDataUrl = await QRCode.toDataURL(`${appUrl}/v/${device.verify_token}`, {
    width: 240,
    margin: 1,
  });

  return (
    <div className="mx-auto max-w-sm">
      <div className="no-print mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">QR-Etikett</h1>
        <PrintButton />
      </div>
      <div className="card text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- Data-URL, kein Optimierungsbedarf */}
        <img src={qrDataUrl} alt={`QR-Code für ${device.name}`} className="mx-auto" />
        <p className="mt-3 text-lg font-semibold">{device.name}</p>
        <p className="text-sm text-slate-600">{categoryName(device.category_id)}</p>
        {device.location ? <p className="text-sm text-slate-600">{device.location}</p> : null}
        <p className="mt-2 font-mono text-sm tracking-widest">{device.public_code}</p>
        <p className="mt-3 text-xs text-slate-400">PrüfPilot — Scan öffnet die Geräteakte</p>
      </div>
      <p className="no-print mt-4 text-sm text-slate-500">
        Tipp: Auf selbstklebende Etiketten (z. B. 70×70 mm) drucken und am Gerät anbringen.
      </p>
    </div>
  );
}
