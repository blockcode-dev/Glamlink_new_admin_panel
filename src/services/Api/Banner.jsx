import axios from "axios";
import { BASE_URL } from "../Host";

export const GetAllBanner = (adminToken, formdata) => {
	return axios.get(BASE_URL + `banner/getAllBanner`, {
		headers: {
			"x-access-token": `${adminToken}`,
			"Content-Type": "multipart/form-data",
		},
	});
};