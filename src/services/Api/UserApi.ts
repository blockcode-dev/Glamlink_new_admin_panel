/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse, ListParams, Paged } from "../../types/api";
import type { State, StateCities } from "../../types/location";
import type { Professional, UserDetail } from "../../types/user";

type Id = number | string;

export const GetProfessionals = async (params: ListParams) => {
	const { page, limit, sortBy } = params;
	try {
		const res = await axios.get<ApiResponse<Paged<Professional>>>(BASE_URL + `admin/users/list/7`, {
			headers: {
                "Content-Type": "multipart/form-data"
            },
			params: {
				page: page,
				limit: limit,
				sortBy: sortBy,
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
export const GetUserById = async (id: Id) => {
	return await axios.get<ApiResponse<UserDetail>>(BASE_URL + `admin/users/getUserById/${id}`);
};

//delete user
export const DeleteUser = async (user_id: React.Key[]) => {
	return axios.post<ApiResponse<unknown>>(
		BASE_URL + "admin/users/delete",
		{
			user_id: user_id,
		},
		{
			headers: {
                "Content-Type": "multipart/form-data"
            },
		}
	);
};

export const getAllState = async () => {
	const res = await axios.get<ApiResponse<State[]>>(BASE_URL + "state");
	return res;
};

export const getAllCityByStateId = async (stateId: Id) => {
	const res = await axios.get<ApiResponse<StateCities>>(BASE_URL + `state/${stateId}`);
	return res;
};

export const CreateFounder = async (user_id: number) => {
	return await axios.post<ApiResponse<unknown>>(
		BASE_URL + "admin/foundersToogle",
		{ user_id },
		{
			headers: {
                "Content-Type": "application/json"
            },
		}
	);
};
