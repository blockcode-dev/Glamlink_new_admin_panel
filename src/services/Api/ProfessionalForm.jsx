/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";

export const UpdateStatus = async (id, formData) => {
	return await axios.post(BASE_URL + `form/updateStatus/${id}`, formData);
};

export const GetUsersWhoSubmittedForm = async () => {
	return await axios.get(BASE_URL + `form/getUsersWhoSubmittedForm`);
};

export const GetAllAnswersByUserId = async (id) => {
	return await axios.get(BASE_URL + `form/getAllAnswersByUserId/${id}`);
};
