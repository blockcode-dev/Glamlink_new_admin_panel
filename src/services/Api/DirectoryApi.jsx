/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";

// journal category api
export const GetAllDirectory = async () => {
    const res = await axios.get(BASE_URL + "businessCard/getAllDirectories/");
    return res.data;
};

export const GetDirectoryById = async (id) => {
    return await axios.get(BASE_URL + `businessCard/directory/${id}`);
};

export const UpdateDirectory = async (id, formData) => {
    return await axios.put(BASE_URL + `businessCard/updateDirectory/${id}`, formData);
};

export const DeleteDirectory = async (category_id) => {
    return await axios.post(`${BASE_URL}businessCard/deleteDirectory`, {
        category_id: category_id,
    });
};

export const AddDirectory = async (formData) => {
    return await axios.post(BASE_URL + "businessCard/createDirectory", formData, {});
};

export const GetAllCategories = async () => {
    const res = await axios.get(BASE_URL + "businessCard/getAllCategories/");
    return res.data;
};

