import axios from "axios";
import { BASE_URL } from "../Host";


export const GetServices = async (adminToken, params) => {
  const { page, limit, sortBy } = params;

  try {
    const res = await axios.get(BASE_URL + "admin/services", {
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

export const GetServiceById = async (id) => {
  return await axios.get(BASE_URL + `service/findServiceById/${id}`);
};

export const CreateSerice = async (formData) => {
  return await axios.post(BASE_URL + "admin/service-list", formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};


export const UpdateService = async (id, formData) => {
  return await axios.put(BASE_URL + `admin/updateServiceList/${id}`, formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const DeleteService = async (service_list_id) => {
	return await axios.post(
		`${BASE_URL}admin/deleteServiceList`,
		{ service_list_id: service_list_id },
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};


// category apis

//get category
export const GetServiceCategory = async (adminToken, params) => {
  const { page, limit, sortBy } = params;

  try {
    const res = await axios.get(BASE_URL + "category", {
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

export const GetServiceCategoryById = async (id) => {
  return await axios.get(BASE_URL + `category/${id}`);
};


export const CreateServiceCategory = async (formData) => {
  return await axios.post(BASE_URL + "category", formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};


export const UpdateServiceCategory = async (id, formData) => {
  return await axios.put(BASE_URL + `category/${id}`, formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const DeleteServiceCategory = async (category_id) => {
	return await axios.post(
		`${BASE_URL}category/delete`,
		{ category_id: category_id },
		{
			headers: {
				"x-access-token": `${localStorage.getItem("adminToken")}`,
				"Content-Type": "multipart/form-data",
			},
		}
	);
};


export const GetServiceListByCategoryId = async (category_id) => {
  return await axios.post(BASE_URL + `service/service-list`,	{ category_id: category_id },);
};