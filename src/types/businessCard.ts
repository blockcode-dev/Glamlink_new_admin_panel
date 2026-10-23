import type { UploadFile } from "antd";

/** "exact" shows the address; "city_only" shows just the city and state. */
export type LocationType = "exact" | "city_only";

export interface CardLocation {
  id?: number;
  label?: string;
  location_type?: LocationType;
  address?: string;
  city?: string;
  /** State name, or a two-letter code on older cards. */
  state?: string;
  state_id?: number;
  latitude?: number;
  longitude?: number;
  is_primary?: boolean;
  sort_order?: number;
}

export interface BusinessHour {
  id?: number;
  note: string;
}

export interface CardLink {
  title?: string;
  url: string;
}

export interface FeaturedLink {
  id?: number;
  title?: string;
  url: string;
  /** URL of the saved image. */
  image?: string | null;
  /** Position of this link's new image among the uploaded `featured_link_images`. */
  image_index?: number | null;
  sort_order?: number;
  is_featured?: boolean;
}

/** A gallery image or video saved on the card. */
export interface CardMedia {
  id: number;
  file_uri: string;
  file_type: "image" | "video";
  thumbnail_uri?: string | null;
  is_thumbnail?: boolean;
  caption?: string | null;
}

/** Fields that some cards store as JSON strings and others as arrays/objects. */
type Stored<T> = T | string | null;

export interface BusinessCard {
  id: number;
  name: string;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  professional_title?: string | null;
  /** The first specialty; the API sets it. */
  primary_specialty?: string | null;
  bio?: string | null;
  website?: string | null;
  booking_link?: string | null;
  preferred_booking_method?: string[] | null;
  /** "pending", "accepted" or "rejected". */
  status?: string;
  created_by_admin?: boolean;
  /** Only active cards can be @mentioned in journal content. */
  is_active?: boolean;
  created_at: string;
  profile_image?: string | null;
  business_card_link?: string | null;
  business_card_qr?: string | null;
  /** "paid" once the NFC keychain is bought. */
  nfc_status?: string | null;
  /** "subscription_only", "nfc_with_subscription", … */
  plan_type?: string | null;
  /** No longer accepted by the API; old cards keep the stored value. */
  elite_setup?: boolean | null;
  offer_promotion?: boolean | null;
  promotion_details?: string | null;
  color_code?: string | null;
  /** No longer accepted by the API; old cards keep the stored value (journal mentions still link by it). */
  custom_handle?: string | null;
  is_phone_visible?: boolean;
  business_user?: { subscription_status?: string | null } | null;
  /** facebook, linkedin, youtube, tiktok, instagram, instagram1, instagram2… */
  social_media?: Stored<Record<string, string | null>>;
  specialties?: Stored<string[]>;
  important_info?: Stored<string[]>;
  excites_about_glamlink?: Stored<string[]>;
  biggest_pain_points?: Stored<string[]>;
  other_links?: Stored<CardLink[]>;
  featured_links?: Stored<FeaturedLink[]>;
  locations?: CardLocation[];
  business_hour?: BusinessHour[];
  images?: CardMedia[];
}

/**
 * Values of the create/edit access-card form; Edit seeds it from the saved card, so text can be null.
 * Only the fields the API accepts (backend docs/access.md, section 1).
 */
export interface BusinessCardFormValues {
  name: string;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  professional_title?: string | null;
  bio?: string | null;
  website?: string | null;
  booking_link?: string | null;
  is_phone_visible?: boolean;
  offer_promotion?: boolean | null;
  promotion_details?: string | null;
  /** Hex string, or the picker's colour object before it is normalised. */
  color_code?: string | { toString(): string } | null;
  preferred_booking_method?: string[] | null;
  specialties?: string[];
  important_info?: string[];
  other_links?: CardLink[];
  /** Create page only; Edit keeps featured links in component state. */
  featured_links?: (Partial<FeaturedLink> & { _uid?: string })[];
  instagram_links?: string[];
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  business_hour?: { value?: string }[];
  locations?: CardLocation[];
}

/** A video picked for (or saved on) the card, with its required thumbnail. */
export interface CardVideo {
  uid: string | number;
  video: { originFileObj?: File; url?: string };
  thumbnail: UploadFile | null;
}

/** A gallery image in the upload list; saved ones carry their media id. */
export type GalleryImage = UploadFile & { is_thumbnail?: boolean; mediaId?: number; caption?: string | null };

/** A featured link being edited; new ones have a `_uid` until saved. */
export type EditableFeaturedLink = FeaturedLink & { _uid?: string };

/** "NFC + subscription" style purchase, shown as a tag. */
export interface PurchaseInfo {
  label: string;
  color: string;
}

export type FulfillmentStatus = "pending" | "processing" | "shipped" | "delivered";

/** A paid access-card order (NFC keychain and/or subscription). */
export interface AccessOrder {
  id: number;
  order_number: string;
  created_at: string;
  customer_name?: string | null;
  customer_email?: string | null;
  amount_paid?: number | string | null;
  shipping_amount?: number | string | null;
  payment_status?: string | null;
  /** Null for subscription-only orders, which ship nothing. */
  fulfillment_status?: FulfillmentStatus | null;
  tracking_number?: string | null;
  tracking_link?: string | null;
  recipient_name?: string | null;
  shipping_address_line_1?: string | null;
  shipping_address_line_2?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_postal_code?: string | null;
  shipping_country?: string | null;
  business_card?: { business_card_link?: string | null } | null;
}

export interface FulfillmentUpdate {
  fulfillment_status?: FulfillmentStatus;
  tracking_number?: string | null;
  tracking_link?: string | null;
}
