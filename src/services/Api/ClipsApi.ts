/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";
import type { AdminToken, ApiResponse, CountedList, ListParams } from "../../types/api";
import type { Clip, ClipComment, ClipLike } from "../../types/social";

type Id = number | string;

export const GetAllClips = async (adminToken: AdminToken, params: ListParams) => {
	const { page, limit, sortBy } = params;

	try {
		const res = await axios.get<CountedList<Clip>>(BASE_URL + "admin/reels", {
			headers: {
				"x-access-token": adminToken,
				"Content-Type": "application/json",
				timezone: "Asia/Kolkata",
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

export const DeleteClip = async (reel_id: React.Key[]) => {
	return await axios.post<ApiResponse<unknown>>(
		`${BASE_URL}admin/reels/delete`,
		{ reel_id: reel_id },
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const GetLikesByClipId = async (reel_id: Id) => {
	return await axios.post<ApiResponse<ClipLike[]>>(BASE_URL + `admin/reels/getLikessByReelId`, {
		reel_id: reel_id,
	});
};

export const GetCommentsByClipId = async (reel_id: Id) => {
	return await axios.post<ApiResponse<ClipComment[]>>(BASE_URL + `admin/reels/getCommentsByReelId`, {
		reel_id: reel_id,
	});
};
