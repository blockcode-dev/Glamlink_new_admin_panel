import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse } from "../../types/api";
import type { HomeSettings, SearchTerm } from "../../types/content";

// Site-wide parts of the website: what people search for, and the home page's hand-set images and searches.

/**
 * `top`: the most searched terms first. `empty`: the latest searches that found nothing, worth a page, a topic or a
 * popular search. A plain list (no total): a page shorter than `limit` is the last one.
 */
export const GetSearchTerms = async (params: { sort: "top" | "empty"; page?: number; limit?: number }) => {
  return axios.get<ApiResponse<SearchTerm[]>>(`${BASE_URL}search/admin/terms`, { params });
};

export const GetHomeSettings = async () => {
  return axios.get<ApiResponse<HomeSettings>>(`${BASE_URL}settings/home`);
};

/**
 * Changes only the fields sent, and answers the settings as saved. Images are links from POST /journal/upload ("" to
 * remove); 400 INVALID_SETTING names the field in `details.field`.
 */
export const UpdateHomeSettings = async (
  fields: Partial<Pick<HomeSettings, "hero_image" | "find_professional_image" | "popular_searches">>,
) => {
  return axios.put<ApiResponse<HomeSettings>>(`${BASE_URL}settings/home`, fields);
};
