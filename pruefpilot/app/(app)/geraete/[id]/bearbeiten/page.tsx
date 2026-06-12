import { notFound } from "next/navigation";
import { DeviceForm } from "@/components/device-form";
import { createClient } from "@/lib/supabase/server";
import type { DeviceRow } from "@/lib/types";
import { updateDevice } from "../../actions";

export default async function EditDevicePage({
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
      <h1 className="text-2xl font-bold">Gerät bearbeiten</h1>
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
