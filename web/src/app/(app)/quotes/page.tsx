"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { quotesApi } from "@/lib/api/quotes";
import { formatDate, formatEuro } from "@/lib/utils/format";
import type { Quote, QuoteStatus } from "@/lib/api/types";

const PAGE_SIZE = 20;

const STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: "Entwurf",
  sent: "Gesendet",
  accepted: "Angenommen",
  rejected: "Abgelehnt",
  expired: "Abgelaufen",
};

const STATUS_VARIANT: Record<
  QuoteStatus,
  "default" | "secondary" | "destructive" | "success" | "warning" | "info" | "muted"
> = {
  draft: "muted",
  sent: "info",
  accepted: "success",
  rejected: "destructive",
  expired: "warning",
};

export default function QuotesPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const query = useQuery({
    queryKey: ["quotes", { search, page }],
    queryFn: () => quotesApi.list({ search, page, page_size: PAGE_SIZE }),
  });

  const columns: ColumnDef<Quote>[] = React.useMemo(
    () => [
      {
        accessorKey: "number",
        header: "Nummer",
        cell: ({ row }) => <span className="font-medium">{row.original.number}</span>,
      },
      {
        accessorKey: "customer",
        header: "Kunde",
        cell: ({ row }) => row.original.customer?.name ?? "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status]}>
            {STATUS_LABEL[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "total",
        header: "Gesamt",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatEuro(row.original.total)}</span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Erstellt",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader title="Angebote" description="Alle erstellten Angebote und Kalkulationen." />
      <DataTable
        columns={columns}
        data={query.data?.items ?? []}
        total={query.data?.total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Angebote suchen..."
        isLoading={query.isLoading}
        onRowClick={(row) => router.push(`/quotes/${row.id}`)}
        emptyState={
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="Noch keine Angebote"
            description="Erstellen Sie aus einer Anfrage Ihr erstes Angebot."
          />
        }
      />
    </>
  );
}
