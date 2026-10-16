import React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import axios from "axios";
import App from "./App";
import { clearSession } from "./utils/session";

// No network in tests: every API call resolves with an empty list.
vi.mock("axios", () => {
  const ok = () => Promise.resolve({ status: 200, data: { data: [], rows: [] } });
  return {
    default: { get: vi.fn<typeof ok>(ok), post: vi.fn<typeof ok>(ok), put: vi.fn<typeof ok>(ok), delete: vi.fn<typeof ok>(ok), patch: vi.fn<typeof ok>(ok) },
    // utils/apiError reads failures through this.
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const renderAt = (path: string) => {
  window.history.pushState({}, "", path);
  return render(<App />);
};

describe("App routing", () => {
  it("shows the login page", () => {
    renderAt("/login");
    expect(screen.getByRole("button", { name: "SIGN IN" })).toBeInTheDocument();
  });

  it("shows the layout and the requested page when signed in", async () => {
    localStorage.setItem("adminToken", "test-token");
    const { container } = renderAt("/banner");
    expect(await screen.findByText("BANNER CONTENT")).toBeInTheDocument();
    expect(container.querySelector(".ant-layout-sider")).toBeInTheDocument();
    expect(screen.getByText("Access Management")).toBeInTheDocument();
  });

  it("shows the login form inside the layout route when signed out", () => {
    renderAt("/users");
    expect(screen.getByRole("button", { name: "SIGN IN" })).toBeInTheDocument();
  });

  it("doesn't save a session when login returns no token", async () => {
    renderAt("/login");
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "admin@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: "SIGN IN" }));

    expect(await screen.findByText(/the server sent no session/)).toBeInTheDocument();
    expect(localStorage.getItem("adminToken")).toBeNull();
  });

  it("swaps the layout for the login form when the session ends", async () => {
    localStorage.setItem("adminToken", "test-token");
    renderAt("/banner");
    expect(await screen.findByText("BANNER CONTENT")).toBeInTheDocument();

    act(() => clearSession());
    expect(screen.getByRole("button", { name: "SIGN IN" })).toBeInTheDocument();
    expect(screen.queryByText("BANNER CONTENT")).not.toBeInTheDocument();
  });

  it("sends the token with the sidebar's pending counts", async () => {
    localStorage.setItem("adminToken", "test-token");
    renderAt("/banner");
    await screen.findByText("BANNER CONTENT");

    const get = vi.mocked(axios.get);
    for (const path of ["form/getPendingFormCount", "product/getPendingProductCount"]) {
      const call = get.mock.calls.find(([url]) => url.endsWith(path));
      expect(call?.[1]?.headers).toMatchObject({ "x-access-token": "test-token" });
    }
  });

  it("renders no page for a route that was removed", () => {
    localStorage.setItem("adminToken", "test-token");
    renderAt("/blogs");
    expect(screen.queryByText(/blog/i)).not.toBeInTheDocument();
  });
});
