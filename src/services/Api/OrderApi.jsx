import axios from "axios";
import { BASE_URL } from "../Host";


export const GetAllOrders = async (adminToken, role_id) => {
  try {
    const res = await axios.get(BASE_URL + "order/getAllOrders", {
      headers: {
        "x-access-token": `${adminToken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res;
  } catch (error) {
    // Handle error if needed
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const GetOrderById = async (id) => {
  return await axios.get(BASE_URL + `order/getOrderByOrderId/${id}`);
};

//update guest booking
export const UpdateOrderStatus = async (formData) => {
  return await axios.post(
    BASE_URL + `order/updateOrderStatus`,
    formData,
    {
      headers: {
        "x-access-token": `${localStorage.getItem("adminToken")}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};
