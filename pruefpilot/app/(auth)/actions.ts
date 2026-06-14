"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/zod-schemas";

export interface AuthFormState {
  error?: string;
  message?: string;
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

// Nur app-interne Pfade: "//evil.com" ist eine protokoll-relative URL und muss abgelehnt werden.
function isSafeInternalPath(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
}

export async function register(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Eingaben prüfen" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${appUrl()}/auth/callback?next=/onboarding` },
  });

  if (error) {
    return { error: "Registrierung fehlgeschlagen. Bitte erneut versuchen." };
  }
  if (!data.session) {
    return {
      message:
        "Fast geschafft: Bitte bestätigen Sie Ihre E-Mail-Adresse über den Link in Ihrem Postfach.",
    };
  }
  redirect("/onboarding");
}

export async function login(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Eingaben prüfen" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "E-Mail oder Passwort ist falsch." };
  }

  const next = formData.get("next");
  redirect(isSafeInternalPath(next) ? next : "/dashboard");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
