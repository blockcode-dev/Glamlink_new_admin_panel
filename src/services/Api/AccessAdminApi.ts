import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse } from "../../types/api";
import type {
  AccessCatalog,
  AccessDiscount,
  AccessPlan,
  AccessSettings,
  DiscountCreate,
  DiscountUpdate,
  PersonalPrice,
  PersonalPriceCreate,
  PersonalPriceCreated,
  PersonalPriceFilters,
  PlanUpdate,
  PriceChange,
  PriceChangeRequest,
  PriceChangeResult,
  SeatFilters,
  SubscriptionSeat,
} from "../../types/access";

// Access plans, prices, sales, personal prices, settings and Access Pro subscriptions (backend docs/access.md).
// Amounts are whole cents (USD). A refusal is 400 INVALID_INPUT with `details.field`.

type Id = number | string;

/** Products (list prices), plans, settings, discounts and the running sale: everything the pricing screens show. */
export const GetAccessCatalog = async () => {
  return axios.get<ApiResponse<AccessCatalog>>(`${BASE_URL}access/admin/catalog`);
};

/** Edits a plan as the website shows it. 404 for an unknown code. */
export const UpdateAccessPlan = async (code: string, fields: PlanUpdate) => {
  return axios.put<ApiResponse<AccessPlan>>(`${BASE_URL}access/admin/plans/${code}`, fields);
};

/**
 * A new list price for "pro" (monthly) or "keychain"; new purchases pay it. With `move_subscribers` (Access Pro only)
 * paying subscribers without a personal price move to it from their next renewal, and the answer says how many moved
 * and who Stripe refused.
 */
export const ChangeProductPrice = async (code: string, body: PriceChangeRequest) => {
  return axios.put<ApiResponse<PriceChangeResult>>(`${BASE_URL}access/admin/products/${code}/price`, body);
};

/** List-price changes, newest first (at most 200). */
export const GetPriceChanges = async () => {
  return axios.get<ApiResponse<PriceChange[]>>(`${BASE_URL}access/admin/price-changes`);
};

/** Site-wide sales, latest start first (at most 200). */
export const GetDiscounts = async () => {
  return axios.get<ApiResponse<AccessDiscount[]>>(`${BASE_URL}access/admin/discounts`);
};

/** A site-wide sale. 409 DISCOUNT_OVERLAPS (`details.discount_id`) when another runs at any time between its dates. */
export const CreateDiscount = async (fields: DiscountCreate) => {
  return axios.post<ApiResponse<AccessDiscount>>(`${BASE_URL}access/admin/discounts`, fields);
};

/** Renames a sale or moves its end (409 DISCOUNT_OVERLAPS too). What it takes off can't change: end it, make another. */
export const UpdateDiscount = async (id: Id, fields: DiscountUpdate) => {
  return axios.patch<ApiResponse<AccessDiscount>>(`${BASE_URL}access/admin/discounts/${id}`, fields);
};

/** Ends a sale now; one that hasn't started never runs. */
export const EndDiscount = async (id: Id) => {
  return axios.post<ApiResponse<AccessDiscount>>(`${BASE_URL}access/admin/discounts/${id}/end`);
};

/** Personal prices, newest first (at most 500). */
export const GetPersonalPrices = async ({ active, ...filters }: PersonalPriceFilters = {}) => {
  return axios.get<ApiResponse<PersonalPrice[]>>(`${BASE_URL}access/admin/custom-prices`, {
    params: { ...filters, ...(active ? { active: "true" } : {}) },
  });
};

/**
 * A price for one client, by account or by email (before they have an account). It ends their earlier personal price
 * for that product and beats a running sale.
 */
export const CreatePersonalPrice = async (fields: PersonalPriceCreate) => {
  return axios.post<ApiResponse<PersonalPriceCreated>>(`${BASE_URL}access/admin/custom-prices`, fields);
};

/** Ends a personal price now. */
export const EndPersonalPrice = async (id: Id) => {
  return axios.post<ApiResponse<PersonalPrice>>(`${BASE_URL}access/admin/custom-prices/${id}/end`);
};

/** Saves the settings sent, each replacing the stored one whole; answers all of them. */
export const UpdateAccessSettings = async (settings: Partial<AccessSettings>) => {
  return axios.put<ApiResponse<AccessSettings>>(`${BASE_URL}access/admin/settings`, settings);
};

/** Access Pro seats, last changed first (at most 1000). */
export const GetSubscriptions = async (filters: SeatFilters = {}) => {
  return axios.get<ApiResponse<SubscriptionSeat[]>>(`${BASE_URL}access/admin/subscriptions`, { params: filters });
};

/**
 * Ends a person's Access Pro at the end of the month they paid for, or at once with `now`. A complimentary seat always
 * ends at once. 404 NO_SUBSCRIPTION when they don't have Pro.
 */
export const CancelSubscription = async (userId: Id, { now = false }: { now?: boolean } = {}) => {
  return axios.post<ApiResponse<SubscriptionSeat>>(
    `${BASE_URL}access/admin/subscriptions/${userId}/cancel`,
    now ? { now: true } : {},
  );
};

/** Gives or takes back complimentary Pro. 409 SUBSCRIPTION_PAID for someone who pays through Stripe; 404 no account. */
export const SetComplimentaryPro = async (userId: Id, active: boolean) => {
  return axios.put<ApiResponse<SubscriptionSeat>>(`${BASE_URL}access/admin/subscriptions/${userId}/comp`, { active });
};
