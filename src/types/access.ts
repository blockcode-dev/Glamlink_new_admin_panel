import type { AccessOrder } from "./businessCard";

// Access pricing, subscriptions and shipping labels, as the backend's /access/admin and
// /businessCard/access-orders endpoints answer them (backend docs/access.md). Amounts are whole cents (USD).

/** The products people buy: Access Pro (monthly) and the NFC keychain (one-time). */
export type SoldProductCode = "pro" | "keychain";

/** A product with its list price. */
export interface AccessProduct {
  id: number;
  /** "pro", "keychain", or "shipping" (internal: the shipping line on Stripe invoices; not sold on its own). */
  code: string;
  name: string;
  kind: "subscription" | "one_time";
  amount_cents: number;
  currency: string;
  /** "month" for Access Pro; null for a one-time product. */
  billing_interval: "month" | "year" | null;
  stripe_product_id: string | null;
  /** Empty after a price change until the next checkout makes the new Stripe Price. */
  stripe_price_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** One line of a plan's feature list on the pricing page. */
export interface PlanFeature {
  text: string;
  /** Shown as coming soon (not built yet). */
  soon?: boolean;
  /** "keychain" marks the keychain line (the website knows no other value); at most 20 characters. */
  highlight?: string;
}

/** A plan as the website's pricing page shows it. */
export interface AccessPlan {
  id: number;
  /** free, nfc_only, subscription_only or nfc_with_subscription */
  code: string;
  name: string;
  /** The small heading on the card when it has no badge. */
  label: string | null;
  /** e.g. "Most popular" */
  badge: string | null;
  tagline: string | null;
  /** The product codes buying it charges for: none (Free), "pro", "keychain" or both. */
  products: string[];
  features: PlanFeature[];
  /** Lower shows first. */
  sort_order: number;
  /** False hides it from the website. */
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** PUT /access/admin/plans/:code takes any of these. An empty label, badge or tagline clears it. */
export interface PlanUpdate {
  /** At most 100 characters. */
  name?: string;
  /** At most 40 characters. */
  label?: string;
  /** At most 40 characters. */
  badge?: string;
  /** At most 255 characters. */
  tagline?: string;
  /** At most 20, each text at most 120 characters. */
  features?: PlanFeature[];
  products?: string[];
  /** 0 to 1000 */
  sort_order?: number;
  is_active?: boolean;
}

/** What one tier may do on a live card. Owners of drafts and of cards under review can always edit; admins always can. */
export interface Entitlements {
  /** 0 to 20 */
  photos: number;
  /** 0 to 20 */
  videos: number;
  /** Text, links, hours and locations. */
  edit_details: boolean;
  /** Photos, the video and the profile image. */
  edit_media: boolean;
  special_offers: boolean;
  /** Not built yet. */
  analytics: boolean;
  /** Not built yet. */
  priority_search: boolean;
}

/** The keychain's parcel, for Shippo's rates and labels. Each measure is above 0. */
export interface Parcel {
  length: number;
  width: number;
  height: number;
  distance_unit: "in" | "cm";
  weight: number;
  mass_unit: "lb" | "oz" | "kg" | "g";
}

/** live: Shippo's rates, the customer picks a service; flat: `flat_amount_cents`; free. */
export type ShippingMode = "live" | "flat" | "free";

/** Where the keychain ships: the US, and Canada once switched on (with a customs declaration). */
export type ShippingCountry = "US" | "CA";

export interface ShippingSettings {
  mode: ShippingMode;
  /** Charged with `mode` flat; 0 to 100000. */
  flat_amount_cents: number;
  /** At least one. */
  countries: ShippingCountry[];
  parcel: Parcel;
}

/** Settings admins change. PUT /access/admin/settings takes any of them; each one sent replaces the stored one whole. */
export interface AccessSettings {
  entitlements: { free: Entitlements; pro: Entitlements };
  /** 1 to 10 */
  keychains_per_person: number;
  shipping: ShippingSettings;
}

/** How long a discount lasts on Access Pro: the first payment, `duration_in_months` payments, or every payment. */
export type DiscountDuration = "once" | "repeating" | "forever";

/** A site-wide sale: percent or amount off, for some products, from a start to an optional end. One runs at a time. */
export interface AccessDiscount {
  id: number;
  name: string;
  /** A decimal column: lists send it as text ("20.00"), the running sale as a number. Null for an amount off. */
  percent_off: number | string | null;
  amount_off_cents: number | null;
  /** Product codes. */
  applies_to: string[];
  duration: DiscountDuration;
  /** 1 to 36, with `repeating`. */
  duration_in_months: number | null;
  starts_at: string;
  /** No end when null. */
  ends_at: string | null;
  /** Not on `active_discount`. */
  admin_id?: number | null;
  created_at?: string;
}

/** GET /access/admin/catalog: everything the pricing screens show at once. */
export interface AccessCatalog {
  /** Includes the internal "shipping" product. */
  products: AccessProduct[];
  /** In their website order. */
  plans: AccessPlan[];
  settings: AccessSettings;
  /** Newest first (at most 200). */
  discounts: AccessDiscount[];
  /** The sale running now. */
  active_discount: AccessDiscount | null;
}

/** One change of a list price, for the record. */
export interface PriceChange {
  id: number;
  product_code: string;
  amount_before: number;
  amount_after: number;
  /** Paying subscribers were moved to the new price at their next renewal. */
  subscribers_moved: boolean;
  /** The admin who made it. */
  admin_id: number | null;
  created_at: string;
}

/** PUT /access/admin/products/:code/price */
export interface PriceChangeRequest {
  /** 50 (Stripe's smallest charge) to 1000000. */
  amount_cents: number;
  /** Access Pro only: also move paying subscribers without a personal price, from their next renewal. */
  move_subscribers?: boolean;
}

/** A subscriber Stripe refused to move: their account and Stripe's message. */
export interface MoveFailure {
  user_id: number;
  error: string;
}

/** The answer to a price change; `moved` and `failed` only when subscribers were moved. */
export interface PriceChangeResult {
  product: AccessProduct;
  moved?: number;
  failed?: MoveFailure[];
}

/** POST /access/admin/discounts. Give `percent_off` or `amount_off_cents`, not both. */
export interface DiscountCreate {
  /** At most 100 characters. */
  name: string;
  /** Above 0, at most 100. */
  percent_off?: number;
  /** At least 1. */
  amount_off_cents?: number;
  applies_to: SoldProductCode[];
  duration: DiscountDuration;
  /** 1 to 36, with `repeating`. */
  duration_in_months?: number;
  /** ISO time; now when left out. */
  starts_at?: string;
  /** ISO time after `starts_at`; no end when left out. */
  ends_at?: string;
}

/** PATCH /access/admin/discounts/:id: rename, or move the end (null: no end). */
export interface DiscountUpdate {
  name?: string;
  ends_at?: string | null;
}

/** A personal price for one client: their account, or an email for someone without one yet. */
export interface PersonalPrice {
  id: number;
  user_id: number | null;
  /** The email it was set for, or the account's. */
  email: string | null;
  product_code: string;
  amount_cents: number;
  note: string | null;
  /** It runs until then; no end when null. */
  ends_at: string | null;
  /** When an admin ended it, or a newer personal price for the same product replaced it. */
  ended_at: string | null;
  admin_id: number | null;
  created_at: string;
  updated_at: string;
}

/** GET /access/admin/custom-prices filters. */
export interface PersonalPriceFilters {
  user_id?: number;
  /** Matches the whole email (any letter case). */
  email?: string;
  /** Only those running now. */
  active?: boolean;
}

/** POST /access/admin/custom-prices: `user_id` or `email`. */
export interface PersonalPriceCreate {
  user_id?: number;
  email?: string;
  product_code: SoldProductCode;
  /** 50 to 1000000. */
  amount_cents: number;
  /** At most 255 characters. */
  note?: string;
  /** ISO time in the future; no end when left out. */
  ends_at?: string;
  /** Access Pro: also put it on the client's live Stripe subscription from their next renewal. */
  apply_now?: boolean;
}

export type PersonalPriceCreated = PersonalPrice & {
  /** `apply_now` changed their live subscription (false when they have no paid Access Pro). */
  applied_to_subscription: boolean;
};

/** stripe: paid through Stripe; comp: complimentary, given by an admin. */
export type SeatSource = "stripe" | "comp";

/** Stripe's subscription statuses; a complimentary seat is active or canceled. */
export type SeatStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";

/** A person's Access Pro subscription (their seat): one per account, kept when they delete and re-create their card. */
export interface SubscriptionSeat {
  id: number;
  /** The account. The API sends no name or email. */
  user_id: number;
  source: SeatSource;
  /** Pro while active, trialing or past_due. */
  status: SeatStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  /** What Stripe charges each month; null for a complimentary seat. */
  amount_cents: number | null;
  currency: string;
  /** When the paid month ends: the next renewal, or the end when cancelling at period end. */
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  started_at: string | null;
  canceled_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

/** GET /access/admin/subscriptions filters. */
export interface SeatFilters {
  status?: SeatStatus;
  source?: SeatSource;
}

/** A Shippo rate for an order's parcel today. */
export interface ShippingRate {
  rate_id: string;
  amount_cents: number;
  currency: string;
  /** The carrier: "USPS", "UPS", … */
  provider: string;
  /** The service level, e.g. "Ground Advantage". */
  service: string | null;
  service_token: string | null;
  estimated_days: number | null;
  duration_terms: string | null;
  /** Shippo's tags: CHEAPEST, FASTEST, BESTVALUE. */
  attributes: string[];
}

/** GET /businessCard/access-orders/:id/rates: today's rates for the order's parcel, cheapest first. */
export interface OrderRates {
  order_id: number;
  shipment_id: string;
  rates: ShippingRate[];
}

/** Shippo's refund of a voided label: QUEUED, PENDING, SUCCESS or ERROR. */
export interface LabelRefund {
  refund_id: string;
  status: string;
}

/** POST /businessCard/access-orders/:id/label/void */
export interface VoidedLabel {
  order: AccessOrder;
  refund: LabelRefund;
}
