import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

const NAV = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/inventory", label: "Inventar" },
  { href: "/app/bookings", label: "Buchungen" },
  { href: "/app/billing", label: "Abrechnung & Connect" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r p-4 sm:block">
        <Link href="/app" className="block px-2 text-lg font-bold">
          RentFlow
        </Link>
        <nav className="mt-6 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-2 py-2 text-sm hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/auth/signout" method="post" className="mt-6">
          <button className="px-2 text-sm text-muted-foreground hover:underline">Abmelden</button>
        </form>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
