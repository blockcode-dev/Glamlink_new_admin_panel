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
  let interceptor: number | undefined;
  afterEach(() => {
    if (interceptor !== undefined) axios.interceptors.response.eject(interceptor);
    interceptor = undefined;
  });

  // Sends a request whose response is `status` with `body`, without a network.
  const respond = (status: number, body: unknown, headers: AxiosRequestConfig["headers"]) =>
    axios.get("/api/test", {
      headers,
      adapter: async (cfg) => {
        throw new AxiosError("Request failed", "ERR_BAD_RESPONSE", cfg, null, {
          status,
          statusText: "",
          data: body,
          headers: {},
          config: cfg,
        });
      },
    });

  it("ends the session when the server says the current token expired", async () => {
    interceptor = installSessionHandler();
    setToken("current");
    await expect(respond(500, { message: "jwt expired" }, { "x-access-token": "current" })).rejects.toThrow("Request failed");
    expect(getToken()).toBeNull();
  });

  it("does the same for Bearer requests and other dead-token messages", async () => {
    interceptor = installSessionHandler();
    setToken("current");
    await expect(respond(500, { message: "invalid signature" }, { Authorization: "Bearer current" })).rejects.toThrow("Request failed");
    expect(getToken()).toBeNull();
  });

  it("keeps the session for other failures", async () => {
    interceptor = installSessionHandler();
    setToken("current");
    // A 401 can mean "not allowed for this role" (see the backend questions).
    await expect(respond(401, { message: "Unauthorized" }, { "x-access-token": "current" })).rejects.toThrow("Request failed");
    await expect(respond(500, { message: "Something broke" }, { "x-access-token": "current" })).rejects.toThrow("Request failed");
    // A request that forgot the token, or one sent with an older token.
    await expect(respond(500, { message: "jwt malformed" }, { "x-access-token": "undefined" })).rejects.toThrow("Request failed");
    await expect(respond(500, { message: "jwt expired" }, { "x-access-token": "previous" })).rejects.toThrow("Request failed");
    expect(getToken()).toBe("current");
  });
});
