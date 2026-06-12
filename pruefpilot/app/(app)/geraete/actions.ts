"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCompany } from "@/lib/data";
import { nextDueFrom } from "@/lib/due";
import { makePublicCode } from "@/lib/public-code";
import { createClient } from "@/lib/supabase/server";
import { deviceSchema } from "@/lib/zod-schemas";

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
  const { error } = await supabase
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
    .eq("id", deviceId);

  if (error) {
    return { error: "Änderungen konnten nicht gespeichert werden." };
  }

  revalidatePath("/geraete");
  revalidatePath(`/geraete/${deviceId}`);
  revalidatePath("/dashboard");
  redirect(`/geraete/${deviceId}`);
}

export async function toggleDeviceStatus(formData: FormData): Promise<void> {
  const deviceId = formData.get("deviceId");
  const currentStatus = formData.get("currentStatus");
  if (typeof deviceId !== "string" || typeof currentStatus !== "string") {
    return;
  }

  const supabase = await createClient();
  await supabase
    .from("devices")
    .update({ status: currentStatus === "active" ? "retired" : "active" })
    .eq("id", deviceId);

  revalidatePath("/geraete");
  revalidatePath(`/geraete/${deviceId}`);
  revalidatePath("/dashboard");
}
