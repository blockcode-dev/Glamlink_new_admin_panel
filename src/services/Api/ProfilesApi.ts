import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse, Paged } from "../../types/api";
import type { PageAnalytics, PageListParams, PageRow, PageUpdate, PageView } from "../../types/profile";

// Professional and brand pages. Every call takes the account's id; a refusal is 400 INVALID_PAGE with `details.field`.

type Id = number | string;

/** Every page, by name: listed or not, with how each stands. */
export const GetPages = async ({ featured, ...params }: PageListParams = {}) => {
  return axios.get<ApiResponse<Paged<PageRow>>>(`${BASE_URL}profiles/admin/list`, {
    params: { ...params, ...(featured ? { featured: "true" } : {}) },
  });
};

/** One account's page: what is set on it, whether it shows (and why not), and what the public sees. 404 NOT_FOUND. */
export const GetPage = async (userId: Id) => {
  return axios.get<ApiResponse<PageView>>(`${BASE_URL}profiles/admin/${userId}`);
};

/** Saves the fields sent. A new slug must be free. */
export const UpdatePage = async (userId: Id, fields: PageUpdate) => {
  return axios.put<ApiResponse<PageView>>(`${BASE_URL}profiles/admin/${userId}`, fields);
};

/**
 * A brand page for a brand with no login yet: its account has no password, and the page shows without a card.
 * 409 ACCOUNT_EXISTS (`details.user_id`) when the email has an account: edit that account's page instead.
 */
export const CreateBrandPage = async (fields: PageUpdate & { name: string; email: string }) => {
  return axios.post<ApiResponse<PageView>>(`${BASE_URL}profiles/admin/brands`, fields);
};

/** Emails the account a "Set your password" link (valid 7 days). 409 ALREADY_CLAIMED once it has a password. */
export const SendPageInvite = async (userId: Id) => {
  return axios.post<ApiResponse<{ sent: boolean; email: string }>>(`${BASE_URL}profiles/admin/${userId}/invite`);
};

/** `from` / `to`: "YYYY-MM-DD", not in the future; today when left out. */
export const GetPageAnalytics = async (userId: Id, from?: string, to?: string) => {
  return axios.get<ApiResponse<PageAnalytics>>(`${BASE_URL}profiles/admin/${userId}/analytics`, {
    params: { from, to },
  });
};
