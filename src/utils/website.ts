import { WEBSITE_URL } from "../config/env";

/** A page on the public website, e.g. websiteUrl(`/profiles/${slug}`). */
export const websiteUrl = (path: string) => `${WEBSITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
