"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined;

  async function signInWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">BFSG-Monitor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Melde dich an, um deine Barrierefreiheit zu überwachen.
          </p>
        </div>

        {status === "sent" ? (
          <p className="rounded-md bg-muted p-4 text-sm">
            Wir haben dir einen Magic-Link an <strong>{email}</strong> geschickt.
            Öffne ihn, um dich anzumelden.
          </p>
        ) : (
          <div className="space-y-4">
            <form onSubmit={signInWithEmail} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="du@firma.de"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Wird gesendet…" : "Magic-Link senden"}
              </Button>
            </form>

            <div className="text-center text-xs text-muted-foreground">oder</div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={signInWithGoogle}
            >
              Mit Google anmelden
            </Button>

            {status === "error" && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
