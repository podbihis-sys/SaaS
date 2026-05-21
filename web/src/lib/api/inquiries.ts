import { api } from "./client";
import type {
  AIAnalysis,
  Inquiry,
  InquiryUpdate,
  InquiryWrite,
  ListParams,
  Paginated,
  SignedUploadUrl,
  UUID,
} from "./types";

export const inquiriesApi = {
  list: (params: ListParams = {}) =>
    api.get<Paginated<Inquiry>>("/api/v1/inquiries", { query: { ...params } }),
  get: (id: UUID) => api.get<Inquiry>(`/api/v1/inquiries/${id}`),
  create: (input: InquiryWrite) => api.post<Inquiry>("/api/v1/inquiries", input),
  update: (id: UUID, input: InquiryUpdate) =>
    api.patch<Inquiry>(`/api/v1/inquiries/${id}`, input),
  delete: (id: UUID) => api.delete<void>(`/api/v1/inquiries/${id}`),
  signImageUpload: (id: UUID, file: { filename: string; content_type: string; size: number }) =>
    api.post<SignedUploadUrl>(`/api/v1/inquiries/${id}/images`, file),
  analyze: (id: UUID) => api.post<{ status: "analyzing"; analysis?: AIAnalysis }>(
    `/api/v1/inquiries/${id}/analyze`,
  ),
};
