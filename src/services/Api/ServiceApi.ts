/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse, ListParams, Paged } from "../../types/api";
import type { OtherServiceList, ServiceCategory, ServiceListItem } from "../../types/catalog";

type Id = number | string;

export const CreateSerice = async (formData: FormData) => {
	return await axios.post<ApiResponse<ServiceListItem>>(BASE_URL + "admin/service-list", formData, {
		headers: {
            "Content-Type": "multipart/form-data"
        },
	});
};

export const UpdateService = async (id: Id, formData: FormData) => {
	return await axios.put<ApiResponse<ServiceListItem>>(BASE_URL + `admin/updateServiceList/${id}`, formData, {
		headers: {
            "Content-Type": "multipart/form-data"
        },
	});
};

export const DeleteService = async (service_list_id: React.Key[]) => {
	return await axios.post<ApiResponse<unknown>>(
		`${BASE_URL}admin/deleteServiceList`,
		{ service_list_id: service_list_id },
		{
			headers: {
                "Content-Type": "multipart/form-data"
            },
		}
	);
};

// category apis

//get category
export const GetServiceCategory = async (params: ListParams) => {
	const { page, limit, sortBy } = params;

	try {
		// The API answers data: { count, rows } (confirmed by the backend).
		const res = await axios.get<ApiResponse<Paged<ServiceCategory>>>(BASE_URL + "category", {
			headers: {
                "Content-Type": "application/json"
            },
			params: {
				page: page,
				limit: limit,
				sortBy: sortBy,
			},
		});

		return res.data; // Return just the data part of the response
	} catch (error) {
		console.error("Error fetching service categories:", error);
		throw error;
	}
};

export const GetServiceCategoryById = async (id: Id) => {
	return await axios.get<ApiResponse<ServiceCategory>>(BASE_URL + `category/${id}`);
};

export const CreateServiceCategory = async (formData: FormData) => {
	return await axios.post<ApiResponse<ServiceCategory>>(BASE_URL + "category", formData, {
		headers: {
            "Content-Type": "multipart/form-data"
        },
	});
};

export const UpdateServiceCategory = async (id: Id, formData: FormData) => {
	return await axios.put<ApiResponse<ServiceCategory>>(BASE_URL + `category/${id}`, formData, {
		headers: {
            "Content-Type": "multipart/form-data"
        },
	});
};

export const DeleteServiceCategory = async (category_id: React.Key[]) => {
	return await axios.post<ApiResponse<unknown>>(
		`${BASE_URL}category/delete`,
		{ category_id: category_id },
		{
			headers: {
                "Content-Type": "multipart/form-data"
            },
		}
	);
};

export const GetServiceListByCategoryId = async (category_id: Id) => {
	return await axios.post<ApiResponse<ServiceListItem[]>>(BASE_URL + `service/service-list`, {
		category_id: category_id,
	});
};

export const GetOtherServiceListByCategoryId = async (formData: { category_id: number }) => {
	return await axios.post<ApiResponse<OtherServiceList>>(
		BASE_URL + `service/get-other-service-list`,
		formData
	);
};

/** Adds services in bulk from a CSV, one { title, category_id } per row. */
export const UploadServiceListCsv = async (services: { title: string; category_id: string }[]) => {
	return await axios.post<ApiResponse<unknown>>(BASE_URL + "admin/create-service-list", { services });
};

export const DeleteOtherServiceCategory = async (service_id: React.Key[]) => {
	return await axios.post<ApiResponse<unknown>>(`${BASE_URL}service/deleteServiceByAdmin`, {
		service_id: service_id,
	});
};
