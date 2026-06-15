import Link from "next/link";
import { notFound } from "next/navigation";
import { InspectionForm } from "@/components/inspection-form";
import { categoryName } from "@/lib/categories";
import { todayIso } from "@/lib/due";
import { createClient } from "@/lib/supabase/server";
import type { DeviceRow } from "@/lib/types";

export default async function RecordInspectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("devices").select("*").eq("id", id).maybeSingle();
  if (!data) {
    notFound();
  }
  const device = data as DeviceRow;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/geraete/${device.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-blue-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
        Zurück zum Gerät
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Prüfung erfassen</h1>
      <p className="mt-1 text-sm text-slate-600">{device.name} · {categoryName(device.category_id)} · Intervall {device.interval_months} Monate</p>
      <div className="mt-6">
        <InspectionForm deviceId={device.id} defaultDate={todayIso()} />
      </div>
    </div>
  );
}
