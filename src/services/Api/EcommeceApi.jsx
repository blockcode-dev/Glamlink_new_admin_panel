/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";

export const GetProductCategory = async (adminToken, params) => {
	const { page, limit, sortBy } = params;

	try {
		const res = await axios.get(
			BASE_URL + "product/category/getAllProductCategories",
			{
				headers: {
					"x-access-token": adminToken,
					"Content-Type": "application/json",
				},
				params: {
					page: page,
					limit: limit,
					sortBy: sortBy,
				},
			}
		);

		return res.data; // Return just the data part of the response
	} catch (error) {
		console.error("Error fetching service categories:", error);
		throw error;
	}
};

export const GetProductCategoryById = async (id) => {
	return await axios.get(
		BASE_URL + `product/category/findProductCategoryById/${id}`
	);
};

export const GetProductCategoryByCategoryId = async (category_id) => {
	return await axios.post(
		BASE_URL + `product/category/getProductCategoryByCategoryId`,
		{
			category_id: category_id,
		}
	);
};

export const CreateProductCategory = async (formData) => {
	return await axios.post(
		BASE_URL + "product/category/createProductCategoryHeading",
		formData,
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const UpdateProductCategory = async (id, formData) => {
	return await axios.put(
		BASE_URL + `product/category/updateProductCategoryHeading/${id}`,
		formData,
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const DeleteProductCategory = async (category_id) => {
	return await axios.post(
		`${BASE_URL}product/category/delete`,
		{ category_id: category_id },
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

// sub-category

export const CreateCategory = async (formData) => {
	return await axios.post(
		BASE_URL + "product/category/createProductCategory",
		formData,
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const UpdateCategory = async (id, formData) => {
	return await axios.put(
		BASE_URL + `product/category/updateProductCategory/${id}`,
		formData,
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const DeleteCategory = async (category_id) => {
	return await axios.post(
		`${BASE_URL}product/category/deleteProductCategory`,
		{ category_id: category_id },
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const GetProduct = async (adminToken) => {
	try {
		const res = await axios.get(
			BASE_URL + "product/getAllProductsForAdmin",
			{}
		);

		return res.data; // Return just the data part of the response
	} catch (error) {
		console.error("Error fetching service categories:", error);
		throw error;
	}
};

export const GetAllNumeralCategory = async (adminToken) => {
	try {
		const res = await axios.get(
			BASE_URL + "taxCategory/getTaxCategoryName",
			{}
		);

		return res.data; // Return just the data part of the response
	} catch (error) {
		console.error("Error fetching service categories:", error);
		throw error;
	}
};

export const UpdateProduct = async (id, formData) => {
	return await axios.post(
		BASE_URL + `product/updateProductStatus/${id}`,
		formData,
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const DeleteProduct = async (product_id) => {
	return await axios.post(
		`${BASE_URL}product/delete`,
		{ product_id: product_id },
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const GetProductById = async (id) => {
	return await axios.get(BASE_URL + `product/getProductById/${id}`);
};

export const GetReviewsByProductId = async (product_id) => {
	return await axios.post(
		`${BASE_URL}/product/review/getReviewsAndRatingsByProductId`,
		{ product_id },
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const GetAllOrders = async (adminToken, role_id) => {
	try {
		const res = await axios.get(BASE_URL + "order/getAllOrders", {
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

export const GetOrderById = async (id) => {
	return await axios.get(BASE_URL + `order/getOrderById/${id}`);
};
