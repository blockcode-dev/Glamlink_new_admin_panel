import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse, Paged } from "../../types/api";
import type { FeatureRequest, NewsletterSubscriber } from "../../types/content";

// What the website's newsletter forms and "Apply for Feature" store. Lists are newest first, 50 a page at most.

export interface NewsletterFilters {
  /** Email or name. */
  search?: string;
  /** "popup", "footer", "podcast", … */
  source?: string;
}

export const GetNewsletterSubscribers = async (params: NewsletterFilters & { page?: number; limit?: number }) => {
  return axios.get<ApiResponse<Paged<NewsletterSubscriber>>>(`${BASE_URL}newsletter/list`, { params });
};

/** Every subscriber matching the filters, as a CSV file (Email, First name, Last name, Source, Signed up). */
export const ExportNewsletterSubscribers = async (params: NewsletterFilters) => {
  // A file, not JSON: it comes back as a Blob for the browser to save.
  return axios.get<Blob>(`${BASE_URL}newsletter/export`, { params, responseType: "blob" });
};

/** Removes the emails from the list. */
export const DeleteNewsletterSubscribers = async (ids: React.Key[]) => {
  return axios.post<ApiResponse<{ deleted: number }>>(`${BASE_URL}newsletter/delete`, { ids });
};

export const GetFeatureRequests = async (params: {
  /** Name, email, specialty or city. */
  search?: string;
  interest?: string;
  page?: number;
  limit?: number;
}) => {
  return axios.get<ApiResponse<Paged<FeatureRequest>>>(`${BASE_URL}feature-request/list`, { params });
};

export const DeleteFeatureRequests = async (ids: React.Key[]) => {
  return axios.post<ApiResponse<{ deleted: number }>>(`${BASE_URL}feature-request/delete`, { ids });
};
