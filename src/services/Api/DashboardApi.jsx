/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";

export const GetUserCount = async () => {
	const res = await axios.get(BASE_URL + "/admin/dashboard/getUserCount");
	return res;
};

export const GetProfessionalCount = async () => {
	const res = await axios.get(
		BASE_URL + "/admin/dashboard/getProfessionalsCount"
	);
	return res;
};

export const GetPostCount = async () => {
	const res = await axios.get(BASE_URL + "admin/dashboard/getPostsCount");
	return res;
};

export const GetClipsCount = async () => {
	const res = await axios.get(BASE_URL + "admin/dashboard/getClipsCount");
	return res;
};

export const GetAverageLikesPerPostCount = async () => {
	const res = await axios.get(
		BASE_URL + "admin/dashboard/getAverageLikesPerPostCount"
	);
	return res;
};

export const GetAverageLikesPerClipCount = async () => {
	const res = await axios.get(
		BASE_URL + "admin/dashboard/getAverageLikesPerClipCount"
	);
	return res;
};

export const GetAverageCommentPerPostCount = async () => {
	const res = await axios.get(
		BASE_URL + "admin/dashboard/getAverageCommentPerPostCount"
	);
	return res;
};

export const GetAverageCommentPerClipCount = async () => {
	const res = await axios.get(
		BASE_URL + "admin/dashboard/getAverageCommentPerClipCount"
	);
	return res;
};

export const GetAverageFollowersPerUser = async () => {
	const res = await axios.get(
		BASE_URL + "admin/dashboard/getAverageFollowersPerUser"
	);
	return res;
};

export const GetAverageFollowingPerUser = async () => {
	const res = await axios.get(
		BASE_URL + "admin/dashboard/getAverageFollowingPerUser"
	);
	return res;
};

export const GetAverageFollowerPerProfessional = async () => {
	const res = await axios.get(
		BASE_URL + "admin/dashboard/getAverageFollowersPerProfessional"
	);
	return res;
};

export const GetAverageFollowingPerProfessional = async () => {
	const res = await axios.get(
		BASE_URL + "admin/dashboard/getAverageFollowingPerProfessional"
	);
	return res;
};

export const GetAveragePostByUser = async () => {
	const res = await axios.get(
		BASE_URL + "admin/dashboard/getAveragePostByUser"
	);
	return res;
};

export const GetAveragePostByProfessional = async () => {
	const res = await axios.get(
		BASE_URL + "admin/dashboard/getAveragePostByProfessional"
	);
	return res;
};

export const GetAverageServicesByProfessional = async () => {
	const res = await axios.get(
		BASE_URL + "admin/dashboard/getAverageServicesPerProfessional"
	);
	return res;
};

export const GetMostBookedServices = async () => {
	const res = await axios.get(
		BASE_URL + "admin/dashboard/getMostBookedService"
	);
	return res;
};

export const GetMostPostedServices = async () => {
	const res = await axios.get(
		BASE_URL + "admin/dashboard/getMostPostedService"
	);
	return res;
};

export const GetMostBookedProfessionals = async () => {
	const res = await axios.get(
		BASE_URL + "admin/dashboard/getMostBookedProfessional"
	);
	return res;
};

export const GetAverageBookingByProfessional = async () => {
	const res = await axios.get(
		BASE_URL + "admin/dashboard/getAverageBookingsPerProfessional"
	);
	return res;
};

export const GetMostBookedTimeSlots = async () => {
	const res = await axios.get(
		BASE_URL + "admin/dashboard/getMostBookedTimeSlots"
	);
	return res;
};

export const GetUserRegisteredStatistics = async (period) => {
	return await axios.post(
		`${BASE_URL}admin/dashboard/getNewUsersRegistered`,
		{ period },
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const GetCorporateRegisteredStatistics = async (period) => {
	return await axios.post(
		`${BASE_URL}admin/dashboard/getNewProfessionalsRegistered`,
		{ period },
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const GetPostUploadedStatistics = async (period) => {
	return await axios.post(
		`${BASE_URL}admin/dashboard/postUploadedStatistics`,
		{ period },
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const GetClipsUploadedStatistics = async (period) => {
	return await axios.post(
		`${BASE_URL}admin/dashboard/clipsUploadedStatistics`,
		{ period },
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};
