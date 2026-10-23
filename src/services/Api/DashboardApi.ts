/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse } from "../../types/api";
import type {
	BookedProfessional,
	BookedTimeSlot,
	MostBookedService,
	MostPostedService,
	RegistrationPeriod,
	UploadPeriod,
} from "../../types/dashboard";

export const GetUserCount = async () => {
	const res = await axios.get<ApiResponse<number>>(BASE_URL + "admin/dashboard/getUserCount");
	return res;
};

export const GetProfessionalCount = async () => {
	const res = await axios.get<ApiResponse<number>>(
		BASE_URL + "admin/dashboard/getProfessionalsCount"
	);
	return res;
};

export const GetPostCount = async () => {
	const res = await axios.get<ApiResponse<number>>(BASE_URL + "admin/dashboard/getPostsCount");
	return res;
};

export const GetClipsCount = async () => {
	const res = await axios.get<ApiResponse<number>>(BASE_URL + "admin/dashboard/getClipsCount");
	return res;
};

export const GetAverageLikesPerPostCount = async () => {
	const res = await axios.get<ApiResponse<number>>(
		BASE_URL + "admin/dashboard/getAverageLikesPerPostCount"
	);
	return res;
};

export const GetAverageLikesPerClipCount = async () => {
	const res = await axios.get<ApiResponse<number>>(
		BASE_URL + "admin/dashboard/getAverageLikesPerClipCount"
	);
	return res;
};

export const GetAverageCommentPerPostCount = async () => {
	const res = await axios.get<ApiResponse<number>>(
		BASE_URL + "admin/dashboard/getAverageCommentPerPostCount"
	);
	return res;
};

export const GetAverageCommentPerClipCount = async () => {
	const res = await axios.get<ApiResponse<number>>(
		BASE_URL + "admin/dashboard/getAverageCommentPerClipCount"
	);
	return res;
};

export const GetAverageFollowersPerUser = async () => {
	const res = await axios.get<ApiResponse<number>>(
		BASE_URL + "admin/dashboard/getAverageFollowersPerUser"
	);
	return res;
};

export const GetAverageFollowingPerUser = async () => {
	const res = await axios.get<ApiResponse<number>>(
		BASE_URL + "admin/dashboard/getAverageFollowingPerUser"
	);
	return res;
};

export const GetAverageFollowerPerProfessional = async () => {
	const res = await axios.get<ApiResponse<number>>(
		BASE_URL + "admin/dashboard/getAverageFollowersPerProfessional"
	);
	return res;
};

export const GetAverageFollowingPerProfessional = async () => {
	const res = await axios.get<ApiResponse<number>>(
		BASE_URL + "admin/dashboard/getAverageFollowingPerProfessional"
	);
	return res;
};

export const GetAveragePostByUser = async () => {
	const res = await axios.get<ApiResponse<number>>(
		BASE_URL + "admin/dashboard/getAveragePostByUser"
	);
	return res;
};

export const GetAveragePostByProfessional = async () => {
	const res = await axios.get<ApiResponse<number>>(
		BASE_URL + "admin/dashboard/getAveragePostByProfessional"
	);
	return res;
};

export const GetAverageServicesByProfessional = async () => {
	const res = await axios.get<ApiResponse<number>>(
		BASE_URL + "admin/dashboard/getAverageServicesPerProfessional"
	);
	return res;
};

export const GetMostBookedServices = async () => {
	const res = await axios.get<ApiResponse<MostBookedService>>(
		BASE_URL + "admin/dashboard/getMostBookedService"
	);
	return res;
};

export const GetMostPostedServices = async () => {
	const res = await axios.get<ApiResponse<MostPostedService>>(
		BASE_URL + "admin/dashboard/getMostPostedService"
	);
	return res;
};

export const GetMostBookedProfessionals = async () => {
	const res = await axios.get<ApiResponse<BookedProfessional[]>>(
		BASE_URL + "admin/dashboard/getMostBookedProfessional"
	);
	return res;
};

export const GetAverageBookingByProfessional = async () => {
	const res = await axios.get<ApiResponse<number>>(
		BASE_URL + "admin/dashboard/getAverageBookingsPerProfessional"
	);
	return res;
};

export const GetMostBookedTimeSlots = async () => {
	const res = await axios.get<ApiResponse<BookedTimeSlot[]>>(
		BASE_URL + "admin/dashboard/getMostBookedTimeSlots"
	);
	return res;
};

export const GetUserRegisteredStatistics = async (period: RegistrationPeriod) => {
	return await axios.post<ApiResponse<number>>(
		`${BASE_URL}admin/dashboard/getNewUsersRegistered`,
		{ period },
		{
			headers: {
                "Content-Type": "multipart/form-data"
            },
		}
	);
};

export const GetCorporateRegisteredStatistics = async (period: RegistrationPeriod) => {
	return await axios.post<ApiResponse<number>>(
		`${BASE_URL}admin/dashboard/getNewProfessionalsRegistered`,
		{ period },
		{
			headers: {
                "Content-Type": "multipart/form-data"
            },
		}
	);
};

export const GetPostUploadedStatistics = async (period: UploadPeriod) => {
	return await axios.post<ApiResponse<number>>(
		`${BASE_URL}admin/dashboard/postUploadedStatistics`,
		{ period },
		{
			headers: {
                "Content-Type": "multipart/form-data"
            },
		}
	);
};

export const GetClipsUploadedStatistics = async (period: UploadPeriod) => {
	return await axios.post<ApiResponse<number>>(
		`${BASE_URL}admin/dashboard/clipsUploadedStatistics`,
		{ period },
		{
			headers: {
                "Content-Type": "multipart/form-data"
            },
		}
	);
};
