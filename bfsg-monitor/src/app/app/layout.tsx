import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-suspenders: the proxy already guards /app, but never render the
  // authenticated shell without a verified user.
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, plan, plan_status, company_name")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="flex min-h-svh">
      <AppSidebar
        email={profile?.email ?? user.email ?? ""}
        plan={profile?.plan ?? "free"}
      />
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
