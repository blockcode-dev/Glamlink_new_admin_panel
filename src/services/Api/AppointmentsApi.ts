/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";
import type { AdminToken, ApiResponse, ListParams, Paged } from "../../types/api";
import type { Appointment } from "../../types/user";

export const GetAllAppointments = async (adminToken: AdminToken, params: ListParams) => {
	const { page, limit, sortBy } = params;
	try {
		// Rows come in data.rows; the page reads the total from a top-level count.
		const res = await axios.get<ApiResponse<Paged<Appointment>> & { count?: number }>(BASE_URL + "admin/home/appointments/all", {
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
