"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar, MobileBottomNav } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { useAuthMe } from "@/lib/hooks/use-company";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const me = useAuthMe();

  React.useEffect(() => {
    if (me.data && me.data.companies.length === 0) {
      router.replace("/onboarding");
    }
  }, [me.data, router]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 pb-20 md:pb-0">
          <div className="container py-6 md:py-8">{children}</div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
