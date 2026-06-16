"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { runFreeScan, type FreeScanState } from "./actions";

const INITIAL: FreeScanState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Wird geprüft…" : "Jetzt prüfen"}
    </Button>
  );
}

export function FreeScanForm() {
  const [state, formAction] = useActionState(runFreeScan, INITIAL);

  return (
    <form action={formAction} className="w-full max-w-md space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="url"
          type="text"
          required
          inputMode="url"
          autoComplete="url"
          placeholder="https://ihre-firma.de"
          aria-label="Website-URL"
        />
        <SubmitButton />
      </div>
      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Es wird nur die öffentlich erreichbare Startseite geprüft. Keine
        Anmeldung nötig.
      </p>
    </form>
  );
}
