import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse } from "../../types/api";
import type {
  AccessOrder,
  BusinessCard,
  FeaturedLink,
  FulfillmentUpdate,
} from "../../types/businessCard";
import type { OrderRates, VoidedLabel } from "../../types/access";

type Id = number | string;

export const UpdateStatus = async (formData: FormData) => {
  return await axios.put<ApiResponse<unknown>>(
    BASE_URL + `businessCard/updateBusinessCardStatus`,
    formData,
  );
};

/** Every card but guest drafts; `status` lists only that status ("draft" lists the drafts). */
export const GetAllBusinessCards = async (status?: BusinessCard["status"]) => {
  return await axios.get<ApiResponse<BusinessCard[]>>(BASE_URL + `businessCard/getAllBusinessCards`, {
    params: status ? { status } : undefined,
  });
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

/** A page of orders, newest first, with how many there are in all. */
export interface AccessOrderPage {
  data: AccessOrder[];
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

/**
 * The newest orders. The API reads `page` and `limit` from the request body, which a GET can't carry, so it answers
 * its first 10 whatever is asked (until it reads the query); `pagination.total` still counts every order.
 */
export const GetAllAccessOrders = async (params: { page?: number; limit?: number } = {}) => {
  return await axios.get<ApiResponse<AccessOrderPage>>(BASE_URL + `businessCard/access-orders`, {
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

/** Today's Shippo rates for an order's keychain parcel, cheapest first. 400 NOTHING_TO_SHIP for an order with no parcel. */
export const GetAccessOrderRates = async (id: Id) => {
  return axios.get<ApiResponse<OrderRates>>(`${BASE_URL}businessCard/access-orders/${id}/rates`);
};

/**
 * Buys the order's label: `rateId` (one of today's rates), else the rate chosen at checkout, else today's rate for the
 * same service (or the cheapest). Answers the order, now processing, with its tracking number and `label_url`.
 * 409 LABEL_EXISTS; 502 LABEL_FAILED with Shippo's reasons in the message; 400 NOTHING_TO_SHIP or NO_SHIPPING_RATES.
 */
export const BuyAccessOrderLabel = async (id: Id, rateId?: string) => {
  return axios.post<ApiResponse<AccessOrder>>(
    `${BASE_URL}businessCard/access-orders/${id}/label`,
    rateId ? { rate_id: rateId } : {},
  );
};

/** Voids an unused label (Shippo refunds it); the order goes back to pending. 409 LABEL_IN_USE once it has shipped. */
export const VoidAccessOrderLabel = async (id: Id) => {
  return axios.post<ApiResponse<VoidedLabel>>(`${BASE_URL}businessCard/access-orders/${id}/label/void`);
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
