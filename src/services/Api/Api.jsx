/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";

//admin login
export const AdminLogin = async (formdata) => {
	console.log("result", formdata);
	return await axios.post(BASE_URL + "admin/auth/login", formdata);
};

//get all roles

//get role byid

//create role

//update role

//delete role

// ********************************ADMIN API***********************************************************
export const ChangeAdminPassword = async (data) => {
	return axios.post(BASE_URL + "admin/auth/change-password", data, {
		headers: {
			"Content-Type": "multipart/form-data",
			"x-access-token": `${localStorage.getItem("adminToken")}`,
		},
	});
};

export const GetAdmins = async (adminToken, role_id) => {
	try {
		const res = await axios.get(BASE_URL + "admin/list", {
			headers: {
				"x-access-token": `${adminToken}`,
				"Content-Type": "multipart/form-data",
			},
		});

		return res;
	} catch (error) {

		console.error("Error fetching users:", error);
		throw error;
	}
};

export const GetAdminById = async (id) => {
	return await axios.get(BASE_URL + "admin/auth/findAdminById?id=" + id);
};

export const UpdateAdmin = async (formData) => {
	return await axios.put(BASE_URL + "admin/auth/updateAdmin", formData, {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
};

export const DeleteAdmin = async (admin_id, adminToken) => {
	const formData = new FormData();
	formData.append("admin_id", admin_id);
	return axios.delete(BASE_URL + "admin/auth/deleteAdmin", {
		data: formData,
		headers: {
			"Content-Type": "multipart/form-data",
			"x-access-token": adminToken,
		},
	});
};
export const GetAdminProfile = async (adminToken) => {
	return axios.get(BASE_URL + "admin/profile", {
		headers: {
			"Content-Type": "multipart/form-data",
			"x-access-token": adminToken,
		},
	});
};

export const GetPendingFormCount = async (adminToken) => {
	return axios.get(BASE_URL + "form/getPendingFormCount", {
		headers: {
			"Content-Type": "multipart/form-data",
			"x-access-token": adminToken,
		},
	});
};

export const GetPendingProductCount = async (adminToken) => {
	return axios.get(BASE_URL + "product/getPendingProductCount", {
		headers: {
			"Content-Type": "multipart/form-data",
			"x-access-token": adminToken,
		},
	});
};

export const CreateAdmin = async (formData) => {
	return await axios.post(BASE_URL + "admin/auth/register", formData, {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
};

export const GetUserCount = async () => {
	const res = await axios.get(BASE_URL + "/admin/user/getUserCount");
	return res;
};

export const getUserLoginTimings = async () => {
	const res = await axios.get(BASE_URL + "admin/user/login/timings", {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
	return res;
};

export const clearUserLoginTimings = async () => {
	const res = await axios.delete(BASE_URL + "admin/user/login/timings/clear", {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
	return res;
};

