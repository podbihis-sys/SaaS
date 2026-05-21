"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Inbox, Users, FileText, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { customersApi } from "@/lib/api/customers";
import { inquiriesApi } from "@/lib/api/inquiries";
import { quotesApi } from "@/lib/api/quotes";
import { formatEuro, formatDate } from "@/lib/utils/format";
import { InquiryStatusBadge } from "@/components/inquiry-status-badge";

interface MetricCardProps {
  title: string;
  value: string | number;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

function MetricCard({ title, value, href, icon: Icon }: MetricCardProps) {
  return (
    <Link href={href} className="block">
      <Card className="transition-shadow hover:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tabular-nums">{value}</div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const customers = useQuery({
    queryKey: ["customers", "count"],
    queryFn: () => customersApi.list({ page: 1, page_size: 1 }),
  });
  const inquiries = useQuery({
    queryKey: ["inquiries", "recent"],
    queryFn: () => inquiriesApi.list({ page: 1, page_size: 5 }),
  });
  const quotes = useQuery({
    queryKey: ["quotes", "recent"],
    queryFn: () => quotesApi.list({ page: 1, page_size: 5 }),
  });

  return (
    <>
      <PageHeader
        title="Übersicht"
        description="Aktuelle Aktivität in Ihrem Betrieb."
        actions={
          <Button asChild>
            <Link href="/inquiries/new">
              <Plus /> Neue Anfrage
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Kunden" value={customers.data?.total ?? "—"} href="/customers" icon={Users} />
        <MetricCard title="Anfragen" value={inquiries.data?.total ?? "—"} href="/inquiries" icon={Inbox} />
        <MetricCard title="Angebote" value={quotes.data?.total ?? "—"} href="/quotes" icon={FileText} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Letzte Anfragen</CardTitle>
                <CardDescription>Eingehende Aufträge im Überblick</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/inquiries">
                  Alle <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {(inquiries.data?.items ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Anfragen.</p>
            ) : (
              inquiries.data?.items.map((i) => (
                <Link
                  key={i.id}
                  href={`/inquiries/${i.id}`}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{i.title}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(i.created_at)}</div>
                  </div>
                  <InquiryStatusBadge status={i.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Letzte Angebote</CardTitle>
                <CardDescription>Erstellte Kalkulationen</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/quotes">
                  Alle <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {(quotes.data?.items ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Angebote.</p>
            ) : (
              quotes.data?.items.map((q) => (
                <Link
                  key={q.id}
                  href={`/quotes/${q.id}`}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{q.number}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(q.created_at)}</div>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{formatEuro(q.total)}</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
