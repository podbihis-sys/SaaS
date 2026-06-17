import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Booking } from "@/types/database";

export interface BookingDocumentData {
  booking: Booking;
  itemName: string;
  companyName: string;
}

const s = StyleSheet.create({
  page: { padding: 48, fontSize: 11, lineHeight: 1.5, color: "#0f172a", fontFamily: "Helvetica" },
  h1: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  h2: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 18, marginBottom: 6 },
  muted: { color: "#64748b" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  label: { color: "#64748b" },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    fontFamily: "Helvetica-Bold",
  },
  disclaimer: {
    marginTop: 28,
    padding: 8,
    backgroundColor: "#f1f5f9",
    fontSize: 9,
    color: "#475569",
  },
  para: { marginBottom: 6 },
});

function euro(n: number | null | undefined): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    Number(n ?? 0),
  );
}

const DISCLAIMER = "Muster ohne Gewähr, keine Rechtsberatung.";

/** Two-page PDF: page 1 booking confirmation, page 2 simple rental contract. */
export function BookingDocument({ booking, itemName, companyName }: BookingDocumentData) {
  return (
    <Document title={`Buchung ${booking.id}`}>
      {/* Page 1 — Buchungsbestätigung */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Buchungsbestätigung</Text>
        <Text style={s.muted}>{companyName}</Text>

        <View style={{ marginTop: 16 }}>
          <View style={s.row}>
            <Text style={s.label}>Buchungsnummer</Text>
            <Text>{booking.id}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Kunde</Text>
            <Text>{booking.customer_name ?? "—"}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>E-Mail</Text>
            <Text>{booking.customer_email ?? "—"}</Text>
          </View>
        </View>

        <Text style={s.h2}>Mietsache</Text>
        <View style={s.row}>
          <Text style={s.label}>Artikel</Text>
          <Text>{itemName}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Zeitraum</Text>
          <Text>
            {booking.start_date} bis {booking.end_date} (inkl.)
          </Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Menge</Text>
          <Text>{booking.quantity}</Text>
        </View>

        <Text style={s.h2}>Beträge</Text>
        <View style={s.row}>
          <Text style={s.label}>Miete</Text>
          <Text>{euro(booking.rental_total)}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Kaution (Rückerstattung bei ordnungsgemäßer Rückgabe)</Text>
          <Text>{euro(booking.deposit_total)}</Text>
        </View>
        <View style={s.total}>
          <Text>Gezahlt</Text>
          <Text>{euro(Number(booking.rental_total ?? 0) + Number(booking.deposit_total ?? 0))}</Text>
        </View>

        <Text style={s.disclaimer}>{DISCLAIMER}</Text>
      </Page>

      {/* Page 2 — Einfacher Mietvertrag */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Mietvertrag</Text>

        <Text style={s.h2}>§ 1 Parteien</Text>
        <Text style={s.para}>
          Vermieter: {companyName}. Mieter: {booking.customer_name ?? "—"}
          {booking.customer_email ? `, ${booking.customer_email}` : ""}.
        </Text>

        <Text style={s.h2}>§ 2 Mietsache & Zeitraum</Text>
        <Text style={s.para}>
          {booking.quantity}× {itemName}, Mietzeit vom {booking.start_date} bis {booking.end_date}{" "}
          (jeweils inklusive).
        </Text>

        <Text style={s.h2}>§ 3 Miete & Kaution</Text>
        <Text style={s.para}>
          Miete: {euro(booking.rental_total)}. Kaution: {euro(booking.deposit_total)}. Die Kaution
          wird bei ordnungsgemäßer und fristgerechter Rückgabe vollständig erstattet.
        </Text>

        <Text style={s.h2}>§ 4 Rückgabe</Text>
        <Text style={s.para}>
          Die Mietsache ist spätestens am Ende der Mietzeit im überlassenen Zustand zurückzugeben.
          Bei Beschädigung oder verspäteter Rückgabe können Kosten von der Kaution einbehalten
          werden.
        </Text>

        <Text style={s.h2}>§ 5 Haftung</Text>
        <Text style={s.para}>
          Der Mieter haftet für Schäden, die während der Mietzeit an der Mietsache entstehen, sofern
          er diese zu vertreten hat.
        </Text>

        <Text style={s.disclaimer}>{DISCLAIMER}</Text>
      </Page>
    </Document>
  );
}
