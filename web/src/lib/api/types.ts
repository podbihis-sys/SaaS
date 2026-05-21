export type UUID = string;

export type Role = "owner" | "admin" | "member";

export interface AuthUser {
  id: UUID;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface Company {
  id: UUID;
  name: string;
  address_line1?: string | null;
  address_line2?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
  vat_id?: string | null;
  default_vat_rate: number;
  logo_url?: string | null;
  bank_name?: string | null;
  bank_iban?: string | null;
  bank_bic?: string | null;
  created_at: string;
}

export interface Membership {
  id: UUID;
  user_id: UUID;
  company_id: UUID;
  role: Role;
  email: string;
  full_name?: string | null;
  status: "active" | "invited";
  created_at: string;
}

export interface AuthMeResponse {
  user: AuthUser;
  companies: Company[];
  active_company_id: UUID | null;
}

export interface Customer {
  id: UUID;
  company_id: UUID;
  name: string;
  email?: string | null;
  phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerWrite {
  name: string;
  email?: string | null;
  phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
  notes?: string | null;
}

export type InquiryStatus =
  | "new"
  | "analyzing"
  | "analyzed"
  | "quoted"
  | "accepted"
  | "rejected";

export interface InquiryImage {
  id: UUID;
  inquiry_id: UUID;
  url: string;
  thumbnail_url?: string | null;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface DetectedService {
  key: string;
  label: string;
  quantity: number;
  unit: string;
  confidence: number;
  source?: string;
}

export interface AIAnalysis {
  rooms: { label: string; area_m2?: number; confidence: number }[];
  materials: { label: string; confidence: number }[];
  damages: { label: string; severity?: string; confidence: number }[];
  detected_services: DetectedService[];
  summary?: string;
  model?: string;
  generated_at?: string;
}

export interface Inquiry {
  id: UUID;
  company_id: UUID;
  customer_id: UUID;
  customer?: Customer;
  title: string;
  description?: string | null;
  status: InquiryStatus;
  images: InquiryImage[];
  ai_analysis?: AIAnalysis | null;
  quote_id?: UUID | null;
  created_at: string;
  updated_at: string;
}

export interface InquiryWrite {
  customer_id: UUID;
  title: string;
  description?: string | null;
}

export interface InquiryUpdate {
  title?: string;
  description?: string | null;
  status?: InquiryStatus;
  ai_analysis?: AIAnalysis | null;
}

export interface SignedUploadUrl {
  upload_url: string;
  image_id: UUID;
  public_url: string;
  expires_at: string;
}

export type PriceKind = "labor" | "material" | "area";
export type PriceUnit = "h" | "m²" | "m" | "kg" | "pcs";

export interface PriceItem {
  id: UUID;
  company_id: UUID;
  list_id: UUID;
  kind: PriceKind;
  key: string;
  label: string;
  unit: PriceUnit;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface PriceItemWrite {
  kind: PriceKind;
  key: string;
  label: string;
  unit: PriceUnit;
  price: number;
  list_id?: UUID;
}

export interface PriceList {
  id: UUID;
  company_id: UUID;
  name: string;
  is_default: boolean;
  created_at: string;
}

export interface QuotePosition {
  id?: UUID;
  position: number;
  key?: string;
  label: string;
  unit: PriceUnit | string;
  quantity: number;
  unit_price: number;
  line_total: number;
  kind?: PriceKind;
}

export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export interface Quote {
  id: UUID;
  company_id: UUID;
  inquiry_id?: UUID | null;
  customer_id: UUID;
  customer?: Customer;
  number: string;
  status: QuoteStatus;
  positions: QuotePosition[];
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  notes?: string | null;
  valid_until?: string | null;
  pdf_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteWrite {
  customer_id: UUID;
  inquiry_id?: UUID | null;
  positions: QuotePosition[];
  vat_rate?: number;
  notes?: string | null;
  valid_until?: string | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface ListParams {
  search?: string;
  page?: number;
  page_size?: number;
  sort?: string;
  status?: string;
}

export interface ApiErrorBody {
  detail?: string | { msg: string }[];
  code?: string;
}
