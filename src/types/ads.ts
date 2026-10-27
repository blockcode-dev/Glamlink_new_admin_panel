/** An ad placement on the public journal pages. */
export interface Ad {
  id: number;
  /** Placement id, e.g. "journal-top-banner" (see SLOT_OPTIONS in AddAd). */
  slot_id: string;
  image_url?: string | null;
  /** "image" or "video". */
  media_type?: string;
  alt_text?: string | null;
  /** Saved through FormData, so a missing size can come back as the string "null". */
  width?: number | string | null;
  height?: number | string | null;
  link_url?: string | null;
  /** "static", "sticky" or "fixed-overlay". */
  behaviour: string;
  pages?: string[];
  /** "active" or "inactive". */
  status: string;
  start_date?: string | null;
  end_date?: string | null;
}

/** One ad's views and clicks over a date range (GET /ads/admin/stats lists ads with any count). */
export interface AdTotals {
  ad_id: number;
  /** Views: counted once an ad is half in view on the website. */
  impressions: number;
  clicks: number;
  /** Clicks per view, in percent; null without views. */
  click_rate: number | null;
}

/** One ad's views and clicks per day (only days with any) over a date range. */
export interface AdDaily {
  ad_id: number;
  impressions: number;
  clicks: number;
  days: { day: string; impressions: number; clicks: number }[];
}
