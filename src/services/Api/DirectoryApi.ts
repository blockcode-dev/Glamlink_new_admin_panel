/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse, Paged } from "../../types/api";
import type { DirectoryCategory, DirectoryEntry } from "../../types/directory";

// journal category api
export const GetAllDirectory = async () => {
    const res = await axios.get<ApiResponse<Paged<DirectoryEntry>>>(BASE_URL + "businessCard/getAllDirectories/");
    return res.data;
};

export const UpdateDirectory = async (id: number, formData: FormData) => {
    return await axios.put<ApiResponse<DirectoryEntry>>(BASE_URL + `businessCard/updateDirectory/${id}`, formData);
};

export const DeleteDirectory = async (category_id: React.Key[]) => {
    return await axios.post<ApiResponse<unknown>>(`${BASE_URL}businessCard/deleteDirectory`, {
        category_id: category_id,
    });
};

export const AddDirectory = async (formData: FormData) => {
    return await axios.post<ApiResponse<DirectoryEntry>>(BASE_URL + "businessCard/createDirectory", formData, {});
};

export const GetAllCategories = async () => {
    const res = await axios.get<ApiResponse<Paged<DirectoryCategory>>>(BASE_URL + "businessCard/getAllCategories/");
    return res.data;
};
