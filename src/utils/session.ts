import { useSyncExternalStore } from "react";
import axios, { AxiosHeaders, isAxiosError, type InternalAxiosRequestConfig } from "axios";
import { message } from "antd";
import { apiErrorBody } from "./apiError";

// The admin session: one JWT in localStorage. Pages still read it with
// localStorage.getItem("adminToken"); saving and clearing go through here so the
// layout re-renders (and other tabs follow) when the session starts or ends.

const KEY = "adminToken";
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/** The stored token, or null. Older builds could save the string "undefined" when login returned no token. */
export const getToken = (): string | null => {
  const token = localStorage.getItem(KEY);
  return token && token !== "undefined" && token !== "null" ? token : null;
};

export const setToken = (token: string) => {
  localStorage.setItem(KEY, token);
  notify();
};

export const clearSession = () => {
  localStorage.removeItem(KEY);
  notify();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // Login or logout in another tab.
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

/** The current token; the component re-renders when the session starts or ends. */
export const useSessionToken = () => useSyncExternalStore(subscribe, getToken);

// Messages jsonwebtoken gives for a token that can't be used any more. The backend
// passes them through (as HTTP 500 for "jwt expired"). A 401 isn't treated as the end
// of the session yet: some pages read it as "not allowed for this role". See the
// backend questions doc, section 3.
const SESSION_ENDED = new Set(["jwt expired", "invalid signature", "jwt malformed", "invalid token"]);

/** The token a request carried, in either header scheme the API uses. */
export const sentToken = (config: InternalAxiosRequestConfig | undefined): string | null => {
  const headers = AxiosHeaders.from(config?.headers);
  const accessToken = headers.get("x-access-token");
  const bearer = headers.get("Authorization");
  const token =
    typeof accessToken === "string" ? accessToken
    : typeof bearer === "string" ? bearer.replace(/^Bearer\s+/i, "")
    : null;
  return token && token !== "undefined" && token !== "null" ? token : null;
};

/** True when the request carried the current token and the server says that token is no longer valid. */
export const endsSession = (error: unknown): boolean => {
  if (!isAxiosError(error)) return false;
  const body = apiErrorBody(error);
  const reason = (body?.message ?? body?.error ?? "").trim().toLowerCase();
  if (!SESSION_ENDED.has(reason)) return false;
  const token = sentToken(error.config);
  // Ignore stale requests sent with an older token, and repeats once the session is already cleared.
  return token !== null && token === getToken();
};

/** Clears the session as soon as any request comes back with a dead token. Call once at startup. */
export const installSessionHandler = () =>
  axios.interceptors.response.use(undefined, (error: unknown) => {
    if (endsSession(error)) {
      clearSession();
      message.error({ key: "session-ended", content: "Your session has expired. Please sign in again." });
    }
    return Promise.reject(error);
  });
