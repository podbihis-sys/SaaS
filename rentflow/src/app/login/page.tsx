"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/app";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "");

  async function sendMagicLink() {
    setError(null);
    setLoading(true);
    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  async function signInWithGoogle() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}` },
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-bold">Anmelden bei RentFlow</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Per Magic-Link oder Google. Beim ersten Login wird dein Betrieb angelegt.
      </p>

      {sent ? (
        <div className="mt-6 rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-800">
          Prüfe dein Postfach: Wir haben dir einen Anmeldelink an <strong>{email}</strong> geschickt.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <input
            type="email"
            className="w-full rounded-md border bg-background px-3 py-2"
            placeholder="du@betrieb.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="w-full" onClick={sendMagicLink} disabled={loading || !email}>
            {loading ? "Sende…" : "Magic-Link senden"}
          </Button>
          <Button variant="outline" className="w-full" onClick={signInWithGoogle}>
            Mit Google anmelden
          </Button>
        </div>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
