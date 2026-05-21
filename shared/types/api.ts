import type {
  Currency,
  InquiryStatus,
  Locale,
  MembershipRole,
  PriceItemKind,
  QuoteStatus,
  Unit,
} from "./enums";

export type UUID = string;
export type ISODateTime = string;
export type Decimal = string;

export interface BankDetails {
  iban: string;
  bic?: string;
  bank_name?: string;
  account_holder?: string;
}

export interface Company {
  id: UUID;
  name: string;
  address: string | null;
  vat_id: string | null;
  default_vat_rate: Decimal;
  logo_url: string | null;
  bank_details: BankDetails | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CompanySettings {
  company_id: UUID;
  currency: Currency;
  locale: Locale;
  signature_block: string | null;
  footer: string | null;
}

export interface Membership {
  id: UUID;
  company_id: UUID;
  user_id: UUID;
  role: MembershipRole;
  created_at: ISODateTime;
}

export interface Customer {
  id: UUID;
  company_id: UUID;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface Inquiry {
  id: UUID;
  company_id: UUID;
  customer_id: UUID | null;
  title: string;
  description: string | null;
  status: InquiryStatus;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface InquiryImage {
  id: UUID;
  company_id: UUID;
  inquiry_id: UUID;
  storage_path: string;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  created_at: ISODateTime;
}

export interface AIDetectedService {
  key: string;
  label: string;
  kind: PriceItemKind;
  unit: Unit;
  quantity: Decimal;
  confidence: number;
  notes: string | null;
}

export interface AIAnalysisPayload {
  summary: string;
  services: AIDetectedService[];
  materials: AIDetectedService[];
  warnings: string[];
}

export interface AIAnalysis {
  id: UUID;
  company_id: UUID;
  inquiry_id: UUID;
  model: string;
  payload: AIAnalysisPayload;
  created_at: ISODateTime;
}

export interface PriceList {
  id: UUID;
  company_id: UUID;
  name: string;
  is_default: boolean;
  created_at: ISODateTime;
}

export interface PriceItem {
  id: UUID;
  company_id: UUID;
  price_list_id: UUID;
  kind: PriceItemKind;
  key: string;
  label: string;
  unit: Unit;
  price: Decimal;
  currency: Currency;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface QuotePosition {
  id: UUID;
  company_id: UUID;
  quote_id: UUID;
  position: number;
  label: string;
  unit: Unit;
  quantity: Decimal;
  unit_price: Decimal;
  line_total: Decimal;
  needs_pricing: boolean;
}

export interface Quote {
  id: UUID;
  company_id: UUID;
  inquiry_id: UUID | null;
  customer_id: UUID | null;
  number: string;
  status: QuoteStatus;
  subtotal: Decimal;
  vat_rate: Decimal;
  vat_amount: Decimal;
  total: Decimal;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  positions?: QuotePosition[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiError {
  detail: string;
  code?: string;
}
