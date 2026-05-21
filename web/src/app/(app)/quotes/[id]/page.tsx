"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, Plus, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CurrencyInput } from "@/components/currency-input";
import { QuotePreview } from "@/components/quote-preview";
import { quotesApi } from "@/lib/api/quotes";
import { formatEuro } from "@/lib/utils/format";
import { useToast } from "@/lib/hooks/use-toast";
import type { Quote, QuotePosition } from "@/lib/api/types";

export default function QuoteDetailPage() {
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["quotes", params.id],
    queryFn: () => quotesApi.get(params.id),
    enabled: !!params.id,
  });

  const [draft, setDraft] = React.useState<Quote | null>(null);
  React.useEffect(() => {
    if (query.data) setDraft(query.data);
  }, [query.data]);

  const recalc = useMutation({
    mutationFn: async (q: Quote) =>
      quotesApi.recalculate(q.id, {
        customer_id: q.customer_id,
        positions: q.positions,
        vat_rate: q.vat_rate,
        notes: q.notes,
        valid_until: q.valid_until,
      }),
    onSuccess: (updated) => setDraft(updated),
  });

  const save = useMutation({
    mutationFn: async (q: Quote) =>
      quotesApi.update(q.id, {
        positions: q.positions,
        vat_rate: q.vat_rate,
        notes: q.notes,
        valid_until: q.valid_until,
      }),
    onSuccess: (updated) => {
      qc.setQueryData(["quotes", updated.id], updated);
      setDraft(updated);
      toast({ title: "Angebot gespeichert" });
    },
    onError: (err: Error) =>
      toast({ variant: "destructive", title: "Fehler", description: err.message }),
  });

  if (query.isLoading || !draft) {
    return <Skeleton className="h-96 w-full" />;
  }

  const updatePosition = (index: number, patch: Partial<QuotePosition>) => {
    setDraft((d) => {
      if (!d) return d;
      const positions = d.positions.map((p, i) => (i === index ? { ...p, ...patch } : p));
      return { ...d, positions };
    });
  };

  const addPosition = () => {
    setDraft((d) => {
      if (!d) return d;
      const next: QuotePosition = {
        position: d.positions.length + 1,
        label: "",
        unit: "h",
        quantity: 1,
        unit_price: 0,
        line_total: 0,
      };
      return { ...d, positions: [...d.positions, next] };
    });
  };

  const removePosition = (index: number) => {
    setDraft((d) => {
      if (!d) return d;
      const positions = d.positions
        .filter((_, i) => i !== index)
        .map((p, i) => ({ ...p, position: i + 1 }));
      return { ...d, positions };
    });
  };

  const pdfUrl = quotesApi.pdfUrl(draft.id);

  return (
    <>
      <PageHeader
        title={`Angebot ${draft.number}`}
        description={`Kunde: ${draft.customer?.name ?? "—"}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/quotes">
                <ArrowLeft /> Zurück
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href={pdfUrl} target="_blank" rel="noreferrer">
                <Download /> PDF
              </a>
            </Button>
            <Button onClick={() => save.mutate(draft)} disabled={save.isPending}>
              <Save /> Speichern
            </Button>
          </>
        }
      />

      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Bearbeiten</TabsTrigger>
          <TabsTrigger value="preview">Vorschau</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-4 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Positionen</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => recalc.mutate(draft)} disabled={recalc.isPending}>
                  Neu berechnen
                </Button>
                <Button size="sm" onClick={addPosition}>
                  <Plus /> Position
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="pb-2 pr-2 font-medium">Pos.</th>
                      <th className="pb-2 pr-2 font-medium">Bezeichnung</th>
                      <th className="pb-2 pr-2 font-medium">Menge</th>
                      <th className="pb-2 pr-2 font-medium">Einheit</th>
                      <th className="pb-2 pr-2 font-medium">Einzelpreis</th>
                      <th className="pb-2 pr-2 text-right font-medium">Gesamt</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {draft.positions.map((p, i) => (
                      <tr key={i} className="border-t align-top">
                        <td className="py-2 pr-2 text-muted-foreground tabular-nums">{p.position}</td>
                        <td className="py-2 pr-2 min-w-[180px]">
                          <Input
                            value={p.label}
                            onChange={(e) => updatePosition(i, { label: e.target.value })}
                          />
                        </td>
                        <td className="py-2 pr-2 w-24">
                          <Input
                            type="number"
                            step="0.01"
                            value={p.quantity}
                            onChange={(e) => updatePosition(i, { quantity: Number(e.target.value) })}
                          />
                        </td>
                        <td className="py-2 pr-2 w-20">
                          <Input
                            value={p.unit}
                            onChange={(e) => updatePosition(i, { unit: e.target.value })}
                          />
                        </td>
                        <td className="py-2 pr-2 w-32">
                          <CurrencyInput
                            value={p.unit_price}
                            onValueChange={(v) => updatePosition(i, { unit_price: v })}
                          />
                        </td>
                        <td className="py-2 pr-2 text-right tabular-nums">
                          {formatEuro(p.quantity * p.unit_price)}
                        </td>
                        <td className="py-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePosition(i)}
                            aria-label="Position entfernen"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {draft.positions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                          Noch keine Positionen.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-col items-end gap-1">
                <div className="flex w-72 justify-between text-sm">
                  <span className="text-muted-foreground">Zwischensumme</span>
                  <span className="tabular-nums">{formatEuro(draft.subtotal)}</span>
                </div>
                <div className="flex w-72 items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">MwSt.</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      className="h-8 w-20"
                      value={draft.vat_rate}
                      onChange={(e) =>
                        setDraft((d) => (d ? { ...d, vat_rate: Number(e.target.value) } : d))
                      }
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="flex w-72 justify-between border-t pt-2 text-base font-semibold">
                  <span>Gesamt</span>
                  <span className="tabular-nums">{formatEuro(draft.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hinweise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="mb-2 block">Gültig bis</Label>
                <Input
                  type="date"
                  value={draft.valid_until?.slice(0, 10) ?? ""}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, valid_until: e.target.value || null } : d))
                  }
                />
              </div>
              <div>
                <Label className="mb-2 block">Notizen / Footer</Label>
                <Textarea
                  rows={4}
                  value={draft.notes ?? ""}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, notes: e.target.value } : d))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <QuotePreview quote={draft} pdfUrl={draft.pdf_url ?? undefined} />
        </TabsContent>
      </Tabs>
    </>
  );
}
