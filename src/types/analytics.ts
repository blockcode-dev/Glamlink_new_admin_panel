// Access-card analytics. Counts may arrive as numbers or numeric strings (SQL aggregates);
// the page reads them through Number().

type Count = number | string;

/** Clicks per event type, keyed by event name (e.g. "WEBSITE_CLICK"). */
export type EventCounts = Record<string, Count>;

export interface AnalyticsSummary {
  total_views?: Count;
  total_clicks?: Count;
  unique_visitors?: Count;
  cards_with_activity?: Count;
}

/** One access card's totals for the selected range. */
export interface CardActivity {
  business_card_id: number | string;
  name?: string | null;
  business_name?: string | null;
  business_card_link?: string | null;
  views?: Count;
  clicks?: Count;
  unique_visitors?: Count;
}

export interface DailyTotals {
  date: string;
  views?: Count;
  clicks?: Count;
}

export interface DatedCount {
  date: string;
  count: Count;
}

/** Every card, for the date range. */
export interface AnalyticsOverview {
  cards?: CardActivity[];
  summary?: AnalyticsSummary;
  events?: EventCounts;
  daily?: DailyTotals[];
}

/** One card, for the date range. */
export interface CardAnalytics {
  summary?: AnalyticsSummary;
  events?: EventCounts;
  daily_views?: DatedCount[];
  daily_clicks?: DatedCount[];
  device_breakdown?: { device_type?: string | null; count: Count }[];
}

/** A single view or click on a card. */
export interface AnalyticsEvent {
  id?: number;
  event_type: string;
  event_target?: string | null;
  device_type?: string | null;
  created_at: string;
}

export interface AnalyticsResponse<T> {
  success: boolean;
  data: T;
}
