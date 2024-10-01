/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";

//get all user
export const GetUsers = async (adminToken, roleId) => {
	try {
		const res = await axios.get(BASE_URL + `admin/users/list/6`, {
			headers: {
				"x-access-token": `${adminToken}`,
				"Content-Type": "multipart/form-data",
			},
		});

		return res;
	} catch (error) {
		// Handle error if needed
		console.error("Error fetching users:", error);
		throw error;
	}
};

export const GetProfessionals = async (adminToken, roleId) => {
	try {
		const res = await axios.get(BASE_URL + `admin/users/list/7`, {
			headers: {
				"x-access-token": `${adminToken}`,
				"Content-Type": "multipart/form-data",
			},
		});

		return res;
	} catch (error) {
		// Handle error if needed
		console.error("Error fetching users:", error);
		throw error;
	}
};

//get userby id
export const GetUserById = async (id) => {
	return await axios.get(BASE_URL + `admin/users/getUserById/${id}`);
};

//admin add user
export const AddUser = async ({
	email,
	name,
	password,
	confirm_password,
	city_id,
	state_id,
	role_id,
}) => {
	const formData = new FormData();

	formData.append("email", email);
	formData.append("name", name);
	formData.append("password", password);
	formData.append("confirm_password", confirm_password);
	formData.append("city_id", city_id);
	formData.append("state_id", state_id);
	formData.append("6", role_id);

	return await axios.post(BASE_URL + "admin/user/create", formData, {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
};

//delete user
export const DeleteUser = async (user_id, adminToken) => {
	const formData = new FormData();
	formData.append("user_id", user_id);
	return axios.delete(BASE_URL + "admin/user/delete", {
		data: formData,
	});
};

export const getAllState = async () => {
	const res = await axios.get(BASE_URL + "state", { limit: 50 });
	return res;
};

export const getAllCityByStateId = async (stateId) => {
	const res = await axios.get(BASE_URL + `state/${stateId}`);
	return res;
};
