import { api } from "./client";
import type { Customer, CustomerWrite, ListParams, Paginated, UUID } from "./types";

export const customersApi = {
  list: (params: ListParams = {}) =>
    api.get<Paginated<Customer>>("/api/v1/customers", { query: { ...params } }),
  get: (id: UUID) => api.get<Customer>(`/api/v1/customers/${id}`),
  create: (input: CustomerWrite) => api.post<Customer>("/api/v1/customers", input),
  update: (id: UUID, input: Partial<CustomerWrite>) =>
    api.patch<Customer>(`/api/v1/customers/${id}`, input),
  delete: (id: UUID) => api.delete<void>(`/api/v1/customers/${id}`),
};
