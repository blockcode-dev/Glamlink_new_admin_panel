import axios from "axios";
import { BASE_URL } from "../Host";

export const GetServices = async () => {
  const res = await axios.get(BASE_URL + "service/getAllServices");

  return res;
};

//get products byid
export const GetServiceById = async (id) => {
  return await axios.get(BASE_URL + `service/findServiceById/${id}`);
};

//create products
export const CreateSerice = async (formData) => {
  return await axios.post(BASE_URL + "service/createService", formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

//update products
export const UpdateService = async (id, formData) => {
  return await axios.put(BASE_URL + `service/updateService/${id}`, formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

//delete products
export const DeleteService = async (id) => {
  return axios.delete(BASE_URL + `service/deleteService/${id}`);
};
