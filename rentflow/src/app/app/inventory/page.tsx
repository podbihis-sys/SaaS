import { createServerSupabase } from "@/lib/supabase/server";
import { formatEur } from "@/lib/utils";
import { ItemForm } from "@/components/item-form";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const supabase = await createServerSupabase();
  const { data: items } = await supabase
    .from("items")
    .select("id, name, category, quantity, price_per_day, deposit_amount, active")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventar</h1>
      </div>

      <ItemForm />

      {items && items.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2">Artikel</th>
              <th>Menge</th>
              <th>€/Tag</th>
              <th>Kaution</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="py-2">
                  <div className="font-medium">{i.name}</div>
                  {i.category ? <div className="text-xs text-muted-foreground">{i.category}</div> : null}
                </td>
                <td>{i.quantity}</td>
                <td>{formatEur(i.price_per_day)}</td>
                <td>{formatEur(i.deposit_amount)}</td>
                <td>{i.active ? "aktiv" : "inaktiv"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-muted-foreground">Noch keine Artikel. Lege deinen ersten an.</p>
      )}
    </div>
  );
}
