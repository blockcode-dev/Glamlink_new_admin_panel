import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse } from "../../types/api";
import type { Banner } from "../../types/content";

export const GetAllBanner = () => {
	return axios.get<ApiResponse<Banner[]>>(BASE_URL + `banner/getAllBanner`, {
		headers: {
            "Content-Type": "multipart/form-data"
        },
	});
};
