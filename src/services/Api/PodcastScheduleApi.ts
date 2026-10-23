import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse } from "../../types/api";
import type { PodcastSchedule } from "../../types/journal";

type Id = number | string;

/** Fields sent when creating or updating a schedule; schedule_date is "YYYY-MM-DD". */
export type PodcastScheduleInput = Pick<PodcastSchedule, "name" | "short_description" | "schedule_date">;

export const CreatePodcastSchedule = async (data: PodcastScheduleInput) => {
	// The page also reads a top-level id in case the API returns the record bare.
	return axios.post<ApiResponse<PodcastSchedule> & { id?: number }>(`${BASE_URL}podcast-schedule/create`, data);
};

export const GetAllPodcastSchedule = async () => {
	return axios.get<ApiResponse<PodcastSchedule[]>>(`${BASE_URL}podcast-schedule/list`);
};

export const GetPodcastScheduleById = async (id: Id) => {
	return axios.get<ApiResponse<PodcastSchedule>>(`${BASE_URL}podcast-schedule/${id}`);
};

export const UpdatePodcastSchedule = async (id: Id, data: PodcastScheduleInput) => {
	return axios.put<ApiResponse<PodcastSchedule>>(`${BASE_URL}podcast-schedule/update/${id}`, data);
};

export const DeletePodcastSchedule = async (ids: Id[]) => {
	return axios.delete<ApiResponse<unknown>>(`${BASE_URL}podcast-schedule/delete`, {
        data: {
			ids,
		}
    });
};
