import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { formatEur } from "@/lib/utils";
import { BookingRowActions } from "@/components/booking-row-actions";
import type { BookingStatus } from "@/types/database";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: { key: string; label: string; statuses: BookingStatus[] }[] = [
  { key: "open", label: "Offen", statuses: ["pending", "confirmed", "active"] },
  { key: "all", label: "Alle", statuses: [] },
  { key: "returned", label: "Abgeschlossen", statuses: ["returned", "cancelled", "expired"] },
];

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "open" } = await searchParams;
  const active = STATUS_FILTERS.find((f) => f.key === filter) ?? STATUS_FILTERS[0];

  const supabase = await createServerSupabase();
  let query = supabase
    .from("bookings")
    .select("id, customer_name, customer_email, start_date, end_date, quantity, status, rental_total, deposit_total, deposit_status, item_id")
    .order("start_date", { ascending: true });
  if (active.statuses.length > 0) query = query.in("status", active.statuses);
  const { data: bookings } = await query;

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Buchungen</h1>

      <div className="flex gap-2 text-sm">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/app/bookings?filter=${f.key}`}
            className={`rounded-md px-3 py-1 ${f.key === active.key ? "bg-primary text-primary-foreground" : "border"}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {bookings && bookings.length > 0 ? (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{b.customer_name ?? "—"}</div>
                  <div className="text-sm text-muted-foreground">{b.customer_email}</div>
                  <div className="mt-1 text-sm">
                    {b.start_date} – {b.end_date} · {b.quantity}×
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Miete {formatEur(b.rental_total)} · Kaution {formatEur(b.deposit_total)} (
                    {b.deposit_status})
                  </div>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                  {b.status}
                </span>
              </div>
              <div className="mt-3">
                <BookingRowActions id={b.id} status={b.status} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Keine Buchungen in dieser Ansicht.</p>
      )}
    </div>
  );
}
