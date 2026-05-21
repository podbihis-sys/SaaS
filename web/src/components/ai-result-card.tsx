"use client";

import * as React from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { AIAnalysis, DetectedService } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  const variant = pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full transition-all", variant)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export interface AIResultCardProps {
  analysis: AIAnalysis;
  onChangeServices?: (services: DetectedService[]) => void;
  onGenerateQuote?: () => void;
  isGenerating?: boolean;
}

export function AIResultCard({
  analysis,
  onChangeServices,
  onGenerateQuote,
  isGenerating,
}: AIResultCardProps) {
  const updateQty = (index: number, qty: number) => {
    if (!onChangeServices) return;
    const next = analysis.detected_services.map((s, i) => (i === index ? { ...s, quantity: qty } : s));
    onChangeServices(next);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle>KI-Analyse</CardTitle>
        </div>
        {onGenerateQuote ? (
          <Button size="sm" onClick={onGenerateQuote} disabled={isGenerating}>
            <Wand2 className="h-4 w-4" /> Angebot erstellen
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {analysis.summary ? (
          <p className="text-sm text-muted-foreground">{analysis.summary}</p>
        ) : null}

        {analysis.rooms.length > 0 && (
          <section>
            <h4 className="mb-2 text-sm font-semibold">Räume</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.rooms.map((r, i) => (
                <Badge key={`${r.label}-${i}`} variant="secondary">
                  {r.label}
                  {r.area_m2 ? ` · ${r.area_m2} m²` : ""}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {analysis.materials.length > 0 && (
          <section>
            <h4 className="mb-2 text-sm font-semibold">Materialien</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.materials.map((m, i) => (
                <Badge key={`${m.label}-${i}`} variant="outline">
                  {m.label}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {analysis.damages.length > 0 && (
          <section>
            <h4 className="mb-2 text-sm font-semibold">Schäden</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.damages.map((d, i) => (
                <Badge key={`${d.label}-${i}`} variant="warning">
                  {d.label}
                  {d.severity ? ` · ${d.severity}` : ""}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {analysis.detected_services.length > 0 && (
          <section>
            <Separator className="mb-4" />
            <h4 className="mb-3 text-sm font-semibold">Erkannte Leistungen</h4>
            <div className="space-y-3">
              {analysis.detected_services.map((s, i) => (
                <div key={`${s.key}-${i}`} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.key}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={s.quantity}
                        onChange={(e) => updateQty(i, Number(e.target.value))}
                        className="h-8 w-24"
                        disabled={!onChangeServices}
                      />
                      <span className="text-xs text-muted-foreground">{s.unit}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <ConfidenceBar value={s.confidence} />
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {Math.round(s.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
