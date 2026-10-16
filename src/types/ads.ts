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
