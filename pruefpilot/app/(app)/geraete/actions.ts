"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCompany } from "@/lib/data";
import { daysUntil, nextDueFrom, todayIso } from "@/lib/due";
import { makePublicCode } from "@/lib/public-code";
import { createClient } from "@/lib/supabase/server";
import { deviceSchema, inspectionSchema } from "@/lib/zod-schemas";

export interface DeviceFormState {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

function parseDeviceForm(formData: FormData) {
  return deviceSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    location: formData.get("location"),
    serialNumber: formData.get("serialNumber"),
    intervalMonths: formData.get("intervalMonths"),
    lastInspectedAt: formData.get("lastInspectedAt"),
    nextDueDate: formData.get("nextDueDate"),
    notes: formData.get("notes"),
  });
}

function resolveNextDue(data: {
  nextDueDate?: string;
  lastInspectedAt?: string;
  intervalMonths: number;
}): string {
  if (data.nextDueDate) {
    return data.nextDueDate;
  }
  // Schema garantiert: eines von beiden ist gesetzt.
  return nextDueFrom(data.lastInspectedAt!, data.intervalMonths);
}

export async function createDevice(
  _previous: DeviceFormState,
  formData: FormData,
): Promise<DeviceFormState> {
  const company = await getCompany();
  if (!company) {
    redirect("/onboarding");
  }

  const parsed = parseDeviceForm(formData);
  if (!parsed.success) {
    return {
      error: "Bitte Eingaben prüfen.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const row = {
    company_id: company.id,
    category_id: parsed.data.categoryId,
    name: parsed.data.name,
    location: parsed.data.location ?? null,
    serial_number: parsed.data.serialNumber ?? null,
    interval_months: parsed.data.intervalMonths,
    next_due_date: resolveNextDue(parsed.data),
    notes: parsed.data.notes ?? null,
  };

  let deviceId: string | null = null;
  // public_code ist unique — bei Kollision (23505) mit frischem Code erneut versuchen.
  for (let attempt = 0; attempt < 3 && !deviceId; attempt += 1) {
    const { data, error } = await supabase
      .from("devices")
      .insert({ ...row, public_code: makePublicCode() })
      .select("id")
      .single();
    if (data) {
      deviceId = data.id;
    } else if (error && error.code !== "23505") {
      return { error: "Gerät konnte nicht gespeichert werden. Bitte erneut versuchen." };
    }
  }
  if (!deviceId) {
    return { error: "Gerät konnte nicht gespeichert werden. Bitte erneut versuchen." };
  }

  revalidatePath("/geraete");
  revalidatePath("/dashboard");
  redirect(`/geraete/${deviceId}`);
}

export async function updateDevice(
  _previous: DeviceFormState,
  formData: FormData,
): Promise<DeviceFormState> {
  const deviceId = formData.get("deviceId");
  if (typeof deviceId !== "string" || !deviceId) {
    return { error: "Gerät nicht gefunden." };
  }

  const parsed = parseDeviceForm(formData);
  if (!parsed.success) {
    return {
      error: "Bitte Eingaben prüfen.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("devices")
    .update({
      category_id: parsed.data.categoryId,
      name: parsed.data.name,
      location: parsed.data.location ?? null,
      serial_number: parsed.data.serialNumber ?? null,
      interval_months: parsed.data.intervalMonths,
      next_due_date: resolveNextDue(parsed.data),
      notes: parsed.data.notes ?? null,
    })
    .eq("id", deviceId)
    .select("id");

  // RLS filtert fremde IDs heraus: 0 betroffene Zeilen = nicht gefunden oder keine Berechtigung.
  if (error || !data?.length) {
    return { error: "Gerät nicht gefunden oder keine Berechtigung." };
  }

  revalidatePath("/geraete");
  revalidatePath(`/geraete/${deviceId}`);
  revalidatePath(`/geraete/${deviceId}/bearbeiten`);
  revalidatePath("/dashboard");
  redirect(`/geraete/${deviceId}`);
}

export async function toggleDeviceStatus(formData: FormData): Promise<void> {
  const deviceId = formData.get("deviceId");
  if (typeof deviceId !== "string" || !deviceId) {
    return;
  }

  const supabase = await createClient();
  // Ist-Status aus der DB lesen statt dem Formularfeld zu vertrauen.
  const { data: device } = await supabase
    .from("devices")
    .select("id, status")
    .eq("id", deviceId)
    .maybeSingle();
  if (!device) {
    throw new Error("Gerät nicht gefunden oder keine Berechtigung.");
  }

  const { data, error } = await supabase
    .from("devices")
    .update({ status: device.status === "active" ? "retired" : "active" })
    .eq("id", deviceId)
    .select("id");

  if (error || !data?.length) {
    throw new Error("Statuswechsel fehlgeschlagen. Bitte erneut versuchen.");
  }

  revalidatePath("/geraete");
  revalidatePath(`/geraete/${deviceId}`);
  revalidatePath("/dashboard");
}

const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;

export async function recordInspection(
  _previous: DeviceFormState,
  formData: FormData,
): Promise<DeviceFormState> {
  const company = await getCompany();
  if (!company) {
    redirect("/onboarding");
  }

  const deviceId = formData.get("deviceId");
  if (typeof deviceId !== "string" || !deviceId) {
    return { error: "Gerät nicht gefunden." };
  }

  const parsed = inspectionSchema.safeParse({
    inspectedAt: formData.get("inspectedAt"),
    inspectorName: formData.get("inspectorName"),
    result: formData.get("result"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    return {
      error: "Bitte Eingaben prüfen.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  if (daysUntil(parsed.data.inspectedAt, todayIso()) > 0) {
    return {
      error: "Bitte Eingaben prüfen.",
      fieldErrors: { inspectedAt: ["Das Prüfdatum darf nicht in der Zukunft liegen."] },
    };
  }

  const supabase = await createClient();
  const { data: device } = await supabase
    .from("devices")
    .select("id")
    .eq("id", deviceId)
    .maybeSingle();
  if (!device) {
    return { error: "Gerät nicht gefunden oder keine Berechtigung." };
  }

  let documentPath: string | null = null;
  const file = formData.get("document");
  if (file instanceof File && file.size > 0) {
    if (file.type !== "application/pdf") {
      return {
        error: "Bitte Eingaben prüfen.",
        fieldErrors: { document: ["Nur PDF-Dateien sind erlaubt."] },
      };
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      return {
        error: "Bitte Eingaben prüfen.",
        fieldErrors: { document: ["Maximal 8 MB pro Nachweis."] },
      };
    }
    documentPath = `${company.id}/${deviceId}/${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("inspection-docs")
      .upload(documentPath, file, { contentType: "application/pdf" });
    if (uploadError) {
      return { error: "Der Nachweis-Upload ist fehlgeschlagen. Bitte erneut versuchen." };
    }
  }

  const { error } = await supabase.from("inspections").insert({
    device_id: deviceId,
    company_id: company.id,
    inspected_at: parsed.data.inspectedAt,
    inspector_name: parsed.data.inspectorName,
    result: parsed.data.result,
    comment: parsed.data.comment ?? null,
    document_path: documentPath,
  });
  if (error) {
    if (documentPath) {
      // Best-Effort-Aufräumen: verwaiste Datei entfernen, Fehler dabei ignorieren.
      await supabase.storage.from("inspection-docs").remove([documentPath]);
    }
    return { error: "Die Prüfung konnte nicht gespeichert werden. Bitte erneut versuchen." };
  }

  revalidatePath(`/geraete/${deviceId}`);
  revalidatePath("/geraete");
  revalidatePath("/dashboard");
  redirect(`/geraete/${deviceId}`);
}
