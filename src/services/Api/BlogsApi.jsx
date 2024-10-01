/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";

export const GetBlogs = async (adminToken, params) => {
	const { page, limit, sortBy } = params;

	try {
		const res = await axios.get(BASE_URL + "blog", {
			headers: {
				"x-access-token": adminToken,
				"Content-Type": "application/json",
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

export const GetBlogById = async (id) => {
	return await axios.get(BASE_URL + `blog/${id}`);
};

export const UpdateBlog = async (id, formData) => {
	return await axios.put(BASE_URL + `blog/update/${id}`, formData, {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
};

export const DeleteBlog = async (blog_id) => {
	return await axios.post(
		`${BASE_URL}blog/delete`,
		{ blog_id: blog_id },
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const CreateBlog = async (formData) => {
	return await axios.post(BASE_URL + "blog", formData, {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
};

// blog category apis
export const GetBlogCategory = async (adminToken, params) => {
	const { page, limit, sortBy } = params;

	try {
		const res = await axios.get(BASE_URL + "blog-category", {
			headers: {
				"x-access-token": adminToken,
				"Content-Type": "application/json",
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

export const GetBlogCategoryName = async () => {
	try {
		const res = await axios.get(
			BASE_URL + "blog-category/getBlogCategoryName",
			{}
		);

		return res.data; // Return just the data part of the response
	} catch (error) {
		console.error("Error fetching service categories:", error);
		throw error;
	}
};

export const GetBlogCategoryById = async (id) => {
	return await axios.get(BASE_URL + `blog-category/${id}`);
};

export const UpdateBlogCategory = async (id, formData) => {
	return await axios.put(BASE_URL + `blog-category/${id}`, formData, {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
};

export const DeleteBlogCategory = async (blog_id) => {
	return await axios.post(
		`${BASE_URL}blog-category/delete`,
		{ blog_id: blog_id },
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const AddBlogCategroy = async ({ title }) => {
	const formData = new FormData();

	formData.append("title", title);

	return await axios.post(BASE_URL + "blog-category", formData, {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
};
