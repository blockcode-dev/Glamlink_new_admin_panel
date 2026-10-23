import axios from "axios";
import { BASE_URL } from "../Host";
import type { Paged } from "../../types/api";
import type {
  AnalyticsEvent,
  AnalyticsOverview,
  AnalyticsResponse,
  CardAnalytics,
} from "../../types/analytics";

type Id = number | string;

const authHeaders = () => ({
  "Content-Type": "application/json"
});

/** `from` / `to` are "YYYY-MM-DD" dates in the admin's time zone. */
export const GetAccessCardAnalyticsOverview = async (from: string, to: string) => {
  return await axios.get<AnalyticsResponse<AnalyticsOverview>>(`${BASE_URL}access-card/analytics/overview`, {
    params: { from, to },
    headers: authHeaders(),
  });
};

export const GetAccessCardAnalytics = async (businessCardId: Id, from: string, to: string) => {
  return await axios.get<AnalyticsResponse<CardAnalytics>>(`${BASE_URL}access-card/analytics/${businessCardId}`, {
    params: { from, to },
    headers: authHeaders(),
  });
};

export const GetAccessCardAnalyticsEvents = async (
  businessCardId: Id,
  from: string,
  to: string,
  event_type: string | null,
  limit = 100,
  offset = 0,
) => {
  return await axios.get<AnalyticsResponse<Partial<Paged<AnalyticsEvent>>>>(
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
