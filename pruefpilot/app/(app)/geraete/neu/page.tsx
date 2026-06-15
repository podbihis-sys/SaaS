import Link from "next/link";
import { DeviceForm } from "@/components/device-form";
import { createDevice } from "../actions";

export default function NewDevicePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/geraete" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-blue-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
        Alle Geräte
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Gerät anlegen</h1>
      <p className="mt-1 text-sm text-slate-600">Kategorie wählen — das gesetzliche Standard-Prüfintervall wird vorbelegt.</p>
      <div className="mt-6">
        <DeviceForm action={createDevice} submitLabel="Gerät anlegen" />
      </div>
    </div>
  );
}
