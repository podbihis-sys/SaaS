import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { categoryById, categoryName } from "@/lib/categories";
import { inspectionResultLabel } from "@/lib/inspections";
import { verdictFor, verdictMeta, type VerificationPayload } from "@/lib/verification";

const DATE = new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" });
const DATETIME = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" });
const fmt = (iso: string) => DATE.format(new Date(`${iso}T00:00:00`));

const TONE_COLOR: Record<string, string> = { valid: "#059669", invalid: "#dc2626", neutral: "#475569" };

const s = StyleSheet.create({
  page: { padding: 44, fontSize: 11, fontFamily: "Helvetica", color: "#0f172a" },
  brand: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#1e3a8a" },
  title: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 18 },
  seal: { marginTop: 14, borderRadius: 8, padding: 16, color: "#ffffff" },
  sealLabel: { fontSize: 10, letterSpacing: 2 },
  sealValue: { fontSize: 22, fontFamily: "Helvetica-Bold", marginTop: 2 },
  row: { flexDirection: "row", marginTop: 8 },
  k: { width: "38%", color: "#64748b" },
  v: { width: "62%", fontFamily: "Helvetica-Bold" },
  hr: { borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", marginVertical: 14 },
  small: { fontSize: 8.5, color: "#94a3b8", marginTop: 4 },
  footer: { position: "absolute", bottom: 28, left: 44, right: 44, fontSize: 8, color: "#94a3b8", textAlign: "center" },
});

export async function renderVerifyCertificate(payload: VerificationPayload, verifyUrl: string): Promise<Buffer> {
  const verdict = verdictFor(payload);
  const meta = verdictMeta(verdict);
  const category = categoryById(payload.category_id);
  const doc = (
    <Document title={`Prüfnachweis ${payload.name}`} author="PrüfPilot" subject="Verifizierter Prüfnachweis">
      <Page size="A4" style={s.page}>
        <Text style={s.brand}>PrüfPilot</Text>
        <Text style={s.title}>Verifizierter Prüfnachweis</Text>

        <View style={[s.seal, { backgroundColor: TONE_COLOR[meta.tone] }]}>
          <Text style={s.sealLabel}>PRÜFSTATUS</Text>
          <Text style={s.sealValue}>{meta.label}</Text>
          <Text style={{ fontSize: 9, marginTop: 2 }}>{meta.hint}</Text>
        </View>

        <View style={s.hr} />
        <View style={s.row}><Text style={s.k}>Gerät / Objekt</Text><Text style={s.v}>{payload.name}</Text></View>
        <View style={s.row}><Text style={s.k}>Prüfart</Text><Text style={s.v}>{categoryName(payload.category_id)}</Text></View>
        {category ? <View style={s.row}><Text style={s.k}>Rechtsgrundlage</Text><Text style={s.v}>{category.legalBasis}</Text></View> : null}
        <View style={s.row}><Text style={s.k}>{verdict === "valid" ? "Gültig bis" : "Nächste Prüfung"}</Text><Text style={s.v}>{fmt(payload.next_due_date)}</Text></View>
        <View style={s.row}>
          <Text style={s.k}>Letzte Prüfung</Text>
          <Text style={s.v}>
            {payload.last_inspected_at
              ? `${fmt(payload.last_inspected_at)} · ${payload.last_result ? inspectionResultLabel(payload.last_result) : ""}${payload.last_inspector ? ` · ${payload.last_inspector}` : ""}`
              : "keine dokumentiert"}
          </Text>
        </View>

        <View style={s.hr} />
        <Text style={{ fontSize: 10, color: "#475569" }}>Online verifizieren:</Text>
        <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 2 }}>{verifyUrl}</Text>
        <Text style={s.small}>Erstellt am {DATETIME.format(new Date())}. Dieses Dokument wird live aus der PrüfPilot-Datenbank erzeugt; maßgeblich ist der Online-Status unter der obigen Adresse.</Text>

        <Text style={s.footer} fixed>
          PrüfPilot · Prüfintervalle sind Empfehlungen — maßgeblich sind die für den Betrieb geltenden Vorschriften (ArbSchG, DGUV, BetrSichV).
        </Text>
      </Page>
    </Document>
  );
  return renderToBuffer(doc);
}
