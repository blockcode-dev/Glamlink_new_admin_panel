/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse } from "../../types/api";
import type { Admin, LoginRecordsByUser, LoginResult } from "../../types/admin";

//admin login
export const AdminLogin = async (formdata: { email: string; password: string }) => {
    return await axios.post<ApiResponse<LoginResult>>(BASE_URL + "admin/auth/login", formdata);
};

/** Ends this admin's sessions on the server, on every device. */
export const AdminLogout = async () => {
	return axios.post<ApiResponse<"">>(BASE_URL + "admin/auth/logout");
};

// ********************************ADMIN API***********************************************************
export const ChangeAdminPassword = async (data: FormData) => {
	return axios.post<ApiResponse<unknown>>(BASE_URL + "admin/auth/change-password", data, {
		headers: {
            "Content-Type": "multipart/form-data"
        },
	});
};

export const GetAdmins = async () => {
	try {
		const res = await axios.get<ApiResponse<Admin[]>>(BASE_URL + "admin/list", {
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

export const DeleteAdmin = async (admin_id: number) => {
	return axios.delete<ApiResponse<unknown>>(BASE_URL + "admin/deleteAdmin", { data: { admin_id } });
};
export const GetAdminProfile = async () => {
	return axios.get<ApiResponse<Admin>>(BASE_URL + "admin/profile", {
		headers: {
            "Content-Type": "multipart/form-data"
        },
	});
};

export const GetPendingFormCount = async () => {
	return axios.get<ApiResponse<string | number>>(BASE_URL + "form/getPendingFormCount", {
		headers: {
            "Content-Type": "multipart/form-data"
        },
	});
};

export const CreateAdmin = async (formData: FormData) => {
	return await axios.post<ApiResponse<Admin>>(BASE_URL + "admin/auth/register", formData, {
		headers: {
            "Content-Type": "multipart/form-data"
        },
	});
};

export const getUserLoginTimings = async () => {
	const res = await axios.get<ApiResponse<LoginRecordsByUser>>(BASE_URL + "admin/user/login/timings", {
		headers: {
            "Content-Type": "multipart/form-data"
        },
	});
	return res;
};

export const clearUserLoginTimings = async () => {
	const res = await axios.delete<ApiResponse<unknown>>(BASE_URL + "admin/user/login/timings/clear", {
		headers: {
            "Content-Type": "multipart/form-data"
        },
	});
	return res;
};

