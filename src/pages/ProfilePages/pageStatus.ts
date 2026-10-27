import { useLocation } from "react-router";
import { websiteUrl } from "../../utils/website";
import type { PageRow, PageType, PageView } from "../../types/profile";

/** A page's address on the website. */
export const publicPageUrl = (slug: string) => websiteUrl(`/profiles/${slug}`);

/** The address without "https://", for showing. */
export const shortUrl = (url: string) => url.replace(/^https?:\/\//, "");

export const TYPE_LABEL: Record<PageType, string> = { individual: "Individual", brand: "Brand" };
export const TYPE_COLOR: Record<PageType, string> = { individual: "geekblue", brand: "purple" };

/**
 * What the pages list hands a page's screens in the route's state: whether the account can sign in (the page view
 * doesn't say; only the list knows), the list's address with its filters to go back to, and whether the page was
 * just made.
 */
export interface PageRouteState {
  claimed?: boolean;
  from?: string;
  created?: boolean;
}

export const usePageRouteState = (): PageRouteState => {
  const { state } = useLocation();
  if (typeof state !== "object" || state === null) return {};
  const { claimed, from, created } = state as Record<string, unknown>;
  return {
    claimed: typeof claimed === "boolean" ? claimed : undefined,
    from: typeof from === "string" && from.startsWith("/pages") ? from : undefined,
    created: created === true,
  };
};

/**
 * A list row's standing: shown, or hidden because it is unlisted, or because it has nothing behind it (no live card,
 * no approved listing, not an admin's brand page).
 */
export const rowStatus = (row: PageRow): "shown" | "unlisted" | "no_live_card" =>
  row.visible ? "shown" : row.is_listed ? "no_live_card" : "unlisted";

/** Why the public can't see a page, in plain words. Both can hold at once; empty while it shows. */
export const hiddenReasons = ({ visible, hidden_because, page }: PageView): string[] => {
  if (visible) return [];
  const reasons: string[] = [];
  if (!page.is_listed) reasons.push('It is unlisted. Turn on "Listed on the website" below to show it.');
  if (hidden_because === "no_live_card") {
    reasons.push(
      "It has no live Access card and no approved directory listing, so there is nothing to show. It shows once the account has a live card.",
    );
  }
  return reasons.length ? reasons : ["The website doesn't show it."];
};
