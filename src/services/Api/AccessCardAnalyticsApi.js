import axios from "axios";
import { BASE_URL } from "../Host";

const authHeaders = () => ({
  "Content-Type": "application/json",
  "x-access-token": localStorage.getItem("adminToken"),
});

export const GetAccessCardAnalyticsOverview = async (from, to) => {
  return await axios.get(`${BASE_URL}access-card/analytics/overview`, {
    params: { from, to },
    headers: authHeaders(),
  });
};

export const GetAccessCardAnalytics = async (businessCardId, from, to) => {
  return await axios.get(`${BASE_URL}access-card/analytics/${businessCardId}`, {
    params: { from, to },
    headers: authHeaders(),
  });
};

export const GetAccessCardAnalyticsEvents = async (
  businessCardId,
  from,
  to,
  event_type,
  limit = 100,
  offset = 0,
) => {
  return await axios.get(
    `${BASE_URL}access-card/analytics/${businessCardId}/events`,
    {
      params: {
        from,
        to,
        ...(event_type ? { event_type } : {}),
        limit,
        offset,
      },
      headers: authHeaders(),
    },
  );
};