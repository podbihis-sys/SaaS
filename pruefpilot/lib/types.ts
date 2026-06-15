import type { InspectionResult } from "./inspections";

export interface CompanyRow {
  id: string;
  owner_id: string;
  name: string;
  contact_email: string;
  created_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string;
  trial_ends_at: string;
}

export type DeviceStatus = "active" | "retired";

export interface DeviceRow {
  id: string;
  company_id: string;
  category_id: string;
  name: string;
  location: string | null;
  serial_number: string | null;
  interval_months: number;
  next_due_date: string;
  status: DeviceStatus;
  public_code: string;
  verify_token: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InspectionRow {
  id: string;
  device_id: string;
  company_id: string;
  inspected_at: string;
  inspector_name: string;
  result: InspectionResult;
  comment: string | null;
  document_path: string | null;
  created_at: string;
}
