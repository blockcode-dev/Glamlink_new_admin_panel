/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";
import type { AdminToken, ApiResponse, ListParams, Paged } from "../../types/api";
import type { ProfessionUser, Speciality } from "../../types/catalog";

type Id = number | string;

export const GetSpecialities = async (adminToken: AdminToken, params: ListParams) => {
	const { page, limit, sortBy } = params;

	try {
		const res = await axios.get<ApiResponse<Paged<Speciality>>>(BASE_URL + "profession", {
			headers: {
				"x-access-token": adminToken,
				"Content-Type": "application/json",
			},
			params: {
				page: page,
				limit: limit,
				sortBy: sortBy,
			},
		});

		return res.data; // Return just the data part of the response
	} catch (error) {
		console.error("Error fetching service categories:", error);
		throw error;
	}
};

export const GetSpecialitiesById = async (id: Id) => {
	return await axios.get<ApiResponse<Speciality>>(BASE_URL + `profession/${id}`);
};

export const CreateSpecialities = async (formData: { title: string }) => {
	return await axios.post<ApiResponse<Speciality>>(BASE_URL + "profession", formData, {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
};

export const UpdateSpecialities = async (id: Id, formData: FormData) => {
	return await axios.put<ApiResponse<Speciality>>(BASE_URL + `profession/${id}`, formData, {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
};

export const DeleteSpecialities = async (profession_id: React.Key[]) => {
	return await axios.post<ApiResponse<unknown>>(
		`${BASE_URL}profession/delete`,
		{ profession_id: profession_id },
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const GetUserByProfessionId = async (id: Id) => {
	return await axios.get<ApiResponse<ProfessionUser[]>>(BASE_URL + `profession/getUsersByProfessionId/${id}`);
  };
