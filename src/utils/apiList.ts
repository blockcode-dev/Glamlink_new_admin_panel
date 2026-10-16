import type { FlexibleList } from "../types/api";

/** The rows of a list response, whichever of the three shapes the endpoint used. */
export const listFromResponse = <T>(body: FlexibleList<T> | undefined): T[] =>
  Array.isArray(body?.data) ? body.data : body?.data?.rows || body?.rows || [];
