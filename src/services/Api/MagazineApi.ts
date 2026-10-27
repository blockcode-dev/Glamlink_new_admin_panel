import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse, Paged } from "../../types/api";
import type { IssueFeature, IssueFields, IssueListParams, IssueRow, MagazineIssue } from "../../types/magazine";

// The magazine's issues and who appears in each. A refusal is 400 INVALID_ISSUE with `details.field`; a missing issue
// is 404 NOT_FOUND.

type Id = number | string;

/** Every issue, drafts too, highest sort order first. */
export const GetIssues = async (params: IssueListParams = {}) => {
  return axios.get<ApiResponse<Paged<IssueRow>>>(`${BASE_URL}magazine/admin/list`, { params });
};

/** One issue, with everyone set on it. */
export const GetIssue = async (id: Id) => {
  return axios.get<ApiResponse<MagazineIssue>>(`${BASE_URL}magazine/admin/${id}`);
};

/** Adds an issue (201). Without a slug it gets one from the title; without a sort order, its issue number. */
export const CreateIssue = async (fields: IssueFields & { title: string }) => {
  return axios.post<ApiResponse<MagazineIssue>>(`${BASE_URL}magazine/admin`, fields);
};

/** Saves the fields sent; those left out keep their value. A new slug must be free. */
export const UpdateIssue = async (id: Id, fields: IssueFields) => {
  return axios.put<ApiResponse<MagazineIssue>>(`${BASE_URL}magazine/admin/${id}`, fields);
};

/** Deletes the issue for good, with the people set on it. */
export const DeleteIssue = async (id: Id) => {
  return axios.delete<ApiResponse<{ deleted: boolean }>>(`${BASE_URL}magazine/admin/${id}`);
};

/**
 * Replaces who appears in the issue: professional or brand accounts, each once (a repeat is dropped). Answers the
 * issue.
 */
export const SetIssueFeatures = async (id: Id, features: IssueFeature[]) => {
  return axios.put<ApiResponse<MagazineIssue>>(`${BASE_URL}magazine/admin/${id}/features`, { features });
};
