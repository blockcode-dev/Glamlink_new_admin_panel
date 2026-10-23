import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse } from "../../types/api";
import type {
  AccessOrder,
  BusinessCard,
  FeaturedLink,
  FulfillmentUpdate,
} from "../../types/businessCard";

type Id = number | string;

export const UpdateStatus = async (formData: FormData) => {
  return await axios.put<ApiResponse<unknown>>(
    BASE_URL + `businessCard/updateBusinessCardStatus`,
    formData,
  );
};

export const GetAllBusinessCards = async () => {
  return await axios.get<ApiResponse<BusinessCard[]>>(BASE_URL + `businessCard/getAllBusinessCards`);
};

export const DeleteBusinessCard = async (category_id: React.Key[]) => {
  return await axios.post<ApiResponse<unknown>>(`${BASE_URL}businessCard/delete`, {
    category_id: category_id,
  });
};

export const GenerateBusinessCard = async (formData: FormData) => {
  return await axios.post<ApiResponse<BusinessCard>>(BASE_URL + "businessCard/createBusinessCardByAdmin", formData);
};

export const GetBusinessCardById = async (id: Id) => {
  return await axios.get<ApiResponse<BusinessCard>>(BASE_URL + `businessCard/getBusinessCardById/${id}`);
};

export const UpdateBusinessCard = async (id: Id, formData: FormData) => {
  return await axios.put<ApiResponse<BusinessCard>>(
    BASE_URL + `businessCard/updateBusinessCard/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      },
    },
  );
};

export const GetAllAccessOrders = async (params: { page?: number; limit?: number } = {}) => {
  return await axios.get<ApiResponse<{ data: AccessOrder[] }>>(BASE_URL + `businessCard/access-orders`, {
    params,
  });
};

export const GetAccessOrderById = async (id: Id) => {
  return await axios.get<ApiResponse<AccessOrder> | AccessOrder>(BASE_URL + `businessCard/access-orders/${id}`);
};

/** The order in a GetAccessOrderById body, whichever shape it came in. */
export const accessOrderFromResponse = (body: ApiResponse<AccessOrder> | AccessOrder): AccessOrder =>
  "order_number" in body ? body : body.data;

export const UpdateAccessOrderFulfillment = async (id: Id, formData: FulfillmentUpdate) => {
  return await axios.patch<ApiResponse<AccessOrder>>(
    BASE_URL + `businessCard/access-orders/${id}/fulfillment`,
    formData,
  );
};

export const ReorderFeaturedLinks = async (
  businessCardId: Id,
  featured_links: FeaturedLink[],
) => {
  return await axios.put<ApiResponse<unknown>>(BASE_URL +
    `businessCard/${businessCardId}/featured-links/reorder`, {
    featured_links,
  });
};
