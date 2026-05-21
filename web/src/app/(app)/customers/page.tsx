"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { CustomerFormDialog } from "@/components/customer-form-dialog";
import { customersApi } from "@/lib/api/customers";
import { formatDate } from "@/lib/utils/format";
import type { Customer } from "@/lib/api/types";

const PAGE_SIZE = 20;

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const query = useQuery({
    queryKey: ["customers", { search, page }],
    queryFn: () => customersApi.list({ search, page, page_size: PAGE_SIZE }),
  });

  const columns: ColumnDef<Customer>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "email",
        header: "E-Mail",
        cell: ({ row }) => row.original.email ?? "—",
      },
      {
        accessorKey: "phone",
        header: "Telefon",
        cell: ({ row }) => row.original.phone ?? "—",
      },
      {
        accessorKey: "city",
        header: "Ort",
        cell: ({ row }) =>
          [row.original.postal_code, row.original.city].filter(Boolean).join(" ") || "—",
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
      <PageHeader
        title="Kunden"
        description="Alle Auftraggeber im Überblick."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus /> Neuer Kunde
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
        searchPlaceholder="Kunden suchen..."
        isLoading={query.isLoading}
        onRowClick={(row) => router.push(`/customers/${row.id}`)}
        emptyState={
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="Noch keine Kunden"
            description="Legen Sie Ihren ersten Kunden an, um Angebote erstellen zu können."
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus /> Kunde anlegen
              </Button>
            }
          />
        }
      />
      <CustomerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
