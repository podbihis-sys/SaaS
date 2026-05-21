"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerFormDialog } from "@/components/customer-form-dialog";
import { customersApi } from "@/lib/api/customers";
import { inquiriesApi } from "@/lib/api/inquiries";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { InquiryStatusBadge } from "@/components/inquiry-status-badge";
import { useToast } from "@/lib/hooks/use-toast";
import Link from "next/link";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = React.useState(false);

  const customer = useQuery({
    queryKey: ["customers", params.id],
    queryFn: () => customersApi.get(params.id),
    enabled: !!params.id,
  });

  const inquiries = useQuery({
    queryKey: ["inquiries", { customer_id: params.id }],
    queryFn: () => inquiriesApi.list({ page: 1, page_size: 20, search: params.id }),
    enabled: !!params.id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => customersApi.delete(params.id),
    onSuccess: () => {
      toast({ title: "Kunde gelöscht" });
      qc.invalidateQueries({ queryKey: ["customers"] });
      router.push("/customers");
    },
    onError: (err: Error) =>
      toast({ variant: "destructive", title: "Fehler", description: err.message }),
  });

  if (customer.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!customer.data) {
    return <p className="text-sm text-muted-foreground">Kunde nicht gefunden.</p>;
  }

  const c = customer.data;

  return (
    <>
      <PageHeader
        title={c.name}
        description={`Kunde seit ${formatDate(c.created_at)}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil /> Bearbeiten
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Diesen Kunden wirklich löschen?")) deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 /> Löschen
            </Button>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kontakt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="E-Mail" value={c.email} />
            <Row label="Telefon" value={c.phone} />
            <Row label="Adresse" value={c.address_line1} />
            <Row label="PLZ / Ort" value={[c.postal_code, c.city].filter(Boolean).join(" ")} />
            <Row label="Land" value={c.country} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notizen</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap text-muted-foreground">
            {c.notes || "Keine Notizen."}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Anfragen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(inquiries.data?.items ?? []).filter((i) => i.customer_id === c.id).length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Anfragen.</p>
          ) : (
            inquiries.data?.items
              .filter((i) => i.customer_id === c.id)
              .map((i) => (
                <Link
                  key={i.id}
                  href={`/inquiries/${i.id}`}
                  className="flex items-center justify-between gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{i.title}</div>
                    <div className="text-xs text-muted-foreground">{formatDateTime(i.created_at)}</div>
                  </div>
                  <InquiryStatusBadge status={i.status} />
                </Link>
              ))
          )}
        </CardContent>
      </Card>

      <CustomerFormDialog open={editOpen} onOpenChange={setEditOpen} customer={c} />
    </>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value || "—"}</span>
    </div>
  );
}
