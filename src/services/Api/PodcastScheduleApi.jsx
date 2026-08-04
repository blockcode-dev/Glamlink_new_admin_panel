import axios from "axios";
import { BASE_URL } from "../Host";


export const CreatePodcastSchedule = async (data, token) => {
	return axios.post(`${BASE_URL}/podcast-schedule/create`, data, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
};

export const GetAllPodcastSchedule = async (token) => {
	return axios.get(`${BASE_URL}/podcast-schedule/list`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
};

export const GetPodcastScheduleById = async (id, token) => {
	return axios.get(`${BASE_URL}/podcast-schedule/${id}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
};

export const UpdatePodcastSchedule = async (id, data, token) => {
	return axios.put(`${BASE_URL}/podcast-schedule/update/${id}`, data, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
};

export const DeletePodcastSchedule = async (ids, token) => {
	return axios.delete(`${BASE_URL}/podcast-schedule/delete`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		data: {
			ids,
		},
	});
};