import { DeviceForm } from "@/components/device-form";
import { createDevice } from "../actions";

export default function NewDevicePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Gerät anlegen</h1>
      <p className="mt-1 text-sm text-slate-600">
        Kategorie wählen — das gesetzliche Standard-Prüfintervall wird vorbelegt.
      </p>
      <div className="mt-6">
        <DeviceForm action={createDevice} submitLabel="Gerät anlegen" />
      </div>
    </div>
  );
}
