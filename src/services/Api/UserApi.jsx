/** @format */

import axios from "axios";
import { BASE_URL } from "../Host";

//get all user
export const GetUsers = async (adminToken, params) => {
	try {
		const { page, limit, sortBy } = params;
		const res = await axios.get(BASE_URL + `admin/users/list/6`, {
			headers: {
				"x-access-token": `${adminToken}`,
				"Content-Type": "multipart/form-data",
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

export const GetProfessionals = async (adminToken, params) => {
	const { page, limit, sortBy } = params;
	try {
		const res = await axios.get(BASE_URL + `admin/users/list/7`, {
			headers: {
				"x-access-token": `${adminToken}`,
				"Content-Type": "multipart/form-data",
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
export const GetUserById = async (id) => {
	return await axios.get(BASE_URL + `admin/users/getUserById/${id}`);
};

export const GetProfessionalPayoutSummary = async (id) => {
	return await axios.get(BASE_URL + `stripe/getProfessionalPayoutSummary/${id}`);
};

export const ProfessialPayout = async (formData) => {
	return await axios.post(BASE_URL + "stripe/payout/professional", formData, {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
};

//admin add user
export const AddUser = async ({
	email,
	name,
	password,
	confirm_password,
	city_id,
	state_id,
	role_id,
}) => {
	const formData = new FormData();

	formData.append("email", email);
	formData.append("name", name);
	formData.append("password", password);
	formData.append("confirm_password", confirm_password);
	formData.append("city_id", city_id);
	formData.append("state_id", state_id);
	formData.append("6", role_id);

	return await axios.post(BASE_URL + "admin/user/create", formData, {
		headers: {
			"x-access-token": `${localStorage.getItem("adminToken")}`,
			"Content-Type": "multipart/form-data",
		},
	});
};

//delete user
export const DeleteUser = async (user_id) => {
	return axios.post(
		BASE_URL + "admin/users/delete",
		{
			user_id: user_id,
		},
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const getAllState = async () => {
	const res = await axios.get(BASE_URL + "state", { limit: 50 });
	return res;
};

export const getAllCityByStateId = async (stateId) => {
	const res = await axios.get(BASE_URL + `state/${stateId}`);
	return res;
};

export const GetFollowersByUserId = async (user_id) => {
	return await axios.post(BASE_URL + `admin/getFollowersByUserId`, {
		user_id: user_id,
	});
};

export const GetFollowingByUserId = async (user_id) => {
	return await axios.post(BASE_URL + `admin/getFollowByUserId`, {
		user_id: user_id,
	});
};

export const GetPostLikedByUserId = async (user_id) => {
	return await axios.post(BASE_URL + `admin/getPostLikeByUserId`, {
		user_id: user_id,
	});
};

export const GetPostCommentedByUserId = async (user_id) => {
	return await axios.post(BASE_URL + `admin/getPostCommentByUserId`, {
		user_id: user_id,
	});
};

export const GetClipsLikedByUserId = async (user_id) => {
	return await axios.post(BASE_URL + `admin/getClipsLikeByUserId`, {
		user_id: user_id,
	});
};

export const GetClipsCommentedByUserId = async (user_id) => {
	return await axios.post(BASE_URL + `admin/getClipsCommentByUserId`, {
		user_id: user_id,
	});
};
export const GetReviewsGivenByUserId = async (user_id) => {
	return await axios.post(BASE_URL + `admin/getReviewsGivenByUserId`, {
		user_id: user_id,
	});
};

export const GetReviewsTakenByUserId = async (counselor_id) => {
	return await axios.post(BASE_URL + `admin/getReviewsTakenByUserId`, {
		counselor_id: counselor_id,
	});
};

export const GetServiceByUserId = async (user_id) => {
	return await axios.post(BASE_URL + `admin/getServicesByUserId`, {
		user_id: user_id,
	});
};

export const GetAvailabilityByUserId = async (counselor_id) => {
	return await axios.post(BASE_URL + `admin/getAvailablityByUserId`, {
		counselor_id: counselor_id,
	});
};

export const GetBookingsByUserId = async (status, user_id) => {
	let config = {
		status: status,
		user_id: user_id,
	};
	try {
		const res = await axios.post(
			BASE_URL + "admin/getBookingsByUserId",
			config
		);

		return res;
	} catch (error) {
		console.error("Error fetching users:", error);
		throw error;
	}
};

export const GetBookingsByCounsellorId = async (status, user_id) => {
	let config = {
		status: status,
		user_id: user_id,
	};
	try {
		const res = await axios.post(
			BASE_URL + "admin/getBookingsByCounsellorId",
			config
		);

		return res;
	} catch (error) {
		console.error("Error fetching users:", error);
		throw error;
	}
};

export const PromoteUser = async (user_id) => {
	return await axios.post(
	  BASE_URL + "admin/user/promoted", 
	  { user_id },  
	  {
		headers: {
		  "Content-Type": "application/json",  
		  "x-access-token": `${localStorage.getItem("adminToken")}`,  
		},
	  }
	);
  };

  export const GetPromotionRequest = async () => {
	return await axios.get(BASE_URL + `admin/user/getAllPromotionRequest`
	);
};
  