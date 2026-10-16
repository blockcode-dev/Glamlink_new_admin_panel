import axios from "axios";
import { BASE_URL } from "../Host";
import type { ApiResponse, Paged } from "../../types/api";
import type { Ad } from "../../types/ads";

type Id = number | string;

// The ads endpoints answer either `{ data: … }` or the bare value; both are typed.
export const GetAllAds = async () => {
  const res = await axios.get<ApiResponse<Paged<Ad> | Ad[]>>(BASE_URL + "ads/");
  return res.data;
};

export const GetAdById = async (id: Id) => {
  return await axios.get<ApiResponse<Ad> | Ad>(BASE_URL + `ads/findAdById/${id}`);
};

/** The ad in a GetAdById body, whichever shape it came in. */
export const adFromResponse = (body: ApiResponse<Ad> | Ad): Ad => ("slot_id" in body ? body : body.data);

export const CreateAd = async (formData: FormData) => {
  return await axios.post<ApiResponse<Ad>>(BASE_URL + "ads", formData);
};

export const UpdateAd = async (id: Id, formData: FormData) => {
  return await axios.put<ApiResponse<Ad>>(BASE_URL + `ads/${id}`, formData);
};

export const DeleteAd = async (ad_id: Id | Id[]) => {
  const ids = Array.isArray(ad_id) ? ad_id : [ad_id];

  return await axios.post<ApiResponse<unknown>>(`${BASE_URL}ads/delete`, {
    ad_id: ids,
  });
};
