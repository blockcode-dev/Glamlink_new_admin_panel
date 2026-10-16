/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";
import type { AdminToken, ApiResponse } from "../../types/api";
import type { Admin, LoginRecordsByUser, LoginResult } from "../../types/admin";

//admin login
export const AdminLogin = async (formdata: { email: string; password: string }) => {
    return await axios.post<ApiResponse<LoginResult>>(BASE_URL + "admin/auth/login", formdata);
};

// ********************************ADMIN API***********************************************************
export const ChangeAdminPassword = async (data: FormData) => {
	return axios.post<ApiResponse<unknown>>(BASE_URL + "admin/auth/change-password", data, {
		headers: {
			"Content-Type": "multipart/form-data",
			"x-access-token": `${localStorage.getItem("adminToken")}`,
		},
	});
};

export const GetAdmins = async (adminToken: AdminToken) => {
	try {
		const res = await axios.get<ApiResponse<Admin[]>>(BASE_URL + "admin/list", {
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

export const DeleteAdmin = async (admin_id: number, adminToken: AdminToken) => {
	const formData = new FormData();
	formData.append("admin_id", String(admin_id));
	return axios.delete<ApiResponse<unknown>>(BASE_URL + "admin/auth/deleteAdmin", {
		data: formData,
		headers: {
			"Content-Type": "multipart/form-data",
			"x-access-token": adminToken,
		},
	});
};
export const GetAdminProfile = async (adminToken: AdminToken) => {
	return axios.get<ApiResponse<Admin>>(BASE_URL + "admin/profile", {
		headers: {
			"Content-Type": "multipart/form-data",
			"x-access-token": adminToken,
		},
	});
};

export const GetPendingFormCount = async (adminToken: AdminToken) => {
	return axios.get<ApiResponse<string | number>>(BASE_URL + "form/getPendingFormCount", {
		headers: {
			"Content-Type": "multipart/form-data",
			"x-access-token": adminToken,
		},
	});
};

export const GetPendingProductCount = async (adminToken: AdminToken) => {
	return axios.get<ApiResponse<string | number>>(BASE_URL + "product/getPendingProductCount", {
		headers: {
			"Content-Type": "multipart/form-data",
			"x-access-token": adminToken,
		},
	});
};

export const CreateAdmin = async (formData: FormData) => {
	return await axios.post<ApiResponse<Admin>>(BASE_URL + "admin/auth/register", formData, {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
};

export const getUserLoginTimings = async () => {
	const res = await axios.get<ApiResponse<LoginRecordsByUser>>(BASE_URL + "admin/user/login/timings", {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
	return res;
};

export const clearUserLoginTimings = async () => {
	const res = await axios.delete<ApiResponse<unknown>>(BASE_URL + "admin/user/login/timings/clear", {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
	return res;
};

