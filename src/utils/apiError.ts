import { isAxiosError } from "axios";

// Readers for the value caught from a failed API call. Each returns undefined
// when there is no HTTP response (network error, or a plain exception thrown
// while handling the data), which is what `error.response?.…` gave before.

/** Body the backend sends with an error response. */
export interface ApiErrorBody {
  message?: string;
  error?: string;
  /** Machine-readable reason on newer endpoints, e.g. "INVALID_CARD", "CARD_EXISTS". */
  code?: string;
  /** Extra facts for some codes: the field a check failed on, the conflicting record or account. */
  details?: { field?: string; card_id?: number | string; user_id?: number | string };
}

/** The `code` of a failed API call, e.g. "NOT_FOUND", "ACCOUNT_EXISTS". */
export const apiErrorCode = (error: unknown): string | undefined => apiErrorBody(error)?.code;

/** HTTP status of a failed API call. */
export const apiErrorStatus = (error: unknown): number | undefined =>
  isAxiosError(error) ? error.response?.status : undefined;

/** Response body of a failed API call, if the server sent one. */
export const apiErrorBody = (error: unknown): ApiErrorBody | undefined =>
  isAxiosError<ApiErrorBody>(error) ? error.response?.data : undefined;

/** The backend's `message` for a failed API call, e.g. "jwt expired". */
export const apiErrorMessage = (error: unknown): string | undefined => apiErrorBody(error)?.message;

/** `message` of a thrown Error; undefined for anything else. */
export const errorMessage = (error: unknown): string | undefined =>
  error instanceof Error ? error.message : undefined;

/** True when antd's form.validateFields() rejected; the form already shows what's wrong. */
export const isFormValidationError = (error: unknown): boolean =>
  typeof error === "object" && error !== null && "errorFields" in error;
