import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import { DISCLAIMERS, LAW, WCAG } from "./constants";
import type { Impact, ScanSummary } from "./scan-types";

const IMPACT_LABEL: Record<Impact, string> = {
  critical: "Kritisch",
  serious: "Schwer",
  moderate: "Mittel",
  minor: "Gering",
};
const IMPACT_ORDER: Impact[] = ["critical", "serious", "moderate", "minor"];

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#111", lineHeight: 1.4 },
  brand: { fontSize: 9, color: "#666", marginBottom: 4 },
  h1: { fontSize: 20, fontWeight: 700, marginBottom: 2 },
  sub: { fontSize: 10, color: "#444", marginBottom: 16 },
  scoreRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 12 },
  score: { fontSize: 40, fontWeight: 700 },
  countsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  countBox: { flex: 1, border: "1 solid #ddd", borderRadius: 4, padding: 6, textAlign: "center" },
  countNum: { fontSize: 16, fontWeight: 700 },
  countLabel: { fontSize: 8, color: "#666" },
  h2: { fontSize: 12, fontWeight: 700, marginTop: 8, marginBottom: 6 },
  issue: { borderBottom: "1 solid #eee", paddingBottom: 4, marginBottom: 4 },
  issueTitle: { fontSize: 10, fontWeight: 700 },
  issueMeta: { fontSize: 8, color: "#666" },
  footer: { marginTop: 18, paddingTop: 8, borderTop: "1 solid #ddd", fontSize: 8, color: "#666" },
});

export interface ReportMeta {
  targetUrl: string;
  companyName?: string | null;
  createdAt: string;
  /** Pro plan: show the company name as a branded header. */
  branded: boolean;
}

function ReportDocument({
  summary,
  meta,
}: {
  summary: ScanSummary;
  meta: ReportMeta;
}) {
  const date = new Date(meta.createdAt).toLocaleDateString("de-DE");
  return (
    <Document title={`BFSG-Monitor Bericht — ${meta.targetUrl}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>
          {meta.branded && meta.companyName ? meta.companyName : "BFSG-Monitor"}
        </Text>
        <Text style={styles.h1}>Barrierefreiheits-Bericht</Text>
        <Text style={styles.sub}>
          {meta.targetUrl} · {date} · Standard: {WCAG.standard} {WCAG.level}
        </Text>

        <View style={styles.scoreRow}>
          <Text style={styles.score}>{summary.score}</Text>
          <Text>/ 100 · {summary.totalIssues} erkannte Probleme · {summary.pagesScanned} Seite(n)</Text>
        </View>

        <View style={styles.countsRow}>
          {IMPACT_ORDER.map((impact) => (
            <View key={impact} style={styles.countBox}>
              <Text style={styles.countNum}>{summary.counts[impact]}</Text>
              <Text style={styles.countLabel}>{IMPACT_LABEL[impact]}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.h2}>Priorisierte Mängelliste</Text>
        {summary.issues.length === 0 ? (
          <Text>Keine automatisch erkennbaren Verstöße gefunden.</Text>
        ) : (
          summary.issues.slice(0, 25).map((issue) => (
            <View key={issue.id} style={styles.issue} wrap={false}>
              <Text style={styles.issueTitle}>{issue.help}</Text>
              <Text style={styles.issueMeta}>
                {IMPACT_LABEL[issue.impact]} · {issue.nodes} betroffene Elemente · {issue.id}
              </Text>
            </View>
          ))
        )}

        <View style={styles.footer}>
          <Text>{DISCLAIMERS.automatedCoverage}</Text>
          <Text>{DISCLAIMERS.noGuarantee}</Text>
          <Text>{DISCLAIMERS.noLegalAdvice} · {LAW.name}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function buildReportPdf(
  summary: ScanSummary,
  meta: ReportMeta,
): Promise<Buffer> {
  return renderToBuffer(<ReportDocument summary={summary} meta={meta} />);
}
