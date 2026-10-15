import axios from "axios";
import { BASE_URL } from "../Host";

export const GetAllAds = async () => {
  const res = await axios.get(BASE_URL + "ads/");
  return res.data;
};

export const GetAdById = async (id) => {
  return await axios.get(BASE_URL + `ads/findAdById/${id}`);
};

export const CreateAd = async (formData) => {
  return await axios.post(BASE_URL + "ads", formData);
};

export const UpdateAd = async (id, formData) => {
  return await axios.put(BASE_URL + `ads/${id}`, formData);
};

export const UpdateAdStatus = async (id, status) => {
  return await axios.put(BASE_URL + `ads/status/${id}`, { status });
};

export const DeleteAd = async (ad_id) => {
  const ids = Array.isArray(ad_id) ? ad_id : [ad_id];
 
  return await axios.post(`${BASE_URL}ads/delete`, {
    ad_id: ids,
  });
};