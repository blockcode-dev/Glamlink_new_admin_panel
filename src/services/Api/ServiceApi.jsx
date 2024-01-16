import axios from "axios";
import { BASE_URL } from "../Host";

export const GetServices = async () => {
  const res = await axios.get(BASE_URL + "service/getAllServices");

  return res;
};

//get products byid
export const GetServiceById = async (id) => {
  return await axios.get(BASE_URL + "product/findProductById");
};

//create products
export const CreateSerice = async (formData) => {
  return await axios.post(BASE_URL + "product/createProduct", formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

//update products
export const UpdateService = async (formData) => {
  return await axios.put(BASE_URL + "product/updateProduct", formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

//delete products
export const DeleteService = async (role_id, adminToken) => {
  const formData = new FormData();
  formData.append("role_id", role_id);
  return axios.delete(BASE_URL + "product/deleteProduct", {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
      "x-access-token": adminToken,
    },
  });
};
