import { api } from "./client";
import type { AIAnalysis, UUID } from "./types";

export const aiApi = {
  analyzeInquiry: (id: UUID) =>
    api.post<{ status: "analyzing" | "analyzed"; analysis?: AIAnalysis }>(
      `/api/v1/inquiries/${id}/analyze`,
    ),
  refineAnalysis: (id: UUID, analysis: AIAnalysis) =>
    api.patch<AIAnalysis>(`/api/v1/inquiries/${id}`, { ai_analysis: analysis }),
};
