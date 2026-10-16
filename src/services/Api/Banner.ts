import axios from "axios";
import { BASE_URL } from "../Host";
import type { AdminToken, ApiResponse } from "../../types/api";
import type { Banner } from "../../types/content";

export const GetAllBanner = (adminToken: AdminToken) => {
	return axios.get<ApiResponse<Banner[]>>(BASE_URL + `banner/getAllBanner`, {
		headers: {
			"x-access-token": `${adminToken}`,
			"Content-Type": "multipart/form-data",
		},
	});
};
