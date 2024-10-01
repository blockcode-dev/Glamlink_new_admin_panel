/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";

export const GetAllClips = async (adminToken, params) => {
	const { page, limit, sortBy } = params;

	try {
		const res = await axios.get(BASE_URL + "admin/reels", {
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

export const DeleteClip = async (reel_id) => {
	return await axios.post(
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

export const GetLikesByClipId = async (reel_id) => {
	return await axios.post(BASE_URL + `admin/reels/getLikessByReelId`, {
		reel_id: reel_id,
	});
};

export const GetCommentsByClipId = async (reel_id) => {
	return await axios.post(BASE_URL + `admin/reels/getCommentsByReelId`, {
		reel_id: reel_id,
	});
};


