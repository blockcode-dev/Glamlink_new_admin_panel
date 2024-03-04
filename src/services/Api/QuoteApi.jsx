import axios from "axios";
import { BASE_URL } from "../Host";

export const GetAllQuote = async (adminToken, role_id) => {
  try {
    const res = await axios.get(BASE_URL + "quote/getAllQuote", {
      headers: {
        "x-access-token": `${adminToken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

//get products byid
export const GetQuoteById = async (id) => {
  return await axios.get(BASE_URL + `quote/findQuoteById/${id}`);
};

//delete products
export const DeleteQuote = async (id) => {
  return axios.delete(BASE_URL + `quote/deleteQuote/${id}`);
};
