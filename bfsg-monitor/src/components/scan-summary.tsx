import type { Impact, ScanSummary } from "@/lib/scan-types";

const IMPACT_LABEL: Record<Impact, string> = {
  critical: "Kritisch",
  serious: "Schwer",
  moderate: "Mittel",
  minor: "Gering",
};

const IMPACT_ORDER: Impact[] = ["critical", "serious", "moderate", "minor"];

export function ScanSummaryView({
  summary,
  maxIssues = 10,
}: {
  summary: ScanSummary;
  maxIssues?: number;
}) {
  const { score, counts, totalIssues, issues } = summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-1">
        <div className="text-6xl font-bold tabular-nums">{score}</div>
        <p className="text-sm text-muted-foreground">
          Score (0–100) · {totalIssues} erkannte Probleme
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {IMPACT_ORDER.map((impact) => (
          <div key={impact} className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-semibold tabular-nums">
              {counts[impact]}
            </div>
            <div className="text-xs text-muted-foreground">
              {IMPACT_LABEL[impact]}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Wichtigste Mängel</h2>
        {issues.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine automatisch erkennbaren Verstöße gefunden. Eine ergänzende
            manuelle Prüfung ist dennoch erforderlich.
          </p>
        ) : (
          <ul className="space-y-2">
            {issues.slice(0, maxIssues).map((issue) => (
              <li key={issue.id} className="rounded-lg border p-3 text-left">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium">{issue.help}</span>
                  <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs whitespace-nowrap">
                    {IMPACT_LABEL[issue.impact]} · {issue.nodes}×
                  </span>
                </div>
                <a
                  href={issue.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-muted-foreground underline"
                >
                  Mehr erfahren
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
