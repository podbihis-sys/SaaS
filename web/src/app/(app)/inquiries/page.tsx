"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Inbox, Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { InquiryStatusBadge } from "@/components/inquiry-status-badge";
import { inquiriesApi } from "@/lib/api/inquiries";
import { formatDateTime } from "@/lib/utils/format";
import type { Inquiry } from "@/lib/api/types";
import Link from "next/link";

const PAGE_SIZE = 20;

export default function InquiriesPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const query = useQuery({
    queryKey: ["inquiries", { search, page }],
    queryFn: () => inquiriesApi.list({ search, page, page_size: PAGE_SIZE }),
  });

  const columns: ColumnDef<Inquiry>[] = React.useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Titel",
        cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
      },
      {
        accessorKey: "customer",
        header: "Kunde",
        cell: ({ row }) => row.original.customer?.name ?? "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <InquiryStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "images",
        header: "Bilder",
        cell: ({ row }) => row.original.images.length,
      },
      {
        accessorKey: "created_at",
        header: "Erstellt",
        cell: ({ row }) => formatDateTime(row.original.created_at),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Anfragen"
        description="Kundenanfragen mit KI-Analyse."
        actions={
          <Button asChild>
            <Link href="/inquiries/new">
              <Plus /> Neue Anfrage
            </Link>
          </Button>
        }
      />
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
        searchPlaceholder="Anfragen suchen..."
        isLoading={query.isLoading}
        onRowClick={(row) => router.push(`/inquiries/${row.id}`)}
        emptyState={
          <EmptyState
            icon={<Inbox className="h-8 w-8" />}
            title="Noch keine Anfragen"
            description="Erfassen Sie eine erste Anfrage mit Bildern, um eine KI-Analyse zu erhalten."
            action={
              <Button asChild>
                <Link href="/inquiries/new">
                  <Plus /> Anfrage anlegen
                </Link>
              </Button>
            }
          />
        }
      />
    </>
  );
}
