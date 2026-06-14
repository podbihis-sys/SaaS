import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { categoryName } from "@/lib/categories";
import { todayIso } from "@/lib/due";
import {
  reminderBody,
  reminderStageFor,
  reminderSubject,
  type ReminderStage,
} from "@/lib/reminders";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DeviceWithCompany {
  id: string;
  name: string;
  category_id: string;
  next_due_date: string;
  company_id: string;
  companies: { name: string; contact_email: string } | null;
}

interface ReminderLogRow {
  device_id: string;
  stage: ReminderStage;
  due_date: string;
}

function safeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

function addDaysIso(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day) + days * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.REMINDER_FROM ?? "PrüfPilot <onboarding@resend.dev>",
      to: [to],
      subject,
      text,
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend ${response.status}: ${await response.text()}`);
  }
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") ?? "";
  if (!cronSecret || !safeCompare(authHeader, `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dryRun = new URL(request.url).searchParams.get("dryRun") === "1";
  const today = todayIso();
  const horizon = addDaysIso(today, 60);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const admin = createAdminClient();
  const { data: deviceRows, error: devicesError } = await admin
    .from("devices")
    .select("id, name, category_id, next_due_date, company_id, companies(name, contact_email)")
    .eq("status", "active")
    .lte("next_due_date", horizon);
  if (devicesError) {
    return NextResponse.json({ error: devicesError.message }, { status: 500 });
  }

  const devices = (deviceRows ?? []) as unknown as DeviceWithCompany[];
  if (devices.length === 0) {
    return NextResponse.json({ today, processed: 0, sent: 0, failed: 0, dryRun });
  }

  const { data: logRows, error: logError } = await admin
    .from("reminder_log")
    .select("device_id, stage, due_date")
    .in("device_id", devices.map((device) => device.id));
  if (logError) {
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  const sentByDevice = new Map<string, Set<ReminderStage>>();
  for (const log of (logRows ?? []) as ReminderLogRow[]) {
    const device = devices.find((d) => d.id === log.device_id);
    // Nur Logs zur AKTUELLEN Fälligkeit zählen — nach einer Prüfung beginnt der Zyklus neu.
    if (!device || log.due_date !== device.next_due_date) continue;
    const set = sentByDevice.get(log.device_id) ?? new Set<ReminderStage>();
    set.add(log.stage);
    sentByDevice.set(log.device_id, set);
  }

  let sent = 0;
  let failed = 0;
  const planned: Array<{ device: string; stage: ReminderStage; to: string }> = [];

  for (const device of devices) {
    const candidate = reminderStageFor(
      device.next_due_date,
      today,
      sentByDevice.get(device.id) ?? new Set<ReminderStage>(),
    );
    if (!candidate || !device.companies) continue;

    const emailInput = {
      stage: candidate.stage,
      deviceName: device.name,
      categoryName: categoryName(device.category_id),
      dueDate: device.next_due_date,
      daysLeft: candidate.daysLeft,
      companyName: device.companies.name,
      deviceUrl: `${appUrl}/geraete/${device.id}`,
    };
    const recipient = device.companies.contact_email;
    // Empfänger im Dry-Run-Output maskieren (Datenminimierung in Cron-Logs).
    planned.push({
      device: device.name,
      stage: candidate.stage,
      to: recipient.replace(/.(?=.*@)/g, "*"),
    });
    if (dryRun) continue;

    try {
      await sendEmail(recipient, reminderSubject(emailInput), reminderBody(emailInput));
      // ignoreDuplicates: paralleler Doppellauf erzeugt keinen Fehler und keine zweite Mail-Logzeile.
      const { error: insertError } = await admin.from("reminder_log").upsert(
        {
          device_id: device.id,
          company_id: device.company_id,
          stage: candidate.stage,
          due_date: device.next_due_date,
        },
        { onConflict: "device_id,stage,due_date", ignoreDuplicates: true },
      );
      if (insertError) {
        throw new Error(insertError.message);
      }
      sent += 1;
    } catch (error) {
      failed += 1;
      console.error(`Erinnerung fehlgeschlagen (${device.id}, ${candidate.stage}):`, error);
    }
  }

  return NextResponse.json({
    today,
    processed: devices.length,
    planned: planned.length,
    sent,
    failed,
    dryRun,
    ...(dryRun ? { details: planned } : {}),
  });
}
