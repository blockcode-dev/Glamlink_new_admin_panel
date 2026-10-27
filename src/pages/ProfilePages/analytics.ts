import dayjs, { type Dayjs } from "dayjs";
import type { PageAnalytics } from "../../types/profile";

export const DATE_FORMAT = "YYYY-MM-DD";

/** The clicks the website reports on a page (backend website/profiles/pageAnalytics.service.js), in plain words. */
export const CLICK_LABELS: Record<string, string> = {
  WEBSITE_CLICK: "Website",
  ACCESS_CARD_CLICK: "Access card",
  PRODUCT_CLICK: "Products",
  BOOKING_CLICK: "Booking link",
  SOCIAL_CLICK: "Social links",
  EMAIL_CLICK: "Email",
  PHONE_CLICK: "Phone",
};

/** A kind of click in plain words; one the API adds later reads from its name ("GALLERY_CLICK" is "Gallery"). */
export const clickLabel = (type: string) => {
  if (CLICK_LABELS[type]) return CLICK_LABELS[type];
  const words = type.replace(/_CLICK$/, "").replaceAll("_", " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export interface ClickCount {
  type: string;
  label: string;
  count: number;
}

/** Every kind of click with its count, most first (ties in the list's order); page views are left out. */
export const clickCounts = (events: Record<string, number>): ClickCount[] => {
  const types = new Set([...Object.keys(CLICK_LABELS), ...Object.keys(events)]);
  types.delete("PAGE_VIEW");
  return [...types]
    .map((type) => ({ type, label: clickLabel(type), count: Number(events[type]) || 0 }))
    .sort((a, b) => b.count - a.count);
};

const DEVICE_LABELS: Record<string, string> = { mobile: "Mobile", desktop: "Desktop", tablet: "Tablet" };

export const deviceLabel = (type: string | null) => (type && DEVICE_LABELS[type]) || "Unknown";

export interface DayCounts {
  date: string;
  views: number;
  clicks: number;
}

/** One entry per day of the range the API answered for: it lists only days with events, so the others get 0. */
export const fillDays = ({
  date_range,
  daily_views,
  daily_clicks,
}: Pick<PageAnalytics, "date_range" | "daily_views" | "daily_clicks">): DayCounts[] => {
  const views = new Map(daily_views.map((d) => [d.date.slice(0, 10), d.count]));
  const clicks = new Map(daily_clicks.map((d) => [d.date.slice(0, 10), d.count]));
  const first = dayjs(date_range.from);
  const last = dayjs(date_range.to);
  if (!first.isValid() || !last.isValid()) return [];
  const days: DayCounts[] = [];
  for (let day = first; !day.isAfter(last, "day"); day = day.add(1, "day")) {
    const date = day.format(DATE_FORMAT);
    days.push({ date, views: Number(views.get(date)) || 0, clicks: Number(clicks.get(date)) || 0 });
  }
  return days;
};

/**
 * The range as the API takes it. A day from today on is left out: the API then uses its own today, so a computer whose
 * date is ahead of the server's isn't refused for asking about "the future".
 */
export const rangeParams = (from: Dayjs, to: Dayjs, today: Dayjs = dayjs()): [string | undefined, string | undefined] => {
  const param = (day: Dayjs) => (day.isBefore(today, "day") ? day.format(DATE_FORMAT) : undefined);
  return [param(from), param(to)];
};

const PLATFORMS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  pinterest: "Pinterest",
  x: "X",
};

/** What a most-clicked target was: a product (by id), a social platform, or the link itself. */
export const targetText = ({ event_type, event_target }: { event_type: string; event_target: string }) => {
  if (event_type === "PRODUCT_CLICK") return `Product #${event_target}`;
  if (event_type === "SOCIAL_CLICK") {
    const name = event_target.toLowerCase();
    return PLATFORMS[name] ?? name.charAt(0).toUpperCase() + name.slice(1);
  }
  return event_target;
};

/** Targets are sent by the website's visitors' browsers: only plain web links become links here. */
export const isWebLink = (text: string) => /^https?:\/\/[^\s]+$/i.test(text);
