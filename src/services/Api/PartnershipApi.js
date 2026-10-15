import axios from "axios";
import { BASE_URL } from "../Host";

export const GetAllPartnershipInquiries = async () => {
  const res = await axios.get(BASE_URL + "partnership-inquiry");
  return res.data;
};

export const GetPartnershipInquiryById = async (id) => {
  const res = await axios.get(BASE_URL + `partnership-inquiry/${id}`);
  return res.data;
};

export const DeletePartnershipInquiry = async (id) => {
  return await axios.post(`${BASE_URL}partnership-inquiry/delete`, {
    inquiry_id: Array.isArray(id) ? id : [id],
  });
};