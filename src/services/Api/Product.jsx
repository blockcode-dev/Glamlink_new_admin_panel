import axios from "axios";
import { BASE_URL } from "../Host";

//get all products
export const GetAllProducts = async () => {
  const res = await axios.get(BASE_URL + "product/getAllProducts");

  return res;
};

//get products byid
export const GetProductById = async (id) => {
  return await axios.get(BASE_URL + "product/findProductById");
};

//create products
export const CreateProduct = async (formData) => {
  return await axios.post(BASE_URL + "product/createProduct", formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

//update products
export const UpdateProduct = async (formData) => {
  return await axios.put(BASE_URL + "product/updateProduct", formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

//delete products
export const DeleteProduct = async (role_id, adminToken) => {
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
