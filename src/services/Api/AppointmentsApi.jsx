/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";

export const GetAllAppointments = async (adminToken, params) => {
	const { page, limit, sortBy } = params;

	try {
		const res = await axios.get(BASE_URL + "admin/home/appointments/all", {
			headers: {
				"x-access-token": adminToken,
				"timezone":"Asia/Kolkata",
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

export const GetSpecialitiesById = async (id) => {
	return await axios.get(BASE_URL + `profession/${id}`);
};

export const CreateSpecialities = async (formData) => {
	return await axios.post(BASE_URL + "profession", formData, {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
};

export const UpdateSpecialities = async (id, formData) => {
	return await axios.put(BASE_URL + `profession/${id}`, formData, {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
};

export const DeleteSpecialities = async (profession_id) => {
	return await axios.post(
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

