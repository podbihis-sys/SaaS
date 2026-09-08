/**
 * Mirrors the backend's Pydantic schemas. Kept hand-written rather than
 * generated so the app can be read on its own; `/openapi.json` is the
 * authority when the two disagree.
 */

export type ServiceCategory =
  | 'anmeldung'
  | 'abmeldung'
  | 'ummeldung'
  | 'personalausweis'
  | 'reisepass'
  | 'fuehrungszeugnis'
  | 'meldebescheinigung'
  | 'kfz_zulassung'
  | 'kfz_abmeldung'
  | 'fuehrerschein'
  | 'aufenthaltstitel'
  | 'verpflichtungserklaerung'
  | 'eheschliessung'
  | 'geburtsurkunde'
  | 'gewerbeanmeldung'
  | 'beglaubigung'
  | 'sonstiges';

export type AuthorityType =
  | 'buergeramt'
  | 'auslaenderbehoerde'
  | 'kfz_zulassungsstelle'
  | 'fuehrerscheinstelle'
  | 'standesamt'
  | 'gewerbeamt'
  | 'jobcenter'
  | 'finanzamt'
  | 'sonstiges';

export type SlotStatus = 'available' | 'gone';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'throttled';
export type BookingStatus = 'handed_off' | 'confirmed' | 'missed' | 'cancelled';

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface Service {
  id: string;
  office_id: string;
  name: string;
  category: ServiceCategory;
  duration_minutes: number | null;
  notes: string | null;
}

export interface Office {
  id: string;
  provider: string;
  name: string;
  authority_type: AuthorityType;
  street: string | null;
  postal_code: string | null;
  city: string;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  booking_url: string | null;
  phone: string | null;
  /** False when the booking system may not be polled; the office can still be
   *  found and booked directly with the authority. */
  scan_enabled: boolean;
  scan_blocked_reason: string | null;
  services: Service[];
  distance_km: number | null;
}

export interface Slot {
  id: string;
  office_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string | null;
  capacity: number;
  status: SlotStatus;
  first_seen_at: string;
  last_seen_at: string;
  office_name: string;
  city: string;
  service_name: string;
  category: ServiceCategory;
  timezone: string;
}

export interface Category {
  value: ServiceCategory;
  label_de: string;
  office_count: number;
}

export interface WatchOffice {
  id: string;
  name: string;
  city: string;
}

export interface Watch {
  id: string;
  label: string;
  category: ServiceCategory;
  offices: WatchOffice[];
  earliest_date: string | null;
  latest_date: string | null;
  weekday_mask: number;
  earliest_time: string | null;
  latest_time: string | null;
  min_lead_hours: number;
  daily_alert_limit: number | null;
  auto_stop_after: number | null;
  active: boolean;
  paused_until: string | null;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  expires_at: string | null;
  last_notified_at: string | null;
  notification_count: number;
  created_at: string;
}

export interface WatchDetail extends Watch {
  matching_slots: Slot[];
}

export interface WatchCreate {
  label: string;
  category: ServiceCategory;
  office_ids: string[];
  earliest_date?: string | null;
  latest_date?: string | null;
  weekday_mask?: number;
  earliest_time?: string | null;
  latest_time?: string | null;
  min_lead_hours?: number;
  /** Alerts per calendar day in the office's timezone. null = no daily cap. */
  daily_alert_limit?: number | null;
  /** Retire the watch after this many alerts. null = run until stopped. */
  auto_stop_after?: number | null;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
}

export type WatchUpdate = Partial<Omit<WatchCreate, 'category'>> & {
  active?: boolean;
  paused_until?: string | null;
};

export interface AppNotification {
  id: string;
  watch_id: string;
  slot_id: string;
  status: NotificationStatus;
  title: string;
  body: string;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  slot_id: string;
  watch_id: string | null;
  status: BookingStatus;
  handoff_url: string;
  created_at: string;
  resolved_at: string | null;
  note: string | null;
}

export interface AuthResponse {
  token: string;
  expires_at: string;
  user_id: string;
}

/** A municipality from the official register, as a search result. */
export interface Place {
  ags: string;
  name: string;
  short_name: string;
  kind: string;
  kind_label: string;
  population: number;
  plz: string | null;
  district_name: string;
  district_seat: string | null;
  state: string;
  is_kreisfrei: boolean;
  /** Set when the search was a postcode: which one matched, and its localities here. */
  matched_plz: string | null;
  localities: string[];
  office_count: number;
}

export type ResponsibilityLevel = 'gemeinde' | 'kreis' | 'region';

export interface Responsibility {
  authority_type: AuthorityType;
  label_de: string;
  level: ResponsibilityLevel;
  responsible_name: string;
  note: string | null;
  offices: Office[];
}

export interface PlaceDetail {
  place: Place;
  responsibilities: Responsibility[];
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  request_id?: string | null;
}
