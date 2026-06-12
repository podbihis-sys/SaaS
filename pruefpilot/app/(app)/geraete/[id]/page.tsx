import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { categoryById } from "@/lib/categories";
import { dueInfo, todayIso } from "@/lib/due";
import { createClient } from "@/lib/supabase/server";
import type { DeviceRow } from "@/lib/types";
import { toggleDeviceStatus } from "../actions";

export default async function DeviceDetailPage({
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
  const category = categoryById(device.category_id);
  const due = dueInfo(device.next_due_date, todayIso());

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{device.name}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {category?.nameDe ?? device.category_id}
            {category ? ` · ${category.legalBasis}` : ""}
          </p>
        </div>
        <StatusBadge status={device.status === "retired" ? "retired" : due.status} />
      </div>

      <dl className="card mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Nächste Prüfung</dt>
          <dd className="mt-1 font-medium">
            {device.next_due_date}
            {device.status === "active" ? (
              <span className="ml-2 text-sm font-normal text-slate-500">
                {due.daysLeft < 0
                  ? `${Math.abs(due.daysLeft)} Tage überfällig`
                  : `in ${due.daysLeft} Tagen`}
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Prüfintervall</dt>
          <dd className="mt-1 font-medium">{device.interval_months} Monate</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Standort</dt>
          <dd className="mt-1">{device.location ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Seriennummer</dt>
          <dd className="mt-1">{device.serial_number ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Geräte-Code</dt>
          <dd className="mt-1 font-mono">{device.public_code}</dd>
        </div>
        {device.notes ? (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-slate-500">Notizen</dt>
            <dd className="mt-1 whitespace-pre-wrap">{device.notes}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/geraete/${device.id}/bearbeiten`} className="btn-secondary">
          Bearbeiten
        </Link>
        <Link href={`/geraete/${device.id}/etikett`} className="btn-secondary">
          QR-Etikett drucken
        </Link>
        <form action={toggleDeviceStatus}>
          <input type="hidden" name="deviceId" value={device.id} />
          <input type="hidden" name="currentStatus" value={device.status} />
          <button type="submit" className="btn-secondary">
            {device.status === "active" ? "Stilllegen" : "Wieder aktivieren"}
          </button>
        </form>
      </div>

      <section className="card mt-8 border-dashed text-sm text-slate-500">
        Prüfhistorie und Nachweis-Upload folgen in Milestone 3 (siehe docs/implementation-plan.md).
      </section>
    </div>
  );
}
