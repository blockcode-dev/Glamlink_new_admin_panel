/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse, CountedList, ListParams } from "../../types/api";
import type { Clip, Post, PostComment, PostLike } from "../../types/social";

type Id = number | string;

export const GetAllPosts = async (params: ListParams) => {
	const { page, limit, sortBy } = params;

	try {
		const res = await axios.get<CountedList<Post>>(BASE_URL + "admin/posts", {
			headers: {
                timezone: "Asia/Kolkata",
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

export const DeletePost = async (post_id: React.Key[]) => {
	return await axios.post<ApiResponse<unknown>>(
		`${BASE_URL}admin/posts/delete`,
		{ post_id: post_id },
		{
			headers: {
                "Content-Type": "multipart/form-data"
            },
		}
	);
};

export const GetLikesByPostId = async (post_id: Id) => {
	return await axios.post<ApiResponse<PostLike[]>>(BASE_URL + `admin/posts/getLikesByPostId`, {
		post_id: post_id,
	});
};

export const GetCommentsByPostId = async (post_id: Id) => {
	return await axios.post<ApiResponse<PostComment[]>>(BASE_URL + `admin/posts/getCommentsByPostId`, {
		post_id: post_id,
	});
};

export const GetPostByUserId = async (user_id: Id) => {
	return await axios.post<ApiResponse<Post[]>>(BASE_URL + `admin/getPostByUserId`, {
		user_id: user_id,
	});
};

export const GetClipsByUserId = async (user_id: Id) => {
	return await axios.post<ApiResponse<Clip[]>>(BASE_URL + `admin/getClipsByUserId`, {
		user_id: user_id,
	});
};
