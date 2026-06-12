import { notFound } from "next/navigation";
import { InspectionForm } from "@/components/inspection-form";
import { categoryName } from "@/lib/categories";
import { todayIso } from "@/lib/due";
import { createClient } from "@/lib/supabase/server";
import type { DeviceRow } from "@/lib/types";

export default async function RecordInspectionPage({
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

  return (
    <div>
      <h1 className="text-2xl font-bold">Prüfung erfassen</h1>
      <p className="mt-1 text-sm text-slate-600">
        {device.name} · {categoryName(device.category_id)} · Intervall {device.interval_months}{" "}
        Monate
      </p>
      <div className="mt-6">
        <InspectionForm deviceId={device.id} defaultDate={todayIso()} />
      </div>
    </div>
  );
}
