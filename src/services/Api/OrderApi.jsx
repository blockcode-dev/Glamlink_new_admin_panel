import axios from "axios";
import { BASE_URL } from "../Host";


export const GetAllOrders = async () => {
  const res = await axios.get(BASE_URL + "order/getAllOrders");

  return res;
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
