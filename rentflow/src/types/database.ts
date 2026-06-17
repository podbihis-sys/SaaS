/**
 * Hand-written Supabase schema types (mirrors supabase/migrations).
 * Regenerate with `supabase gen types typescript` once a project is linked.
 */

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "returned"
  | "cancelled"
  | "expired";

export type DepositStatus = "none" | "held" | "charged" | "refunded";
export type RentalPaymentStatus = "unpaid" | "paid";
export type Plan = "free" | "solo" | "pro";
export type PlanStatus = "active" | "trialing" | "past_due" | "canceled" | "inactive";

export type Profile = {
  user_id: string;
  email: string | null;
  company_name: string | null;
  slug: string | null;
  stripe_customer_id: string | null;
  stripe_connect_account_id: string | null;
  connect_charges_enabled: boolean;
  plan: Plan;
  plan_status: PlanStatus;
  current_period_end: string | null;
  branding_enabled: boolean;
  created_at: string;
}

export type Item = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  price_per_day: number;
  deposit_amount: number;
  image_paths: string[];
  active: boolean;
  created_at: string;
}

export type ItemBlock = {
  id: string;
  item_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

export type Booking = {
  id: string;
  user_id: string;
  item_id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  start_date: string;
  end_date: string;
  quantity: number;
  status: BookingStatus;
  rental_total: number | null;
  deposit_total: number | null;
  deposit_payment_intent_id: string | null;
  deposit_status: DepositStatus;
  rental_payment_status: RentalPaymentStatus;
  hold_expires_at: string | null;
  confirmation_pdf_path: string | null;
  is_unique: boolean;
  created_at: string;
}

export type StripeEvent = {
  id: string;
  type: string | null;
  processed_at: string;
}

interface TableDef<T> {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<Profile>;
      items: TableDef<Item>;
      item_blocks: TableDef<ItemBlock>;
      bookings: TableDef<Booking>;
      stripe_events: TableDef<StripeEvent>;
    };
    // Empty namespaces use `{ [_ in never]: never }` (no index signature) so the
    // lib's `Tables & Views` intersection doesn't collapse every table to never.
    Views: { [_ in never]: never };
    Functions: {
      check_availability: {
        Args: { p_item_id: string; p_start_date: string; p_end_date: string };
        Returns: number;
      };
      create_booking_hold: {
        Args: {
          p_item_id: string;
          p_start_date: string;
          p_end_date: string;
          p_quantity: number;
          p_customer_name: string;
          p_customer_email: string;
          p_customer_phone?: string | null;
          p_hold_minutes?: number;
        };
        Returns: Booking;
      };
      expire_holds: { Args: Record<PropertyKey, never>; Returns: number };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
