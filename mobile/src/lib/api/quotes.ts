import { apiRequest } from '../api';

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

export type QuotePosition = {
  id: string;
  quote_id: string;
  position_number: number;
  title: string;
  description: string | null;
  quantity: number;
  unit: string;
  unit_price_cents: number;
  total_cents: number;
};

export type Quote = {
  id: string;
  company_id: string;
  customer_id: string;
  customer_name?: string | null;
  inquiry_id: string | null;
  number: string;
  status: QuoteStatus;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  valid_until: string | null;
  notes: string | null;
  positions: QuotePosition[];
  created_at: string;
  updated_at: string;
};

export type QuoteListResponse = {
  items: Quote[];
  total: number;
};

export function listQuotes(query?: {
  status?: QuoteStatus;
  search?: string;
  limit?: number;
}): Promise<QuoteListResponse> {
  return apiRequest<QuoteListResponse>('/api/v1/quotes', { query });
}

export function getQuote(id: string): Promise<Quote> {
  return apiRequest<Quote>(`/api/v1/quotes/${id}`);
}

export type QuotePdfResponse = {
  url: string;
  expires_at: string;
};

export function getQuotePdfUrl(id: string): Promise<QuotePdfResponse> {
  return apiRequest<QuotePdfResponse>(`/api/v1/quotes/${id}/pdf`);
}

export function createQuoteFromInquiry(inquiryId: string): Promise<Quote> {
  return apiRequest<Quote>(`/api/v1/inquiries/${inquiryId}/quote`, { method: 'POST' });
}
