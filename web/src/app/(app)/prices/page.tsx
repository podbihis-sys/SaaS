"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Upload, Tag } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { CurrencyInput } from "@/components/currency-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pricesApi } from "@/lib/api/prices";
import { priceItemSchema, type PriceItemInput } from "@/lib/utils/validation";
import { useToast } from "@/lib/hooks/use-toast";
import { formatEuro } from "@/lib/utils/format";
import type { PriceItem, PriceKind, PriceUnit } from "@/lib/api/types";

const KIND_LABEL: Record<PriceKind, string> = {
  labor: "Arbeit",
  material: "Material",
  area: "Fläche",
};

const UNITS: PriceUnit[] = ["h", "m²", "m", "kg", "pcs"];

export default function PricesPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = React.useState<PriceItem | null>(null);
  const [open, setOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const query = useQuery({ queryKey: ["prices", "items"], queryFn: () => pricesApi.listItems() });

  const form = useForm<PriceItemInput>({
    resolver: zodResolver(priceItemSchema),
    defaultValues: { kind: "labor", key: "", label: "", unit: "h", price: 0 },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        kind: editing?.kind ?? "labor",
        key: editing?.key ?? "",
        label: editing?.label ?? "",
        unit: editing?.unit ?? "h",
        price: editing?.price ?? 0,
      });
    }
  }, [open, editing, form]);

  const upsert = useMutation({
    mutationFn: async (values: PriceItemInput) => {
      if (editing) return pricesApi.updateItem(editing.id, values);
      return pricesApi.createItem(values);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prices", "items"] });
      toast({ title: editing ? "Position aktualisiert" : "Position erstellt" });
      setOpen(false);
      setEditing(null);
    },
    onError: (err: Error) =>
      toast({ variant: "destructive", title: "Fehler", description: err.message }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => pricesApi.deleteItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prices", "items"] });
      toast({ title: "Gelöscht" });
    },
  });

  const bulkImport = useMutation({
    mutationFn: pricesApi.createItemsBulk,
    onSuccess: (items) => {
      qc.invalidateQueries({ queryKey: ["prices", "items"] });
      toast({ title: `${items.length} Positionen importiert` });
    },
    onError: (err: Error) =>
      toast({ variant: "destructive", title: "Import fehlgeschlagen", description: err.message }),
  });

  const parseCsv = (text: string): PriceItemInput[] => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];
    const [headerLine, ...rest] = lines;
    if (!headerLine) return [];
    const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());
    const idx = (n: string) => headers.indexOf(n);
    const items: PriceItemInput[] = [];
    for (const line of rest) {
      const cols = line.split(",").map((c) => c.trim());
      const kind = cols[idx("kind")] as PriceKind | undefined;
      const key = cols[idx("key")];
      const label = cols[idx("label")];
      const unit = cols[idx("unit")] as PriceUnit | undefined;
      const priceRaw = cols[idx("price")] ?? "0";
      if (!kind || !key || !label || !unit) continue;
      const price = Number(priceRaw.replace(",", "."));
      if (!Number.isFinite(price)) continue;
      items.push({ kind, key, label, unit, price });
    }
    return items;
  };

  const onCsv: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const items = parseCsv(text);
    e.target.value = "";
    if (items.length === 0) {
      toast({ variant: "destructive", title: "CSV leer oder ungültig" });
      return;
    }
    bulkImport.mutate(items);
  };

  const columns: ColumnDef<PriceItem>[] = React.useMemo(
    () => [
      { accessorKey: "kind", header: "Art", cell: ({ row }) => KIND_LABEL[row.original.kind] },
      { accessorKey: "key", header: "Schlüssel", cell: ({ row }) => <code className="text-xs">{row.original.key}</code> },
      { accessorKey: "label", header: "Bezeichnung" },
      { accessorKey: "unit", header: "Einheit" },
      {
        accessorKey: "price",
        header: "Preis",
        cell: ({ row }) => <span className="tabular-nums">{formatEuro(row.original.price)}</span>,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(row.original);
                setOpen(true);
              }}
            >
              Bearbeiten
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Diese Position löschen?")) remove.mutate(row.original.id);
              }}
              aria-label="Löschen"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ),
      },
    ],
    [remove],
  );

  return (
    <>
      <PageHeader
        title="Preisliste"
        description="Stundensätze, Materialien und Flächenpreise verwalten."
        actions={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={onCsv}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload /> CSV importieren
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus /> Neue Position
            </Button>
          </>
        }
      />
      <DataTable
        columns={columns}
        data={query.data ?? []}
        isLoading={query.isLoading}
        emptyState={
          <EmptyState
            icon={<Tag className="h-8 w-8" />}
            title="Noch keine Preise"
            description="Legen Sie Ihre Stundensätze und Materialien an oder importieren Sie eine CSV-Datei."
          />
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Position bearbeiten" : "Neue Position"}</DialogTitle>
            <DialogDescription>Wird in zukünftigen Angeboten verwendet.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={form.handleSubmit((v) => upsert.mutate(v))}
            >
              <FormField
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Art</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(KIND_LABEL) as PriceKind[]).map((k) => (
                          <SelectItem key={k} value={k}>
                            {KIND_LABEL[k]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Einheit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNITS.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schlüssel</FormLabel>
                    <FormControl>
                      <Input placeholder="z. B. labor.painting" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preis</FormLabel>
                    <FormControl>
                      <CurrencyInput value={field.value} onValueChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Bezeichnung</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="sm:col-span-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={upsert.isPending}>
                  {editing ? "Speichern" : "Erstellen"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
