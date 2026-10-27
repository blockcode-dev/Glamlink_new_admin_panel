// Watch (the website's /watch, and the podcast's episodes): YouTube videos in series. A series' new uploads come in
// only when an admin imports the playlists; single videos are added by link. Backend: website/watch.

export type VideoStatus = "draft" | "published";

/** How a video came in: imported from its series' playlist ("sync"), or added by an admin from a link ("admin"). */
export type VideoSource = "sync" | "admin";

/** Someone's part in a video. */
export type VideoRole = "host" | "guest" | "featured";

/** A series (GET /video-series/admin): a row of the Watch page, filled from its YouTube playlist. */
export interface VideoSeries {
  id: number;
  name: string;
  slug: string;
  /** The YouTube playlist's id; null: nothing is imported for the series. */
  playlist_id: string | null;
  /** The Watch page shows series lowest first. */
  sort_order: number;
  /** Inactive: the Watch page leaves it out and imports skip its playlist. */
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** What an admin sets on a series. */
export interface SeriesFields {
  name?: string;
  /** Made from the name on a new series when left out. */
  slug?: string;
  /** A playlist's id or link; "" removes it. */
  playlist_id?: string;
  sort_order?: number;
  is_active?: boolean;
}

/** A video as the admin list shows it (GET /videos/admin/list), newest on YouTube first. */
export interface VideoRow {
  id: number;
  /** The video's address on the website: /watch/<slug> (the podcast's episodes redirect to /podcast/<slug>). */
  slug: string;
  title: string;
  youtube_id: string;
  /** YouTube's image (i.ytimg.com). */
  thumbnail: string | null;
  /** When YouTube published it. */
  published_at: string | null;
  duration_seconds: number | null;
  is_featured: boolean;
  series: { id: number; name: string; slug: string } | null;
  status: VideoStatus;
  source: VideoSource;
}

export interface VideoPerson {
  /** A professional or brand account. */
  user_id: number;
  role: VideoRole;
}

/** One video as admins edit it (GET /videos/admin/:id). */
export interface Video extends VideoRow {
  description: string | null;
  /** Among featured videos, lowest first. */
  featured_order: number;
  /** Everyone set on it, whether or not their page shows. */
  people: VideoPerson[];
  /** Journal topics, in order. */
  topic_ids: number[];
}

/** What an admin sets on a video. */
export interface VideoFields {
  title?: string;
  /** Can't be cleared: leave it out to keep the current one. */
  slug?: string;
  description?: string;
  /** "" for none. */
  series_id?: number | "";
  status?: VideoStatus;
  is_featured?: boolean;
  featured_order?: number;
}

export interface VideoListParams {
  /** A series' id or slug. */
  series?: number | string;
  status?: VideoStatus;
  /** In the title. */
  search?: string;
  page?: number;
  /** At most 50. */
  limit?: number;
}

/** What pasting a link answers: `created` false when the video was already here (answered as it is, unchanged). */
export interface VideoImport {
  created: boolean;
  video: Video;
}
