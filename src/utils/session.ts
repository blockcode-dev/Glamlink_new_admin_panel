import { useSyncExternalStore } from "react";
import axios, { AxiosHeaders, isAxiosError, type InternalAxiosRequestConfig } from "axios";
import { message } from "antd";
import { API_BASE_URL } from "../config/env";

// The admin session: one JWT in localStorage. Everything about it lives here:
// saving and clearing it (the layout re-renders, other tabs follow), attaching it
// to every API call, and ending the session when the API says it has ended.

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

// Signing in sends no token, and its 401 means "wrong email or password", not an ended session.
const isSignIn = (url: string | undefined) => /admin\/auth\/(login|otp|verify-otp|forgot-password)\b/.test(url ?? "");

/** True for calls to our API, the only place the token may go. */
const isApiCall = (url: string | undefined) => Boolean(API_BASE_URL && url?.startsWith(API_BASE_URL));

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

/**
 * True when a request that carried the current token got 401. The API answers 401
 * only for a missing or ended session (ADMIN_SIGN_IN_REQUIRED / ADMIN_SESSION_EXPIRED:
 * expired, signed out, password changed, admin deactivated); a role without access
 * will be 403.
 */
export const endsSession = (error: unknown): boolean => {
  if (!isAxiosError(error) || error.response?.status !== 401 || isSignIn(error.config?.url)) return false;
  const token = sentToken(error.config);
  // Ignore stale requests sent with an older token, and repeats once the session is already cleared.
  return token !== null && token === getToken();
};

/**
 * The shared API client: every axios call to the API carries `Authorization: Bearer <token>`
 * (sign-in calls excepted), and a 401 for the current token ends the session.
 * Call once at startup; returns a function that removes both handlers.
 */
export const installSessionHandler = () => {
  const request = axios.interceptors.request.use((config) => {
    const token = getToken();
    if (token && isApiCall(config.url) && !isSignIn(config.url)) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  });
  const response = axios.interceptors.response.use(undefined, (error: unknown) => {
    if (endsSession(error)) {
      clearSession();
      message.error({ key: "session-ended", content: "Your session has ended. Please sign in again." });
    }
    return Promise.reject(error);
  });
  return () => {
    axios.interceptors.request.eject(request);
    axios.interceptors.response.eject(response);
  };
};
