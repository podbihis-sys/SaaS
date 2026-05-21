import { apiRequest } from '../api';

export type InquiryStatus = 'new' | 'in_review' | 'quoted' | 'won' | 'lost' | 'archived';

export type InquiryImage = {
  id: string;
  inquiry_id: string;
  storage_path: string;
  url: string | null;
  created_at: string;
};

export type Inquiry = {
  id: string;
  company_id: string;
  customer_id: string | null;
  customer_name?: string | null;
  title: string;
  description: string | null;
  status: InquiryStatus;
  ai_summary: string | null;
  ai_estimate_cents: number | null;
  ai_confidence: number | null;
  images: InquiryImage[];
  created_at: string;
  updated_at: string;
};

export type InquiryListResponse = {
  items: Inquiry[];
  total: number;
};

export function listInquiries(query?: {
  status?: InquiryStatus;
  search?: string;
  limit?: number;
}): Promise<InquiryListResponse> {
  return apiRequest<InquiryListResponse>('/api/v1/inquiries', { query });
}

export function getInquiry(id: string): Promise<Inquiry> {
  return apiRequest<Inquiry>(`/api/v1/inquiries/${id}`);
}

export type InquiryCreateInput = {
  customer_id?: string | null;
  title: string;
  description?: string;
};

export function createInquiry(input: InquiryCreateInput): Promise<Inquiry> {
  return apiRequest<Inquiry>('/api/v1/inquiries', { method: 'POST', body: input });
}

export type SignedUploadResponse = {
  upload_url: string;
  storage_path: string;
  headers?: Record<string, string>;
};

export function createInquiryUpload(
  inquiryId: string,
  input: { filename: string; content_type: string },
): Promise<SignedUploadResponse> {
  return apiRequest<SignedUploadResponse>(`/api/v1/inquiries/${inquiryId}/images/upload-url`, {
    method: 'POST',
    body: input,
  });
}

export function attachInquiryImage(
  inquiryId: string,
  input: { storage_path: string },
): Promise<InquiryImage> {
  return apiRequest<InquiryImage>(`/api/v1/inquiries/${inquiryId}/images`, {
    method: 'POST',
    body: input,
  });
}
