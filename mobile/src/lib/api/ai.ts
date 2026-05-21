import { apiRequest } from '../api';

export type AIAnalysis = {
  inquiry_id: string;
  summary: string;
  trade: string | null;
  materials: { title: string; quantity: number; unit: string }[];
  labor_hours: number | null;
  estimate_cents: number | null;
  confidence: number | null;
  created_at: string;
};

export function analyzeInquiry(inquiryId: string): Promise<AIAnalysis> {
  return apiRequest<AIAnalysis>(`/api/v1/inquiries/${inquiryId}/ai-analyze`, { method: 'POST' });
}
