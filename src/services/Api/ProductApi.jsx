import axios from "axios";
import { BASE_URL } from "../Host";

//get all products
export const GetAllProducts = async () => {
  const res = await axios.get(BASE_URL + "product/getAllProducts");

  return res;
};

//get products byid
export const GetProductById = async (id) => {
  return await axios.get(BASE_URL + `product/findProductById/${id}`);
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
export const UpdateProduct = async (id, formData) => {
  return await axios.put(BASE_URL + `product/updateProduct/${id}`, formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
//delete products
export const DeleteProduct = async (id) => {
  return axios.delete(BASE_URL + `product/deleteProduct/${id}`);
};
