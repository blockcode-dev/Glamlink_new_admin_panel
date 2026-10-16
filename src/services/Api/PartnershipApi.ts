import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse, Paged } from "../../types/api";
import type { PartnershipInquiry } from "../../types/content";

type Id = number | string;

export const GetAllPartnershipInquiries = async () => {
  // Older responses wrap the list in { rows }, newer ones return it directly.
  const res = await axios.get<ApiResponse<Paged<PartnershipInquiry> | PartnershipInquiry[]>>(BASE_URL + "partnership-inquiry");
  return res.data;
};

export const GetPartnershipInquiryById = async (id: Id) => {
  const res = await axios.get<ApiResponse<PartnershipInquiry>>(BASE_URL + `partnership-inquiry/${id}`);
  return res.data;
};

export const DeletePartnershipInquiry = async (id: Id | Id[]) => {
  return await axios.post<ApiResponse<unknown>>(`${BASE_URL}partnership-inquiry/delete`, {
    inquiry_id: Array.isArray(id) ? id : [id],
  });
};
