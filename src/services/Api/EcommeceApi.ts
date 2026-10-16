/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";
import type { AdminToken, ApiResponse, ListParams, Paged } from "../../types/api";
import type { Order, Product, ProductCategory, ProductReview, ProductSubCategory, TaxCategory } from "../../types/ecommerce";

type Id = number | string;

export const GetProductCategory = async (adminToken: AdminToken, params: ListParams) => {
	const { page, limit, sortBy } = params;

	try {
		const res = await axios.get<ApiResponse<Paged<ProductCategory>>>(
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

export const GetProductCategoryById = async (id: Id) => {
	return await axios.get<ApiResponse<ProductCategory>>(
		BASE_URL + `product/category/findProductCategoryById/${id}`
	);
};

export const GetProductCategoryByCategoryId = async (category_id: Id) => {
	return await axios.post<ApiResponse<ProductSubCategory[]>>(
		BASE_URL + `product/category/getProductCategoryByCategoryId`,
		{
			category_id: category_id,
		}
	);
};

export const CreateProductCategory = async (formData: { title: string }) => {
	return await axios.post<ApiResponse<ProductCategory>>(
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

export const UpdateProductCategory = async (id: Id, formData: FormData) => {
	return await axios.put<ApiResponse<ProductCategory>>(
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

export const DeleteProductCategory = async (category_id: React.Key[]) => {
	return await axios.post<ApiResponse<unknown>>(
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

export const CreateCategory = async (formData: FormData) => {
	return await axios.post<ApiResponse<ProductSubCategory>>(
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

export const UpdateCategory = async (id: Id, formData: FormData) => {
	return await axios.put<ApiResponse<ProductSubCategory>>(
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

export const DeleteCategory = async (category_id: React.Key[]) => {
	return await axios.post<ApiResponse<unknown>>(
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

export const GetProduct = async (adminToken: AdminToken) => {
	try {
		const res = await axios.get<ApiResponse<Product[]>>(
			BASE_URL + "product/getAllProductsForAdmin",
			{}
		);

		return res.data; // Return just the data part of the response
	} catch (error) {
		console.error("Error fetching service categories:", error);
		throw error;
	}
};

export const GetAllNumeralCategory = async () => {
	try {
		const res = await axios.get<ApiResponse<TaxCategory[]>>(
			BASE_URL + "taxCategory/getTaxCategoryName",
			{}
		);

		return res.data; // Return just the data part of the response
	} catch (error) {
		console.error("Error fetching service categories:", error);
		throw error;
	}
};

export const UpdateProduct = async (id: Id, formData: { status: string; numeral_tax_category: string }) => {
	return await axios.post<ApiResponse<Product>>(
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

export const DeleteProduct = async (product_id: React.Key[]) => {
	return await axios.post<ApiResponse<unknown>>(
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

export const GetProductById = async (id: Id) => {
	return await axios.get<ApiResponse<Product>>(BASE_URL + `product/getProductById/${id}`);
};

export const GetReviewsByProductId = async (product_id: Id) => {
	return await axios.post<ApiResponse<ProductReview[]>>(
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

export const GetAllOrders = async (adminToken: AdminToken) => {
	try {
		const res = await axios.get<ApiResponse<Order[]>>(BASE_URL + "order/getAllOrders", {
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

export const GetOrderById = async (id: Id) => {
	return await axios.get<ApiResponse<Order>>(BASE_URL + `order/getOrderById/${id}`);
};
