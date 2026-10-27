import { apiErrorCode, apiErrorMessage } from "../../utils/apiError";
import type { PlaylistImport } from "../../services/Api/VideoApi";
import type { VideoRole, VideoSeries, VideoSource, VideoStatus } from "../../types/video";

// Words and helpers the Watch screens share.

/** The series as Select options, marking those the Watch page leaves out. */
export const seriesOptions = (series: VideoSeries[]) =>
  series.map((s) => ({ value: s.id, label: s.is_active ? s.name : `${s.name} (inactive)` }));

export const STATUSES: { value: VideoStatus; label: string }[] = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

export const SOURCES: Record<VideoSource, { label: string; hint: string }> = {
  sync: { label: "Playlist import", hint: "Imported from its series' YouTube playlist" },
  admin: { label: "Added by link", hint: "Added by an admin from a YouTube link" },
};

// The website's words for each part.
export const ROLES: { value: VideoRole; label: string }[] = [
  { value: "host", label: "Host" },
  { value: "guest", label: "Guest" },
  { value: "featured", label: "Featured" },
];

/** The video's page on YouTube. */
export const youtubeUrl = (youtubeId: string) => `https://www.youtube.com/watch?v=${youtubeId}`;

/** A YouTube playlist's page. */
export const playlistUrl = (playlistId: string) => `https://www.youtube.com/playlist?list=${playlistId}`;

/** "8:05" or "1:02:03". */
export const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
};

/** Why a call that reaches YouTube failed, in the admin's words; else the API's message, or the fallback. */
export const youtubeErrorMessage = (err: unknown, fallback: string): string => {
  switch (apiErrorCode(err)) {
    case "YOUTUBE_NOT_CONFIGURED":
      return "The server has no YouTube key yet (YOUTUBE_API_KEY), so nothing can come in from YouTube.";
    case "YOUTUBE_UNAVAILABLE":
      return "YouTube didn't answer. Try again in a moment.";
    default:
      return apiErrorMessage(err) || fallback;
  }
};

const newVideos = (count: number) => `${count} new video${count === 1 ? "" : "s"}`;

/**
 * What importing the playlists brought in, worded like the podcast screen's import button. `nameOf` turns the
 * report's series slugs into names.
 */
export const playlistImportMessage = (
  { imported, series }: PlaylistImport,
  nameOf: (slug: string) => string = (slug) => slug,
): { type: "success" | "info" | "warning"; text: string } => {
  const failed = series.filter((s) => s.error);
  if (failed.length) {
    return {
      type: "warning",
      text: `${newVideos(imported)} imported. YouTube couldn't be read for ${failed.map((s) => nameOf(s.series)).join(", ")}: ${failed[0].error}`,
    };
  }
  if (!series.length) return { type: "info", text: "No active series has a YouTube playlist to import" };
  if (imported) return { type: "success", text: `${newVideos(imported)} imported from YouTube` };
  return { type: "info", text: "No new videos on YouTube" };
};
