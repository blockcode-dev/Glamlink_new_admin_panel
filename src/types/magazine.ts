// The magazine (the website's /magazine): its issues, each with a cover and a flipbook, and the professionals and
// brands in each. Backend: website/magazine.

export type IssueStatus = "draft" | "published";

/** Someone's part in an issue. The website says "On the cover", "Featured" or "Mentioned". */
export type IssueRole = "cover" | "featured" | "mentioned";

/**
 * The flipbook "Read the digital edition" opens: the link given for it, else the embed built from Publuu's account and
 * flipbook ids (only when both are set). The API answers this rather than the three fields, so an issue with both a
 * link and Publuu ids shows only its link, and a lone Publuu id doesn't show.
 */
export type Flipbook = { publuu_account_id: number; publuu_flipbook_id: number; url: string } | { url: string };

/** An issue as the admin list shows it (GET /magazine/admin/list), highest sort order first. */
export interface IssueRow {
  id: number;
  /** The issue's address on the website: /magazine/<slug>. */
  slug: string;
  title: string;
  issue_number: number | null;
  /**
   * A link: an upload on the API's host, or the website's own file for the issues loaded from the old site (until the
   * backend copies their covers). The API takes back only uploads to its host.
   */
  cover_image: string | null;
  /** YYYY-MM-DD. */
  publish_date: string | null;
  short_description: string | null;
  is_featured: boolean;
  flipbook: Flipbook | null;
  status: IssueStatus;
  sort_order: number;
}

/** A professional or brand account in an issue. */
export interface IssueFeature {
  user_id: number;
  role: IssueRole;
  page_number: number | null;
}

/** One issue as admins edit it (GET /magazine/admin/:id), with everyone set on it, whether or not their page shows. */
export interface MagazineIssue extends IssueRow {
  features: IssueFeature[];
}

/**
 * What an admin sets on an issue (sent as JSON). null clears a number or the date, "" a text or the cover; the slug
 * can't be cleared. The cover is a link from POST /journal/upload.
 */
export interface IssueFields {
  title?: string;
  /** Made from the title on a new issue when left out. */
  slug?: string;
  issue_number?: number | null;
  /** YYYY-MM-DD. */
  publish_date?: string | null;
  publuu_account_id?: number | null;
  publuu_flipbook_id?: number | null;
  /** An https link; used instead of the Publuu ids when set. */
  flipbook_url?: string;
  short_description?: string;
  status?: IssueStatus;
  /** Highest first. A new issue without one gets its issue number. */
  sort_order?: number;
  is_featured?: boolean;
  cover_image?: string;
}

export interface IssueListParams {
  status?: IssueStatus;
  /** In the title. */
  search?: string;
  page?: number;
  /** At most 50. */
  limit?: number;
}
