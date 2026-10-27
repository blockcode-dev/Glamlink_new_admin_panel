import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse, Paged } from "../../types/api";
import type {
  SeriesFields,
  Video,
  VideoFields,
  VideoImport,
  VideoListParams,
  VideoPerson,
  VideoRow,
  VideoSeries,
} from "../../types/video";

// Watch: video series and their videos. A refusal is 400 INVALID_VIDEO with `details.field`; a missing video or series
// is 404 NOT_FOUND. Calls that reach YouTube can answer 503 YOUTUBE_NOT_CONFIGURED (the server has no key) or 502
// YOUTUBE_UNAVAILABLE.

type Id = number | string;

/** One series' part of an import: how many new videos came in, or why its playlist couldn't be read. */
export interface SeriesImport {
  series: string;
  imported: number;
  error?: string;
}

export interface PlaylistImport {
  imported: number;
  series: SeriesImport[];
}

/**
 * Brings in the new public videos of every series' YouTube playlist, the Beauty Vault
 * podcast's among them. Nothing imports on a clock: this is how new episodes reach the site.
 */
export const ImportPlaylists = async () => {
  return axios.post<ApiResponse<PlaylistImport>>(BASE_URL + "videos/admin/sync");
};

/** Every series, active or not, in the Watch page's order. */
export const GetAllSeries = async () => {
  return axios.get<ApiResponse<VideoSeries[]>>(`${BASE_URL}video-series/admin`);
};

/** Adds a series (201). */
export const CreateSeries = async (fields: SeriesFields & { name: string }) => {
  return axios.post<ApiResponse<VideoSeries>>(`${BASE_URL}video-series/admin`, fields);
};

/** Saves the fields sent; those left out keep their value. */
export const UpdateSeries = async (id: Id, fields: SeriesFields) => {
  return axios.put<ApiResponse<VideoSeries>>(`${BASE_URL}video-series/admin/${id}`, fields);
};

/** Every video, drafts too, newest on YouTube first. */
export const GetVideos = async (params: VideoListParams = {}) => {
  return axios.get<ApiResponse<Paged<VideoRow>>>(`${BASE_URL}videos/admin/list`, { params });
};

/** One video, with its people and topics. */
export const GetVideo = async (id: Id) => {
  return axios.get<ApiResponse<Video>>(`${BASE_URL}videos/admin/${id}`);
};

/** Saves the fields sent; those left out keep their value. A new slug must be free. */
export const UpdateVideo = async (id: Id, fields: VideoFields) => {
  return axios.put<ApiResponse<Video>>(`${BASE_URL}videos/admin/${id}`, fields);
};

/** Replaces the people in the video: professional or brand accounts, each once (a repeat is dropped). */
export const SetVideoPeople = async (id: Id, people: VideoPerson[]) => {
  return axios.put<ApiResponse<Video>>(`${BASE_URL}videos/admin/${id}/people`, { people });
};

/** Replaces the video's topics, in this order. Every topic must be active. */
export const SetVideoTopics = async (id: Id, topicIds: number[]) => {
  return axios.put<ApiResponse<Video>>(`${BASE_URL}videos/admin/${id}/topics`, { topic_ids: topicIds });
};

/**
 * Adds a video from a YouTube link (watch, youtu.be, shorts, embed or live), published, with YouTube's title,
 * description, thumbnail and length: 201 with `created`. A video already here answers 200 as it is, without a call
 * to YouTube (its series doesn't change). A link that isn't a public video is refused on `url`.
 */
export const ImportVideo = async (body: { url: string; series_id?: number }) => {
  return axios.post<ApiResponse<VideoImport>>(`${BASE_URL}videos/admin/import`, body);
};
