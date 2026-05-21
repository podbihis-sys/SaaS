export type MembershipRole = "owner" | "admin" | "member";

export type InquiryStatus =
  | "new"
  | "analyzing"
  | "analyzed"
  | "quoted"
  | "accepted"
  | "rejected";

export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired";

export type PriceItemKind = "labor" | "material" | "area";

export type Unit = "h" | "m2" | "m" | "kg" | "pcs";

export type Currency = "EUR";

export type Locale = "de-DE";
