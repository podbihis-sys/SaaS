"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { formatEuro, formatDate } from "@/lib/utils/format";
import type { Quote } from "@/lib/api/types";

interface QuotePreviewProps {
  quote: Quote;
  pdfUrl?: string;
}

export function QuotePreview({ quote, pdfUrl }: QuotePreviewProps) {
  if (pdfUrl) {
    return (
      <Card className="overflow-hidden">
        <iframe
          src={pdfUrl}
          title={`Angebot ${quote.number}`}
          className="h-[720px] w-full bg-muted"
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-white p-8 text-zinc-900 dark:bg-zinc-50">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Angebot</h2>
          <p className="text-sm text-zinc-500">Nr. {quote.number}</p>
        </div>
        <div className="text-right text-sm">
          <div>Datum: {formatDate(quote.created_at)}</div>
          {quote.valid_until ? <div>Gültig bis: {formatDate(quote.valid_until)}</div> : null}
        </div>
      </div>

      {quote.customer ? (
        <div className="mt-8 text-sm">
          <div className="font-semibold">{quote.customer.name}</div>
          {quote.customer.address_line1 ? <div>{quote.customer.address_line1}</div> : null}
          {quote.customer.postal_code || quote.customer.city ? (
            <div>
              {quote.customer.postal_code} {quote.customer.city}
            </div>
          ) : null}
        </div>
      ) : null}

      <table className="mt-10 w-full text-sm">
        <thead className="border-b text-left text-xs uppercase text-zinc-500">
          <tr>
            <th className="py-2">Pos.</th>
            <th>Bezeichnung</th>
            <th className="text-right">Menge</th>
            <th className="text-right">Einzelpreis</th>
            <th className="text-right">Gesamt</th>
          </tr>
        </thead>
        <tbody>
          {quote.positions.map((p) => (
            <tr key={`${p.position}-${p.label}`} className="border-b">
              <td className="py-2 align-top">{p.position}</td>
              <td className="py-2 align-top">{p.label}</td>
              <td className="py-2 text-right align-top tabular-nums">
                {p.quantity} {p.unit}
              </td>
              <td className="py-2 text-right align-top tabular-nums">{formatEuro(p.unit_price)}</td>
              <td className="py-2 text-right align-top tabular-nums">{formatEuro(p.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-64 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Zwischensumme</span>
            <span className="tabular-nums">{formatEuro(quote.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>MwSt. ({quote.vat_rate.toFixed(0)}%)</span>
            <span className="tabular-nums">{formatEuro(quote.vat_amount)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Gesamt</span>
            <span className="tabular-nums">{formatEuro(quote.total)}</span>
          </div>
        </div>
      </div>

      {quote.notes ? (
        <div className="mt-10 whitespace-pre-wrap text-sm text-zinc-600">{quote.notes}</div>
      ) : null}
    </Card>
  );
}
