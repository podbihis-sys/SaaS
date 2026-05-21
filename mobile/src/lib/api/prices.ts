import { apiRequest } from '../api';

export type PriceItem = {
  id: string;
  company_id: string;
  code: string | null;
  title: string;
  description: string | null;
  unit: string;
  unit_price_cents: number;
  tax_rate: number;
  active: boolean;
  created_at: string;
};

export type PriceListResponse = {
  items: PriceItem[];
  total: number;
};

export function listPrices(query?: { search?: string; limit?: number }): Promise<PriceListResponse> {
  return apiRequest<PriceListResponse>('/api/v1/prices', { query });
}
