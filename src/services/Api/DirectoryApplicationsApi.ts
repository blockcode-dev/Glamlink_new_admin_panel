import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse, Paged } from "../../types/api";
import type {
  DirectoryApplication,
  DirectoryApplicationListParams,
  DirectoryApplicationReview,
  DirectoryListingFields,
  ListingPhotoChanges,
  NewDirectoryListing,
} from "../../types/directoryApplication";

// Directory applications from the website's form, and the listings admins add. A refusal is 400 INVALID_INPUT with
// `details.field`; a missing application is 404 NOT_FOUND.

type Id = number | string;

/**
 * The request body: JSON, or multipart when files go too. Multipart carries lists and objects as JSON text and yes/no
 * as "true"/"false", as the website's form sends them; `gallery_meta` describes the new photos by position.
 */
const listingBody = (fields: DirectoryListingFields, photos: ListingPhotoChanges): FormData | Record<string, unknown> => {
  const { profile_image, images = [], remove_photos = [] } = photos;
  const body: Record<string, unknown> = { ...fields };
  if (profile_image === "") body.profile_image = "";
  if (remove_photos.length) body.remove_photos = remove_photos;
  if (images.length) {
    body.gallery_meta = images.map(({ caption, is_thumbnail, sort_order }) => ({ caption, is_thumbnail, sort_order }));
  }
  if (!(profile_image instanceof File) && !images.length) return body;

  const form = new FormData();
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue;
    form.append(key, value === null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value));
  }
  if (profile_image instanceof File) form.append("profile_image", profile_image);
  images.forEach((photo) => form.append("images", photo.file));
  return form;
};

/** Newest first, 50 a page at most; `status` and `search` (name, email, handle, title or specialty) narrow it. */
export const GetDirectoryApplications = async (params: DirectoryApplicationListParams = {}) => {
  return axios.get<ApiResponse<Paged<DirectoryApplication>>>(`${BASE_URL}directory/applications`, { params });
};

/** How many applications wait for review (for the sidebar's badge). */
export const GetPendingDirectoryApplicationCount = async (): Promise<number> => {
  const res = await GetDirectoryApplications({ status: "pending", limit: 1 });
  return res.data.data.count;
};

/** Every field the application holds, its lists and objects parsed. 404 NOT_FOUND. */
export const GetDirectoryApplication = async (id: Id) => {
  return axios.get<ApiResponse<DirectoryApplication>>(`${BASE_URL}directory/applications/${id}`);
};

/**
 * Approves, rejects or moves an application back to pending, recording who and when. Approving makes (or finds) the
 * account for its email, links it (`user_id`) and emails the person how to sign in, once: approving a linked one again
 * sends nothing. The status is saved before the account is made, so reload after a failure.
 */
export const ReviewDirectoryApplication = async (id: Id, review: DirectoryApplicationReview) => {
  return axios.put<ApiResponse<DirectoryApplication>>(`${BASE_URL}directory/applications/${id}/status`, review);
};

/** Saves the fields sent and the photo changes; changes to an approved listing show on the website at once. */
export const UpdateDirectoryListing = async (id: Id, fields: DirectoryListingFields, photos: ListingPhotoChanges = {}) => {
  return axios.put<ApiResponse<DirectoryApplication>>(`${BASE_URL}directory/applications/${id}`, listingBody(fields, photos));
};

/** Adds a listing for someone (201). Approved, the default, it makes their account and emails them, as approval does. */
export const CreateDirectoryListing = async (listing: NewDirectoryListing, photos: ListingPhotoChanges = {}) => {
  return axios.post<ApiResponse<DirectoryApplication>>(`${BASE_URL}directory/applications/admin`, listingBody(listing, photos));
};

/** Deletes the applications and their photos. Linked accounts stay. */
export const DeleteDirectoryApplications = async (ids: number[]) => {
  return axios.post<ApiResponse<{ deleted: number }>>(`${BASE_URL}directory/applications/delete`, { ids });
};

/** The specialties the website's form offers (its categories, by title). */
export const GetListingSpecialties = async () => {
  return axios.get<ApiResponse<Paged<{ id: number; title: string }>>>(`${BASE_URL}businessCard/getAllCategories`);
};
