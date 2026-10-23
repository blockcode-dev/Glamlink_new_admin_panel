import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse } from "../../types/api";
import type { Faq } from "../../types/content";

type Id = number | string;

// faq
export const GetFAQ = async () => {
	try {
		const res = await axios.get<ApiResponse<Faq[]>>(BASE_URL + "faq", {
			headers: {
                "Content-Type": "multipart/form-data"
            },
		});
		return res;
	} catch (error) {
		console.error("Error fetching users:", error);
		throw error;
	}
};

export const GetFAQId = async (id: Id) => {
	return await axios.get<ApiResponse<Faq>>(BASE_URL + `faq/${id}`);
};

export const UpdateFAQ = async (id: Id, formData: FormData) => {
	return await axios.put<ApiResponse<Faq>>(BASE_URL + `faq/${id}`, formData, {
		headers: {
            "Content-Type": "multipart/form-data"
        },
	});
};

export const CreateFAQ = async (formData: FormData) => {
	return await axios.post<ApiResponse<Faq>>(BASE_URL + `faq`, formData, {
		headers: {
            "Content-Type": "multipart/form-data"
        },
	});
};

export const DeleteFAQ = async (id: Id) => {
	return axios.delete<ApiResponse<unknown>>(BASE_URL + `faq/${id}`);
};
