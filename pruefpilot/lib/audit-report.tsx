import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { DEVICE_CATEGORIES, categoryName } from "@/lib/categories";
import { dueStatus, type DueStatus } from "@/lib/due";
import { inspectionResultLabel } from "@/lib/inspections";
import type { DeviceRow, InspectionRow } from "@/lib/types";

const DATE_FORMAT = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeZone: "Europe/Berlin",
});

function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(`${iso}T00:00:00`));
}

const STATUS_LABELS: Record<DueStatus | "retired", string> = {
  overdue: "ÜBERFÄLLIG",
  due_30: "fällig ≤ 30 Tage",
  due_60: "fällig ≤ 60 Tage",
  ok: "OK",
  retired: "stillgelegt",
};

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica", color: "#0f172a" },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#475569", marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 14, marginBottom: 2 },
  sectionLegal: { fontSize: 8, color: "#64748b", marginBottom: 6 },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingVertical: 3 },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
    paddingVertical: 3,
    fontFamily: "Helvetica-Bold",
  },
  colName: { width: "24%", paddingRight: 4 },
  colLocation: { width: "16%", paddingRight: 4 },
  colInterval: { width: "10%", paddingRight: 4 },
  colDue: { width: "14%", paddingRight: 4 },
  colStatus: { width: "14%", paddingRight: 4 },
  colLast: { width: "22%" },
  summary: { marginTop: 4, marginBottom: 8, fontSize: 10 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    fontSize: 7,
    color: "#94a3b8",
    textAlign: "center",
  },
  emptyNote: { fontSize: 9, color: "#64748b", paddingVertical: 4 },
});

export interface AuditReportData {
  companyName: string;
  generatedAt: string;
  today: string;
  devices: DeviceRow[];
  latestInspectionByDevice: Map<string, InspectionRow>;
  evidenceCount: number;
}

function AuditReport({ data }: { data: AuditReportData }) {
  const activeDevices = data.devices.filter((device) => device.status === "active");
  const counts = activeDevices.reduce(
    (acc, device) => {
      acc[dueStatus(device.next_due_date, data.today)] += 1;
      return acc;
    },
    { overdue: 0, due_30: 0, due_60: 0, ok: 0 } as Record<DueStatus, number>,
  );

  return (
    <Document
      title={`Prüfbericht ${data.companyName}`}
      author="PrüfPilot"
      subject="Übersicht gesetzlicher Prüfungen"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Prüfbericht — {data.companyName}</Text>
        <Text style={styles.subtitle}>
          Stichtag {formatDate(data.today)} · erstellt am {data.generatedAt} · lückenlos
          dokumentiert mit PrüfPilot
        </Text>

        <Text style={styles.summary}>
          {activeDevices.length} aktive Geräte/Objekte · {counts.overdue} überfällig ·{" "}
          {counts.due_30} fällig ≤ 30 Tage · {counts.due_60} fällig ≤ 60 Tage · {counts.ok} im
          Plan · {data.evidenceCount} hinterlegte Prüfnachweise (PDF)
        </Text>

        {DEVICE_CATEGORIES.map((category) => {
          const devices = data.devices.filter((device) => device.category_id === category.id);
          if (devices.length === 0) return null;
          return (
            <View key={category.id}>
              {/* Kopf bleibt zusammen; Zeilen dürfen über Seiten laufen — wrap={false}
                  auf der ganzen Sektion würde große Gerätelisten still abschneiden. */}
              <View wrap={false}>
              <Text style={styles.sectionTitle}>{category.nameDe}</Text>
              <Text style={styles.sectionLegal}>Rechtsgrundlage: {category.legalBasis}</Text>
              <View style={styles.headerRow}>
                <Text style={styles.colName}>Gerät/Objekt</Text>
                <Text style={styles.colLocation}>Standort</Text>
                <Text style={styles.colInterval}>Intervall</Text>
                <Text style={styles.colDue}>Nächste Prüfung</Text>
                <Text style={styles.colStatus}>Status</Text>
                <Text style={styles.colLast}>Letzte Prüfung</Text>
              </View>
              </View>
              {devices.map((device) => {
                const latest = data.latestInspectionByDevice.get(device.id);
                const status =
                  device.status === "retired"
                    ? "retired"
                    : dueStatus(device.next_due_date, data.today);
                return (
                  <View key={device.id} style={styles.row} wrap={false}>
                    <Text style={styles.colName}>{device.name}</Text>
                    <Text style={styles.colLocation}>{device.location ?? "—"}</Text>
                    <Text style={styles.colInterval}>{device.interval_months} M</Text>
                    <Text style={styles.colDue}>{formatDate(device.next_due_date)}</Text>
                    <Text style={styles.colStatus}>{STATUS_LABELS[status]}</Text>
                    <Text style={styles.colLast}>
                      {latest
                        ? `${formatDate(latest.inspected_at)} · ${inspectionResultLabel(latest.result)} · ${latest.inspector_name}${latest.document_path ? " · Nachweis ✓" : ""}`
                        : "keine dokumentiert"}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}

        {data.devices.length === 0 ? (
          <Text style={styles.emptyNote}>Noch keine Geräte erfasst.</Text>
        ) : null}

        <Text style={styles.footer} fixed>
          PrüfPilot · Prüfintervalle sind Empfehlungen — maßgeblich sind die für den Betrieb
          geltenden Vorschriften · Seite wird automatisch nummeriert
        </Text>
      </Page>
    </Document>
  );
}

export async function renderAuditPdf(data: AuditReportData): Promise<Buffer> {
  return renderToBuffer(<AuditReport data={data} />);
}
