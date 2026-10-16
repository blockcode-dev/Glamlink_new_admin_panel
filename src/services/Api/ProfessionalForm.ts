/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse } from "../../types/api";
import type { FormAnswer, FormSubmission } from "../../types/content";

type Id = number | string;

export const UpdateStatus = async (id: Id, formData: { status: string }) => {
	return await axios.post<ApiResponse<unknown>>(BASE_URL + `form/updateStatus/${id}`, formData);
};

export const GetUsersWhoSubmittedForm = async () => {
	return await axios.get<ApiResponse<FormSubmission[]>>(BASE_URL + `form/getUsersWhoSubmittedForm`);
};

export const GetAllAnswersByUserId = async (id: Id) => {
	return await axios.get<ApiResponse<FormAnswer[]>>(BASE_URL + `form/getAllAnswersByUserId/${id}`);
};

export const DeleteFormByUserId = async (id: Id) => {
	return await axios.post<ApiResponse<unknown>>(BASE_URL + `form/deleteForm/${id}`);
};
