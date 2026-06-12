export interface CompanyRow {
  id: string;
  owner_id: string;
  name: string;
  contact_email: string;
  created_at: string;
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
  notes: string | null;
  created_at: string;
  updated_at: string;
}
