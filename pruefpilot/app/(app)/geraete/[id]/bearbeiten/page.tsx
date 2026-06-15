import Link from "next/link";
import { notFound } from "next/navigation";
import { DeviceForm } from "@/components/device-form";
import { createClient } from "@/lib/supabase/server";
import type { DeviceRow } from "@/lib/types";
import { updateDevice } from "../../actions";

export default async function EditDevicePage({ params }: { params: Promise<{ id: string }> }) {
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
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Gerät bearbeiten</h1>
      <div className="mt-6">
        <DeviceForm
          action={updateDevice}
          submitLabel="Änderungen speichern"
          deviceId={device.id}
          defaults={{
            name: device.name,
            categoryId: device.category_id,
            location: device.location ?? undefined,
            serialNumber: device.serial_number ?? undefined,
            intervalMonths: device.interval_months,
            nextDueDate: device.next_due_date,
            notes: device.notes ?? undefined,
          }}
        />
      </div>
    </div>
  );
}
