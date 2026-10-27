import type { UploadFile } from "antd";
import type { Dayjs } from "dayjs";
import type { BusinessCard } from "./businessCard";

/** Values of the Add/Edit journal form (content and downloads live in component state). */
export interface JournalFormValues {
  title: string;
  short_description: string | null;
  author_id: number;
  category_id: number;
  seo_title?: string;
  meta_description?: string;
  slug?: string;
  shop_ids?: number[];
  publish_date?: Dayjs | null;
  /** Edit page only; Add takes the status from the button pressed. */
  status?: string;
  /** The Journal hero's article. */
  is_featured?: boolean;
}

/** One journal paragraph tagged with a topic, as sent to the topic's paragraph list. */
export interface ParagraphRow {
  journal_id: number | string;
  paragraph_id: string | null;
  sort_order: number;
}

/** A download row being edited on the Add/Edit journal pages. */
export interface DownloadDraft {
  /** Saved id, or a temporary one for rows added on this page. */
  id: number | string;
  isExisting?: boolean;
  title: string;
  description: string;
  button_text: string;
  /** URL of the saved file (existing rows only). */
  existingFileUrl?: string;
  fileList: UploadFile[];
}

export interface JournalCategory {
  id: number;
  title: string;
  /** Made from the title for the website's URLs ("What's New" is whats-new). */
  slug?: string | null;
  description?: string | null;
  /** The Journal sidebar's order: lowest first, then by title. */
  sort_order?: number;
  /** Published articles in the category. */
  article_count?: number;
  created_at?: string;
}

export interface Author {
  id: number;
  name: string;
  designation?: string | null;
  bio?: string | null;
  profile_image?: string | null;
}

/** A downloadable file (usually a PDF) attached to a journal. */
export interface JournalDownload {
  id: number;
  title?: string | null;
  description?: string | null;
  button_text?: string | null;
  /** File URL. */
  file_name: string;
  sort_order?: number | null;
}

export interface Journal {
  id: number;
  title: string;
  short_description?: string | null;
  /** HTML from the rich-text editor, with paragraph topic tags. */
  content?: string | null;
  /** "published" or "draft". */
  status?: string;
  /** "YYYY-MM-DD HH:mm:ss" (older rows: ISO). */
  publish_date?: string | null;
  cover_image?: string | null;
  slug?: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  author_id?: number;
  category_id?: number;
  journal_author?: Author | null;
  journal_category?: JournalCategory | null;
  shops?: { id: number }[];
  downloads?: JournalDownload[];
  /** The Journal page's hero shows the newest featured article. */
  is_featured?: boolean;
  /** On create and update only: the @handles in the text that match no page or card (likely typos). */
  unmatched_mentions?: string[];
}

/** Someone an article features (GET /journal/:id/mentions). */
export interface ArticleMention {
  id: number;
  /** "text": an @handle in the article. "editor": an account added on the article form. */
  source: "text" | "editor";
  /** The @handle, for a text mention. */
  handle: string | null;
  /** A text mention set aside: it stays in the text but doesn't count. */
  excluded: boolean;
  /** The professional or brand account; null when the handle matches no page slug or card handle. */
  account: {
    id: number;
    slug: string | null;
    name: string | null;
    type: "individual" | "brand" | null;
    visible: boolean;
  } | null;
}

export interface ArticleMentions {
  mentions: ArticleMention[];
  /** Handles in the text that match no one. */
  unmatched: string[];
}

/** Fields shared by the "Discover" items (education, events, shop). */
interface DiscoverItem {
  id: number;
  title: string;
  cover_image?: string | null;
  link?: string | null;
  short_description?: string | null;
  /** "published" or "draft". */
  status?: string;
}

export interface Education extends DiscoverItem {
  category?: string | null;
}

export interface DiscoverEvent extends DiscoverItem {
  event_date?: string | null;
  location?: string | null;
}

/** A product's link to a professional's or brand's page; null when the account has no visible page. */
export interface PageLink {
  id: number;
  slug: string;
  name: string | null;
  type?: "individual" | "brand" | null;
}

export interface Shop extends DiscoverItem {
  /** The product page's address (shop/<slug>): made from the title unless given; kept when the title changes. */
  slug?: string | null;
  /** The name shown for the brand (free text). */
  brand?: string | null;
  price?: number | string | null;
  /** The product page's longer text (plain text; a blank line starts a paragraph). Lists leave it out. */
  description?: string | null;
  /** The professional or brand account that put the product up; null: Glamlink's own pick. */
  owner_id?: number | null;
  /** The brand account that makes it. */
  brand_id?: number | null;
  owner?: PageLink | null;
  brand_profile?: PageLink | null;
  /** Shown in the home page's Shop Products row, by featured_order (lowest first). */
  is_featured?: boolean;
  featured_order?: number;
  journal_topics?: { id: number }[];
}

export interface JournalFaq {
  id: number;
  question: string;
  answer: string;
  is_active?: boolean;
}

export interface PodcastSchedule {
  id: number;
  name: string;
  short_description?: string | null;
  schedule_date?: string | null;
  journal_topics?: { id: number }[];
}

/**
 * A professional linked to a topic. The topic's own list is flat (name, email,
 * business_card); the general professionals list nests the name in user_profile.
 */
export interface TopicProfessional {
  id: number;
  name?: string | null;
  email?: string | null;
  profile_image?: string | null;
  business_card?: BusinessCard | null;
  user_profile?: { name?: string | null; profile_image?: string | null };
}

export interface JournalTopic {
  id: number;
  name: string;
  description?: string | null;
  slug?: string | null;
  cover_image?: string | null;
  /** A tile in the home page's "Explore Beauty + Wellness" row. */
  is_featured?: boolean;
  /** The tiles' order: lowest first, then by name. */
  featured_order?: number;
  /** The tile's square image (an upload's link); the tile shows cover_image without one. */
  tile_image?: string | null;
  is_active?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
  shops?: Shop[];
  podcasts?: PodcastSchedule[];
  professionals?: TopicProfessional[];
}

/** A journal paragraph tagged with a topic (see data-paragraph-id in the editor HTML). */
export interface TopicParagraph {
  id?: number;
  journal_id: number;
  paragraph_id: string;
  sort_order: number;
  journal?: Journal | null;
}

/** paragraph_ids per topic id, as read from the editor HTML. */
export type ParagraphTopicMap = Record<number, { paragraph_id: string | null; sort_order: number }[]>;

export interface JournalTopicMapping {
  topic_id?: number;
  topic?: { id: number };
}

export interface JournalFaqMapping {
  faq_id?: number;
  faq?: { id: number };
}
