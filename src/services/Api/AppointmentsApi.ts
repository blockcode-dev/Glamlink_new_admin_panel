/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse, ListParams, Paged } from "../../types/api";
import type { Appointment } from "../../types/user";

export const GetAllAppointments = async (params: ListParams) => {
	const { page, limit, sortBy } = params;
	try {
		// The API answers data: { count, rows } (confirmed by the backend).
		const res = await axios.get<ApiResponse<Paged<Appointment>>>(BASE_URL + "admin/home/appointments/all", {
			headers: {
                "timezone":"Asia/Kolkata",
                "Content-Type": "application/json"
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
