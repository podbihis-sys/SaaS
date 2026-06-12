import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
