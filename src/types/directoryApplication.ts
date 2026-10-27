// Directory applications: what the website's directory form (/directory-form-apply) sends, kept as sent for admins to
// review, and the listings admins add. Approving one makes (or finds) the account for its email and links it; the
// account's page is then made from the listing. Backend: website/inquiries (directoryApplication.service.js).
// The JSON fields keep what the form sent: the API checks only that each is a list (or an object), not its items, so
// they are typed `unknown` and read defensively.

export type DirectoryApplicationStatus = "pending" | "approved" | "rejected";

/** The account approval makes: a professional's, or a brand's (named after the business at the main location). */
export type ListingAccountType = "individual" | "brand";

/** A location as the website's form sends it. The API keeps any `location_type`; the form sends these keys. */
export interface ListingLocation {
  label?: string | null;
  /** "exact_address", "service_area" (city or area only) or "virtual". */
  location_type?: string | null;
  /** Shown on the website for an "exact_address" location only. */
  address?: string | null;
  city?: string | null;
  state?: string | null;
  business_name?: string | null;
  phone?: string | null;
  description?: string | null;
  /** The main location (else the first): its business, city and state become the listing's. */
  is_primary?: boolean | null;
  sort_order?: number | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

/** A gallery photo. The API builds these from the uploads and their `gallery_meta`. */
export interface GalleryPhoto {
  /** The photo's link on the API's host; `remove_photos` takes it. */
  url: string;
  caption: string;
  /** The cover photo. */
  is_thumbnail: boolean;
  sort_order: number;
}

/** A business-hours line, as the form sends it. */
export interface BusinessHourNote {
  note: string;
}

/** An application, or a listing an admin added (GET /directory/applications/:id, and each list row). */
export interface DirectoryApplication {
  id: number;
  name: string;
  professional_title: string | null;
  email: string;
  phone: string | null;
  /** Plain text, up to 2,000 characters. */
  bio: string | null;
  custom_handle: string | null;
  website: string | null;
  booking_link: string | null;
  /** Any text: "Go to Booking Link", "Call / text", "Walk-ins welcome", … */
  preferred_booking_method: string | null;
  primary_specialty: string | null;
  /** Specialty names. */
  specialties: unknown[] | null;
  /** Links (or handles) by platform: instagram, tiktok, facebook, youtube, linkedin. */
  social_media: Record<string, unknown> | null;
  /** Up to 10 locations (see ListingLocation). */
  locations: unknown[] | null;
  /** Lines as `{ note }` (see BusinessHourNote). */
  business_hours: unknown[] | null;
  /** From the main location: its business, city and state, and coordinates (geocoded when it has none). */
  business_name: string | null;
  city: string | null;
  state: string | null;
  /** Decimals, sent as text. */
  latitude: string | number | null;
  longitude: string | number | null;
  profile_image: string | null;
  gallery: GalleryPhoto[] | null;
  offer_promotion: boolean;
  promotion_details: string | null;
  /** "The Elite Setup": the concierge team may build the profile from their public social media. */
  elite_setup: boolean;
  /** The form's questions: what excites them about Glamlink, their biggest pain points. */
  excites_about_glamlink: unknown[] | null;
  biggest_pain_points: unknown[] | null;
  /** The form's "Free Digital Card" choice. Approval makes no card; the owner makes it from their dashboard. */
  wants_access_card: boolean;
  /** The Google listing it claims (the directory's "Claim this profile"); approved, it leaves Google's results. */
  place_id: string | null;
  status: DirectoryApplicationStatus;
  /** Only admins see it; each review replaces it. */
  review_note: string | null;
  /** The admin's id. */
  reviewed_by: number | null;
  reviewed_at: string | null;
  /** The account approval made or found for the email. It stays linked when the listing is rejected or moved back. */
  user_id: number | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
}

/** GET /directory/applications: newest first. */
export interface DirectoryApplicationListParams {
  /** Every status when left out. */
  status?: DirectoryApplicationStatus;
  /** Name, email, handle, title or specialty. */
  search?: string;
  page?: number;
  /** 50 by default and at most. */
  limit?: number;
}

/** An admin's decision (PUT /directory/applications/:id/status). */
export interface DirectoryApplicationReview {
  status: DirectoryApplicationStatus;
  /** Up to 500 characters; only admins see it. It replaces the current note, which is cleared when none is sent. */
  note?: string;
  /** On approval: "brand" makes a new (or app) account a brand's. A professional account keeps its type. */
  professional_type?: ListingAccountType;
}

/**
 * A listing's fields as the API takes them. An edit (PUT /directory/applications/:id) saves only the fields sent;
 * "" or null clears one. Name and email can't be cleared.
 */
export interface DirectoryListingFields {
  name?: string;
  professional_title?: string | null;
  email?: string;
  phone?: string | null;
  bio?: string | null;
  custom_handle?: string | null;
  website?: string | null;
  booking_link?: string | null;
  preferred_booking_method?: string | null;
  primary_specialty?: string | null;
  /** At most 20. */
  specialties?: string[];
  social_media?: Record<string, unknown>;
  /** At most 10. Sending them resets the main location (geocoded again when it has no coordinates). */
  locations?: ListingLocation[];
  business_hours?: BusinessHourNote[];
  offer_promotion?: boolean;
  promotion_details?: string | null;
  elite_setup?: boolean;
  excites_about_glamlink?: string[];
  biggest_pain_points?: string[];
  wants_access_card?: boolean;
  place_id?: string | null;
}

/** A listing an admin adds (POST /directory/applications/admin). */
export interface NewDirectoryListing extends DirectoryListingFields {
  name: string;
  email: string;
  /** "approved" by default, which makes (or finds) the account and emails it, as approval does. */
  status?: DirectoryApplicationStatus;
  /** For an approved listing: "individual" by default. */
  professional_type?: ListingAccountType;
}

/** A photo to add to the gallery, with what `gallery_meta` says about it. */
export interface NewGalleryPhoto {
  file: File;
  caption: string;
  is_thumbnail: boolean;
  sort_order: number;
}

/** Photo changes sent with a listing's fields. A gallery holds 10 photos at most. */
export interface ListingPhotoChanges {
  /** A new profile photo, or "" to remove the current one. */
  profile_image?: File | "";
  /** Photos to add to the gallery. */
  images?: NewGalleryPhoto[];
  /** Links of gallery photos to take out. */
  remove_photos?: string[];
}
