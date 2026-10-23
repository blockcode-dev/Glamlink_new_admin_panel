/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse, ListParams, Paged } from "../../types/api";
import type { State, StateCities } from "../../types/location";
import type {
	AvailabilitySlot,
	Booking,
	Follow,
	Followee,
	PayoutSummary,
	Professional,
	ProfessionalService,
	Promotion,
	PromotionRequest,
	PromotionTarget,
	ReferredUser,
	Review,
	RewardRule,
	User,
	UserDetail,
} from "../../types/user";
import type { UserClipComment, UserClipLike, UserPostComment, UserPostLike } from "../../types/social";

type Id = number | string;

//get all user
export const GetUsers = async (params: ListParams) => {
	try {
		const { page, limit, sortBy } = params;
		const res = await axios.get<ApiResponse<Paged<User>>>(BASE_URL + `admin/users/list/6`, {
			headers: {
                "Content-Type": "multipart/form-data"
            },
			params: {
				page: page,
				limit: limit,
				sortBy: sortBy,
			},
		});

		return res;
	} catch (error) {
		// Handle error if needed
		console.error("Error fetching users:", error);
		throw error;
	}
};

export const GetProfessionals = async (params: ListParams) => {
	const { page, limit, sortBy } = params;
	try {
		const res = await axios.get<ApiResponse<Paged<Professional>>>(BASE_URL + `admin/users/list/7`, {
			headers: {
                "Content-Type": "multipart/form-data"
            },
			params: {
				page: page,
				limit: limit,
				sortBy: sortBy,
			},
		});

		return res;
	} catch (error) {
		// Handle error if needed
		console.error("Error fetching users:", error);
		throw error;
	}
};

//get userby id
export const GetUserById = async (id: Id) => {
	return await axios.get<ApiResponse<UserDetail>>(BASE_URL + `admin/users/getUserById/${id}`);
};

export const GetProfessionalPayoutSummary = async (id: Id) => {
	return await axios.get<ApiResponse<PayoutSummary[]> & { success: boolean }>(
		BASE_URL + `stripe/getProfessionalPayoutSummary/${id}`
	);
};

export const ProfessialPayout = async (formData: FormData) => {
	return await axios.post<ApiResponse<unknown>>(BASE_URL + "stripe/payout/professional", formData, {
		headers: {
            "Content-Type": "multipart/form-data"
        },
	});
};

//delete user
export const DeleteUser = async (user_id: React.Key[]) => {
	return axios.post<ApiResponse<unknown>>(
		BASE_URL + "admin/users/delete",
		{
			user_id: user_id,
		},
		{
			headers: {
                "Content-Type": "multipart/form-data"
            },
		}
	);
};

export const getAllState = async () => {
	const res = await axios.get<ApiResponse<State[]>>(BASE_URL + "state");
	return res;
};

export const getAllCityByStateId = async (stateId: Id) => {
	const res = await axios.get<ApiResponse<StateCities>>(BASE_URL + `state/${stateId}`);
	return res;
};

export const GetFollowersByUserId = async (user_id: Id) => {
	return await axios.post<ApiResponse<Follow[]>>(BASE_URL + `admin/getFollowersByUserId`, {
		user_id: user_id,
	});
};

export const GetFollowingByUserId = async (user_id: Id) => {
	return await axios.post<ApiResponse<Followee[]>>(BASE_URL + `admin/getFollowByUserId`, {
		user_id: user_id,
	});
};

export const GetPostLikedByUserId = async (user_id: Id) => {
	return await axios.post<ApiResponse<UserPostLike[]>>(BASE_URL + `admin/getPostLikeByUserId`, {
		user_id: user_id,
	});
};

export const GetPostCommentedByUserId = async (user_id: Id) => {
	return await axios.post<ApiResponse<UserPostComment[]>>(BASE_URL + `admin/getPostCommentByUserId`, {
		user_id: user_id,
	});
};

export const GetClipsLikedByUserId = async (user_id: Id) => {
	return await axios.post<ApiResponse<UserClipLike[]>>(BASE_URL + `admin/getClipsLikeByUserId`, {
		user_id: user_id,
	});
};

export const GetClipsCommentedByUserId = async (user_id: Id) => {
	return await axios.post<ApiResponse<UserClipComment[]>>(BASE_URL + `admin/getClipsCommentByUserId`, {
		user_id: user_id,
	});
};
export const GetReviewsGivenByUserId = async (user_id: Id) => {
	return await axios.post<ApiResponse<Review[]>>(BASE_URL + `admin/getReviewsGivenByUserId`, {
		user_id: user_id,
	});
};

export const GetReviewsTakenByUserId = async (professional_id: Id) => {
	return await axios.post<ApiResponse<Review[]>>(BASE_URL + `admin/getReviewsTakenByUserId`, {
		professional_id,
	});
};

export const GetServiceByUserId = async (user_id: Id) => {
	return await axios.post<ApiResponse<ProfessionalService[]>>(BASE_URL + `admin/getServicesByUserId`, {
		user_id: user_id,
	});
};

export const GetAvailabilityByUserId = async (professional_id: Id) => {
	return await axios.post<ApiResponse<AvailabilitySlot[]>>(BASE_URL + `admin/getAvailablityByUserId`, {
		professional_id,
	});
};

export const GetBookingsByUserId = async (status: string, user_id: Id) => {
	let config = {
		status: status,
		user_id: user_id,
	};
	try {
		const res = await axios.post<ApiResponse<Booking[]>>(
			BASE_URL + "admin/getBookingsByUserId",
			config
		);

		return res;
	} catch (error) {
		console.error("Error fetching users:", error);
		throw error;
	}
};

export const GetBookingsByProfessionalId = async (status: string, user_id: Id) => {
	let config = {
		status: status,
		user_id: user_id,
	};
	try {
		const res = await axios.post<ApiResponse<Booking[]>>(
			BASE_URL + "admin/getBookingsByProfessionalId",
			config
		);

		return res;
	} catch (error) {
		console.error("Error fetching users:", error);
		throw error;
	}
};

export const PromoteUserAPI = async (formData: PromotionRequest) => {
	return await axios.post<ApiResponse<unknown>>(BASE_URL + `admin/user/promoted`, formData, {
		headers: {
            "Content-Type": "application/json"
        },
	});
};

export const UnpromoteUserAPI = async (formData: PromotionRequest) => {
	return await axios.post<ApiResponse<unknown>>(BASE_URL + `admin/user/unpromoted`, formData);
};

export const UnpromoteAllAPI = async (formData: PromotionRequest) => {
	return await axios.post<ApiResponse<unknown>>(BASE_URL + `admin/user/unpromotedAll`, formData);
};

export const GetUserPromotions = async (id: Id) => {
	return await axios.get<ApiResponse<Promotion[]>>(BASE_URL + `admin/user/getUserPromotions/${id}`);
};

export const GetAllProfessional = () => {
	return axios.get<ApiResponse<PromotionTarget[]>>(BASE_URL + `promotion/getAllProfessionsByProfessional`);
};

export const GetAllkeywords = () => {
	return axios.get<ApiResponse<PromotionTarget[]>>(BASE_URL + `promotion/getAllKeywords`);
};

export const CreateFounder = async (user_id: number) => {
	return await axios.post<ApiResponse<unknown>>(
		BASE_URL + "admin/foundersToogle",
		{ user_id },
		{
			headers: {
                "Content-Type": "application/json"
            },
		}
	);
};


export const GetAllReferralByProfessionalId = async (id: Id) => {
	return await axios.get<ApiResponse<{ users?: User[] }>>(BASE_URL + `admin/getAllReferralByProfessionalId/${id}`);
};

export const GetAllReferral = async () => {
	return await axios.get<ApiResponse<ReferredUser[]>>(BASE_URL + `admin/getAllReferral`);
};

export const GetAllRewardRules = async () => {
	return await axios.get<ApiResponse<RewardRule[]>>(BASE_URL + `admin/getAllGlamCoinRules`);
};

export const UpdateGlamCoinRules = async (formData: Pick<RewardRule, "title" | "coins">, id: number) => {
	return await axios.put<ApiResponse<RewardRule>>(BASE_URL + `admin/editGlamCoinRules/${id}`, formData, {
		headers: {
            "Content-Type": "multipart/form-data"
        },
	});
};
