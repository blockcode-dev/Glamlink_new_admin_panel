import type { FormRule } from "antd";
import { htmlToText } from "../../utils/sanitizeHtml";
import type { PageUpdate, PageView, SocialLink } from "../../types/profile";

// The checks the API makes on a page's fields (backend website/profiles/pageFields.js), so the form says so before
// saving. The API still has the last word: a refusal is 400 INVALID_PAGE with `details.field`.

export const LIMITS = { name: 150, tagline: 150, about: 2000, link: 500, socialTitle: 30, social: 10, slugMax: 60 } as const;

/** The page form's values. Text fields hold "" when empty; images hold the uploaded image's link, or "". */
export interface PageFormValues {
  slug: string;
  is_listed: boolean;
  is_featured: boolean;
  featured_order: number | null;
  tagline: string;
  about: string;
  website: string;
  social: SocialLink[];
  image: string;
  cover_image: string;
}

export const NEW_PAGE_VALUES: PageFormValues = {
  slug: "",
  is_listed: true,
  is_featured: false,
  featured_order: 0,
  tagline: "",
  about: "",
  website: "",
  social: [],
  image: "",
  cover_image: "",
};

/** The form's values for a saved page. The address is the one the page answers to: its own slug, else its card's handle. */
export const toFormValues = ({ slug, page }: PageView): PageFormValues => ({
  slug: slug ?? "",
  is_listed: page.is_listed,
  is_featured: page.is_featured,
  featured_order: page.featured_order,
  tagline: page.tagline ?? "",
  about: page.about ?? "",
  website: page.website ?? "",
  social: page.social ?? [],
  image: page.image ?? "",
  cover_image: page.cover_image ?? "",
});

/**
 * The body for UpdatePage and CreateBrandPage: the form's fields and nothing else. Empty fields go as null, so the
 * page falls back to the card's. An empty social list goes as null too: the API keeps an empty list as "no links",
 * which would hide the card's. The address goes only once changed (the API refuses an empty one, and an unchanged
 * card handle stays the card's rather than becoming the page's own).
 */
export const toPageUpdate = (values: PageFormValues, savedSlug: string): PageUpdate => {
  const slug = values.slug.trim();
  const text = (value: string) => value.trim() || null;
  return {
    ...(slug && slug !== savedSlug ? { slug } : {}),
    is_listed: values.is_listed,
    is_featured: values.is_featured,
    featured_order: values.featured_order ?? 0,
    tagline: text(values.tagline),
    about: htmlToText(values.about).trim() ? values.about : null,
    website: text(values.website),
    social: values.social.length
      ? values.social.map((link) => ({ title: link.title.trim(), url: link.url.trim() }))
      : null,
    image: values.image || null,
    cover_image: values.cover_image || null,
  };
};

/**
 * What the public sees where a page field is empty: the card's, the directory listing's or the account's. Only known
 * while the page's own field is empty (the public view then shows the fallback); null otherwise.
 */
export interface PageFallbacks {
  /** Whose fields fill the gaps: "Access card", "directory listing", or null (a brand page with neither). */
  source: string | null;
  /** The address is the card's handle: the page has no slug of its own. */
  addressFromCard: boolean;
  tagline: string | null;
  about: string | null;
  website: string | null;
  social: SocialLink[] | null;
  image: string | null;
}

export const fallbacksOf = ({ slug, page, public: shown }: PageView): PageFallbacks => ({
  source: shown.access_card ? "Access card" : shown.listing ? "directory listing" : null,
  addressFromCard: !page.slug && Boolean(slug),
  tagline: page.tagline ? null : shown.tagline,
  about: page.about ? null : shown.about,
  website: page.website ? null : shown.website,
  social: page.social ? null : shown.social,
  image: page.image ? null : shown.image,
});

// The API makes a slug of what it gets ("Kate Sue" is kate-sue); the form asks for one already written that way.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Lower case, spaces as dashes, while typing. */
export const normalizeSlug = (value: string | undefined) => (value ?? "").toLowerCase().replace(/\s+/g, "-");

/**
 * The address: checked only once changed (an old card handle may not follow today's rule), and it can't be emptied
 * once the page has one (the API can change an address, not remove it). Whether it's free, only the API knows.
 */
export const slugRules = (savedSlug: string): FormRule[] => [
  {
    validator: async (_, value: string | undefined) => {
      const slug = (value ?? "").trim();
      if (slug === savedSlug) return;
      if (!slug) throw new Error("Every page needs an address");
      if (slug.length < 3 || slug.length > LIMITS.slugMax) throw new Error(`Use 3 to ${LIMITS.slugMax} characters`);
      if (!SLUG.test(slug)) throw new Error("Use lower-case letters and digits, with single dashes between words");
    },
  },
];

/** Why the API would refuse this as a web link, or null. Like the API, "example.com" counts as https://example.com. */
export const webLinkProblem = (value: string): string | null => {
  const raw = value.trim();
  if (!raw) return null;
  if (raw.length > LIMITS.link) return `At most ${LIMITS.link} characters`;
  const link = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(link);
    if ((url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".")) return null;
  } catch {
    // Not a URL at all: refused below.
  }
  return "Enter a web link, like example.com";
};

export const webLinkRule: FormRule = {
  validator: async (_, value: string | undefined) => {
    const problem = webLinkProblem(value ?? "");
    if (problem) throw new Error(problem);
  },
};

/** About: at most 2,000 characters of text (formatting doesn't count). */
export const aboutRule: FormRule = {
  validator: async (_, value: string | undefined) => {
    const length = htmlToText(value).trim().length;
    if (length > LIMITS.about) throw new Error(`At most 2,000 characters (now ${length.toLocaleString("en-US")})`);
  },
};
