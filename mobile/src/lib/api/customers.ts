import { apiRequest } from '../api';

export type Customer = {
  id: string;
  company_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  created_at: string;
};

export type CustomerListResponse = {
  items: Customer[];
  total: number;
};

export function listCustomers(query?: { search?: string; limit?: number }): Promise<CustomerListResponse> {
  return apiRequest<CustomerListResponse>('/api/v1/customers', { query });
}

export function getCustomer(id: string): Promise<Customer> {
  return apiRequest<Customer>(`/api/v1/customers/${id}`);
}

export type CustomerCreateInput = {
  name: string;
  email?: string;
  phone?: string;
  street?: string;
  postal_code?: string;
  city?: string;
};

export function createCustomer(input: CustomerCreateInput): Promise<Customer> {
  return apiRequest<Customer>('/api/v1/customers', { method: 'POST', body: input });
}
