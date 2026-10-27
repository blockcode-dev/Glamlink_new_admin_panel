// Professional and brand pages (the website's /profiles/:slug): one per professional account that has a live
// Access card, an approved directory listing, or a brand page an admin made. Backend: website/profiles.

export type PageType = "individual" | "brand";

/** A page as the admin list shows it (GET /profiles/admin/list). */
export interface PageRow {
  /** The account's id: every page call takes it. */
  id: number;
  slug: string | null;
  type: PageType | null;
  /** A brand's business name, else the person's. */
  name: string | null;
  image: string | null;
  tagline: string | null;
  city: string | null;
  state: string | null;
  specialty: string | null;
  is_featured: boolean;
  featured_order: number;
  is_listed: boolean;
  /** A brand page an admin made: it shows without a card. */
  created_by_admin: boolean;
  has_live_card: boolean;
  /** The public sees it: it exists and isn't unlisted. */
  visible: boolean;
  /** The account has a password, so its owner can sign in and edit the page. */
  claimed: boolean;
}

export interface SocialLink {
  title: string;
  url: string;
}

/** What is set on the page itself. Empty fields fall back to the card's, the listing's, then the account's. */
export interface PageSettings {
  slug: string | null;
  is_listed: boolean;
  is_featured: boolean;
  featured_order: number;
  created_by_admin: boolean;
  tagline: string | null;
  /** Rich text, cleaned like the card bio. */
  about: string | null;
  image: string | null;
  cover_image: string | null;
  website: string | null;
  /** null: the card's (or listing's) social links show. */
  social: SocialLink[] | null;
}

/** The page as the public sees it. */
export interface PublicPage {
  id: number;
  slug: string | null;
  type: PageType | null;
  name: string | null;
  image: string | null;
  tagline: string | null;
  city: string | null;
  state: string | null;
  specialty: string | null;
  is_featured: boolean;
  cover_image: string | null;
  about: string | null;
  website: string | null;
  social: SocialLink[];
  location: { city: string | null; state: string | null } | null;
  specialties: string[];
  email: string | null;
  phone: string | null;
  booking_link: string | null;
  /** The live card behind the page, if any. */
  access_card: { slug: string; url: string } | null;
  /** An approved directory listing behind the page, if any. */
  listing: { id: number } | null;
  topics: { id: number; name: string; slug: string }[];
}

/** One account's page as an admin sees it (GET /profiles/admin/:userId). */
export interface PageView {
  user_id: number;
  slug: string | null;
  page: PageSettings;
  visible: boolean;
  /** Why the public can't see it. */
  hidden_because: "no_live_card" | "unlisted" | null;
  public: PublicPage;
}

/** Fields an admin can set on a page. Images are links from POST /journal/upload; "" or null clears a field. */
export interface PageUpdate {
  slug?: string;
  is_listed?: boolean;
  is_featured?: boolean;
  featured_order?: number;
  tagline?: string | null;
  about?: string | null;
  website?: string | null;
  social?: SocialLink[] | null;
  image?: string | null;
  cover_image?: string | null;
}

export interface PageListParams {
  search?: string;
  type?: PageType;
  /** Only featured pages, in their order. */
  featured?: boolean;
  page?: number;
  /** At most 50. */
  limit?: number;
}

/** A page's numbers for a date range (GET /profiles/admin/:userId/analytics), in card analytics' shape. */
export interface PageAnalytics {
  page: { id: number; slug: string | null; name: string | null; visible: boolean };
  date_range: { from: string; to: string };
  summary: { total_views: number; unique_visitors: number; total_clicks: number };
  /** Count per event: PAGE_VIEW, WEBSITE_CLICK, ACCESS_CARD_CLICK, PRODUCT_CLICK, BOOKING_CLICK, SOCIAL_CLICK, EMAIL_CLICK, PHONE_CLICK. */
  events: Record<string, number>;
  /** Days with any views (or clicks) only. */
  daily_views: { date: string; count: number }[];
  daily_clicks: { date: string; count: number }[];
  device_breakdown: { device_type: string | null; count: number }[];
  /** The ten most clicked links and products (`event_target`: what was clicked; a product's id for PRODUCT_CLICK). */
  top_targets: { event_type: string; event_target: string; count: number }[];
}
