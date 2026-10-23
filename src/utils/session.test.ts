import { afterEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { clearSession, getToken, installSessionHandler, sentToken, setToken, useSessionToken } from "./session";

describe("session store", () => {
  it("treats the strings older builds saved for a missing token as signed out", () => {
    for (const stored of ["undefined", "null", ""]) {
      localStorage.setItem("adminToken", stored);
      expect(getToken()).toBeNull();
    }
    localStorage.setItem("adminToken", "abc");
    expect(getToken()).toBe("abc");
  });

  it("re-renders on sign-in, sign-out and changes from another tab", () => {
    const { result } = renderHook(() => useSessionToken());
    expect(result.current).toBeNull();

    act(() => setToken("t1"));
    expect(result.current).toBe("t1");

    act(() => clearSession());
    expect(result.current).toBeNull();
    expect(localStorage.getItem("adminToken")).toBeNull();

    act(() => {
      localStorage.setItem("adminToken", "t2");
      window.dispatchEvent(new StorageEvent("storage", { key: "adminToken" }));
    });
    expect(result.current).toBe("t2");
  });
});

describe("sentToken", () => {
  const config = (headers: Record<string, string>) =>
    ({ headers: new axios.AxiosHeaders(headers) }) as InternalAxiosRequestConfig;

  it("reads both header schemes the API uses", () => {
    expect(sentToken(config({ "x-access-token": "a" }))).toBe("a");
    expect(sentToken(config({ Authorization: "Bearer b" }))).toBe("b");
  });

  it("ignores a token that was never there", () => {
    expect(sentToken(config({ "x-access-token": "undefined" }))).toBeNull();
    expect(sentToken(config({ Authorization: "Bearer undefined" }))).toBeNull();
    expect(sentToken(config({}))).toBeNull();
    expect(sentToken(undefined)).toBeNull();
  });
});

describe("installSessionHandler", () => {
  const API = import.meta.env.VITE_API_BASE_URL; // "https://api.test/api/v1/" in tests
  let uninstall: (() => void) | undefined;
  afterEach(() => {
    uninstall?.();
    uninstall = undefined;
  });

  /** Sends a request without a network; answers `status` with `body` and reports the headers it went out with. */
  const send = (url: string, status = 200, body: unknown = {}, headers: AxiosRequestConfig["headers"] = {}) => {
    let sent: Record<string, unknown> = {};
    const request = axios.get(url, {
      headers,
      adapter: async (cfg) => {
        sent = cfg.headers.toJSON();
        const response = { status, statusText: "", data: body, headers: {}, config: cfg };
        if (status >= 400) throw new AxiosError("Request failed", "ERR_BAD_RESPONSE", cfg, null, response);
        return response;
      },
    });
    return request.then(() => sent, (error: unknown) => Promise.reject(error));
  };
  const expired = { success: false, status: 401, code: "ADMIN_SESSION_EXPIRED", message: "Invalid or expired admin token", data: "" };

  it("sends the token as a Bearer header on every API call", async () => {
    uninstall = installSessionHandler();
    setToken("current");
    expect(await send(`${API}journal/admin`)).toMatchObject({ Authorization: "Bearer current" });
  });

  it("keeps the token off other hosts and off sign-in", async () => {
    uninstall = installSessionHandler();
    setToken("current");
    expect((await send("https://maps.example.com/x")).Authorization).toBeUndefined();
    expect((await send(`${API}admin/auth/login`)).Authorization).toBeUndefined();
  });

  it("ends the session when the current token gets a 401", async () => {
    uninstall = installSessionHandler();
    setToken("current");
    await expect(send(`${API}admin/profile`, 401, expired)).rejects.toThrow("Request failed");
    expect(getToken()).toBeNull();
  });

  it("keeps the session for other failures", async () => {
    uninstall = installSessionHandler();
    setToken("current");
    // Wrong password on the sign-in form.
    await expect(send(`${API}admin/auth/login`, 401, { code: "INVALID_CREDENTIALS" })).rejects.toThrow("Request failed");
    // Not allowed (roles, later) and server errors.
    await expect(send(`${API}admin/list`, 403)).rejects.toThrow("Request failed");
    await expect(send(`${API}admin/list`, 500)).rejects.toThrow("Request failed");
    // A stale request sent with an older token.
    await expect(send("https://elsewhere.test/x", 401, expired, { Authorization: "Bearer previous" })).rejects.toThrow("Request failed");
    expect(getToken()).toBe("current");
  });
});
