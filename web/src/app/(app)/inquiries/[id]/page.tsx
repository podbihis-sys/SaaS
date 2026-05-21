"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Wand2, FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageGallery } from "@/components/image-gallery";
import { AIResultCard } from "@/components/ai-result-card";
import { InquiryStatusBadge } from "@/components/inquiry-status-badge";
import { inquiriesApi } from "@/lib/api/inquiries";
import { quotesApi } from "@/lib/api/quotes";
import { formatDateTime } from "@/lib/utils/format";
import { useToast } from "@/lib/hooks/use-toast";
import type { AIAnalysis, DetectedService } from "@/lib/api/types";

export default function InquiryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();

  const inquiry = useQuery({
    queryKey: ["inquiries", params.id],
    queryFn: () => inquiriesApi.get(params.id),
    enabled: !!params.id,
    refetchInterval: (q) => (q.state.data?.status === "analyzing" ? 3000 : false),
  });

  const analyzeMutation = useMutation({
    mutationFn: () => inquiriesApi.analyze(params.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inquiries", params.id] });
      toast({ title: "KI-Analyse gestartet" });
    },
    onError: (err: Error) =>
      toast({ variant: "destructive", title: "Fehler", description: err.message }),
  });

  const updateAnalysis = useMutation({
    mutationFn: (analysis: AIAnalysis) =>
      inquiriesApi.update(params.id, { ai_analysis: analysis }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inquiries", params.id] }),
  });

  const quoteMutation = useMutation({
    mutationFn: () => quotesApi.fromInquiry(params.id),
    onSuccess: (quote) => {
      toast({ title: "Angebot erstellt" });
      router.push(`/quotes/${quote.id}`);
    },
    onError: (err: Error) =>
      toast({ variant: "destructive", title: "Fehler", description: err.message }),
  });

  if (inquiry.isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!inquiry.data) {
    return <p className="text-sm text-muted-foreground">Anfrage nicht gefunden.</p>;
  }

  const i = inquiry.data;
  const canAnalyze = i.images.length > 0 && i.status !== "analyzing";

  const onChangeServices = (services: DetectedService[]) => {
    if (!i.ai_analysis) return;
    updateAnalysis.mutate({ ...i.ai_analysis, detected_services: services });
  };

  return (
    <>
      <PageHeader
        title={i.title}
        description={`Eingegangen ${formatDateTime(i.created_at)} · Kunde: ${i.customer?.name ?? "—"}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/inquiries">
                <ArrowLeft /> Zurück
              </Link>
            </Button>
            {i.quote_id ? (
              <Button asChild>
                <Link href={`/quotes/${i.quote_id}`}>
                  <FileText /> Angebot ansehen
                </Link>
              </Button>
            ) : (
              <Button onClick={() => quoteMutation.mutate()} disabled={quoteMutation.isPending}>
                <Wand2 /> Angebot erstellen
              </Button>
            )}
          </>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <InquiryStatusBadge status={i.status} />
        {!i.ai_analysis && canAnalyze && (
          <Button size="sm" variant="outline" onClick={() => analyzeMutation.mutate()} disabled={analyzeMutation.isPending}>
            <Sparkles className="h-3.5 w-3.5" /> KI-Analyse starten
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {i.description ? (
            <Card>
              <CardHeader>
                <CardTitle>Beschreibung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{i.description}</p>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Bilder ({i.images.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageGallery images={i.images} />
            </CardContent>
          </Card>
        </div>

        <div>
          {i.ai_analysis ? (
            <AIResultCard
              analysis={i.ai_analysis}
              onChangeServices={onChangeServices}
              onGenerateQuote={i.quote_id ? undefined : () => quoteMutation.mutate()}
              isGenerating={quoteMutation.isPending}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>KI-Analyse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {i.status === "analyzing"
                    ? "Analyse läuft, das dauert nur wenige Sekunden..."
                    : "Starten Sie die Analyse, um Räume, Materialien und Leistungen erkennen zu lassen."}
                </p>
                {canAnalyze && (
                  <Button size="sm" onClick={() => analyzeMutation.mutate()} disabled={analyzeMutation.isPending}>
                    <Sparkles className="h-3.5 w-3.5" /> Analyse starten
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
