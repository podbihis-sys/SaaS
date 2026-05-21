import * as React from "react";
import { Sidebar, MobileBottomNav } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
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
