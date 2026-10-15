import axios from "axios";
import { BASE_URL } from "../Host";

export const UpdateStatus = async (formData) => {
  return await axios.put(
    BASE_URL + `businessCard/updateBusinessCardStatus`,
    formData,
  );
};

export const GetAllBusinessCards = async () => {
  return await axios.get(BASE_URL + `businessCard/getAllBusinessCards`);
};

export const DeleteBusinessCard = async (category_id) => {
  return await axios.post(`${BASE_URL}businessCard/delete`, {
    category_id: category_id,
  });
};

export const GenerateBusinessCard = async (formData) => {
  return await axios.post(
    BASE_URL + "businessCard/createBusinessCardByAdmin",
    formData,
    {},
  );
};

export const GetBusinessCardById = async (id) => {
  return await axios.get(BASE_URL + `businessCard/getBusinessCardById/${id}`);
};

export const UpdateBusinessCard = async (id, formData) => {
  return await axios.put(
    BASE_URL + `businessCard/updateBusinessCard/${id}`,
    formData,
    {
      headers: {
        "x-access-token": `${localStorage.getItem("adminToken")}`,
        "Content-Type": "multipart/form-data",
      },
    },
  );
};

export const GetAllAccessOrders = async (params = {}) => {
  return await axios.get(BASE_URL + `businessCard/access-orders`, {
    params,
  });
};

export const GetAccessOrderById = async (id) => {
  return await axios.get(BASE_URL + `businessCard/access-orders/${id}`, {});
};

export const UpdateAccessOrderFulfillment = async (id, formData) => {
  return await axios.patch(
    BASE_URL + `businessCard/access-orders/${id}/fulfillment`,
    formData,
  );
};

export const ReorderFeaturedLinks = async (
  businessCardId,
  featured_links,
) => {
  return await axios.put(
    BASE_URL +
      `businessCard/${businessCardId}/featured-links/reorder`,
    {
      featured_links,
    },
    {},
  );
};
