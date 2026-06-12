import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// V1-Entscheidung: Der QR-Scan erfordert Login; die next-Kette der Middleware führt nach der
// Anmeldung zurück hierher. Eine öffentliche Leseansicht für externe Prüfer wäre ein bewusster
// Datenschutz-Trade-off und ist als offene Frage im PRD vermerkt.
export default async function DeviceCodeResolverPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("devices")
    .select("id")
    .eq("public_code", code.toUpperCase())
    .maybeSingle();

  if (!data) {
    notFound();
  }
  redirect(`/geraete/${data.id}`);
}
