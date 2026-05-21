import { api } from "./client";
import type { ListParams, Paginated, Quote, QuoteWrite, UUID } from "./types";

export const quotesApi = {
  list: (params: ListParams = {}) =>
    api.get<Paginated<Quote>>("/api/v1/quotes", { query: { ...params } }),
  get: (id: UUID) => api.get<Quote>(`/api/v1/quotes/${id}`),
  create: (input: QuoteWrite) => api.post<Quote>("/api/v1/quotes", input),
  update: (id: UUID, input: Partial<QuoteWrite>) =>
    api.patch<Quote>(`/api/v1/quotes/${id}`, input),
  recalculate: (id: UUID, input: Partial<QuoteWrite>) =>
    api.post<Quote>(`/api/v1/quotes/${id}/recalculate`, input),
  fromInquiry: (inquiry_id: UUID) =>
    api.post<Quote>("/api/v1/quotes", { inquiry_id }),
  pdfUrl: (id: UUID) => `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/quotes/${id}/pdf`,
};
