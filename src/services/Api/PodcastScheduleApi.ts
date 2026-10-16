import axios from "axios";
import { BASE_URL } from "../Host";
import type { AdminToken, ApiResponse } from "../../types/api";
import type { PodcastSchedule } from "../../types/journal";

type Id = number | string;

/** Fields sent when creating or updating a schedule; schedule_date is "YYYY-MM-DD". */
export type PodcastScheduleInput = Pick<PodcastSchedule, "name" | "short_description" | "schedule_date">;

export const CreatePodcastSchedule = async (data: PodcastScheduleInput, token: AdminToken) => {
	// The page also reads a top-level id in case the API returns the record bare.
	return axios.post<ApiResponse<PodcastSchedule> & { id?: number }>(`${BASE_URL}/podcast-schedule/create`, data, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
};

export const GetAllPodcastSchedule = async (token: AdminToken) => {
	return axios.get<ApiResponse<PodcastSchedule[]>>(`${BASE_URL}/podcast-schedule/list`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
};

export const GetPodcastScheduleById = async (id: Id, token: AdminToken) => {
	return axios.get<ApiResponse<PodcastSchedule>>(`${BASE_URL}/podcast-schedule/${id}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
};

export const UpdatePodcastSchedule = async (id: Id, data: PodcastScheduleInput, token: AdminToken) => {
	return axios.put<ApiResponse<PodcastSchedule>>(`${BASE_URL}/podcast-schedule/update/${id}`, data, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
};

export const DeletePodcastSchedule = async (ids: Id[], token: AdminToken) => {
	return axios.delete<ApiResponse<unknown>>(`${BASE_URL}/podcast-schedule/delete`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		data: {
			ids,
		},
	});
};
