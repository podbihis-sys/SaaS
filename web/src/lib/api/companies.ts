import { api } from "./client";
import type { AuthMeResponse, Company, Membership, Role, UUID } from "./types";

export interface CompanyCreateInput {
  name: string;
  slug: string;
  legal_name?: string | null;
  tax_id?: string | null;
  address_line1?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string;
  phone?: string | null;
  email?: string | null;
}

export const companiesApi = {
  me: () => api.get<AuthMeResponse>("/api/v1/auth/me"),
  create: (input: CompanyCreateInput) => api.post<Company>("/api/v1/companies", input),
  getCurrent: () => api.get<Company>("/api/v1/companies/me"),
  update: (input: Partial<Company>) => api.patch<Company>("/api/v1/companies/me", input),
  uploadLogo: (file: { filename: string; content_type: string; size: number }) =>
    api.post<{ upload_url: string; public_url: string }>("/api/v1/companies/me/logo", file),
  listMembers: () => api.get<Membership[]>("/api/v1/companies/me/members"),
  invite: (input: { email: string; role: Role }) =>
    api.post<Membership>("/api/v1/companies/me/invites", input),
  updateMember: (id: UUID, input: { role: Role }) =>
    api.patch<Membership>(`/api/v1/companies/me/members/${id}`, input),
  removeMember: (id: UUID) =>
    api.delete<void>(`/api/v1/companies/me/members/${id}`),
};
