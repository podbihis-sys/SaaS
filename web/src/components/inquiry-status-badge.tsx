import { Badge } from "@/components/ui/badge";
import type { InquiryStatus } from "@/lib/api/types";

const LABELS: Record<InquiryStatus, string> = {
  new: "Neu",
  analyzing: "Analyse läuft",
  analyzed: "Analysiert",
  quoted: "Angebot erstellt",
  accepted: "Angenommen",
  rejected: "Abgelehnt",
};

const VARIANT: Record<InquiryStatus, "default" | "secondary" | "destructive" | "success" | "warning" | "info" | "muted"> = {
  new: "info",
  analyzing: "warning",
  analyzed: "secondary",
  quoted: "default",
  accepted: "success",
  rejected: "destructive",
};

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return <Badge variant={VARIANT[status]}>{LABELS[status]}</Badge>;
}
