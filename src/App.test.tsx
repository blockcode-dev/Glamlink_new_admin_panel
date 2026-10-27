import React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import axios from "axios";
import App from "./App";
import { clearSession, setToken } from "./utils/session";

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
    const { container } = renderAt("/newsletter");
    expect(await screen.findByText(/People who signed up through the website's newsletter forms/)).toBeInTheDocument();
    expect(container.querySelector(".ant-layout-sider")).toBeInTheDocument();
    expect(screen.getByText("Access Management")).toBeInTheDocument();
  });

  it("shows the login form inside the layout route when signed out", () => {
    renderAt("/professionals");
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
    renderAt("/newsletter");
    expect(await screen.findByText(/People who signed up through the website's newsletter forms/)).toBeInTheDocument();

    act(() => clearSession());
    expect(screen.getByRole("button", { name: "SIGN IN" })).toBeInTheDocument();
    expect(screen.queryByText(/People who signed up through the website's newsletter forms/)).not.toBeInTheDocument();
  });

  // The token itself is attached by the shared client (utils/session.test.ts).
  it("loads the profile and pending counts only once signed in", async () => {
    const get = vi.mocked(axios.get);
    const requested = (path: string) => get.mock.calls.some(([url]) => url.endsWith(path));
    const paths = ["admin/profile", "form/getPendingFormCount", "directory/applications"];

    renderAt("/professionals");
    expect(screen.getByRole("button", { name: "SIGN IN" })).toBeInTheDocument();
    expect(paths.filter(requested)).toEqual([]);

    act(() => setToken("test-token"));
    await screen.findByText("Access Management");
    expect(paths.filter(requested)).toEqual(paths);
  });

  it("renders no page for a route that was removed", () => {
    localStorage.setItem("adminToken", "test-token");
    renderAt("/blogs");
    expect(screen.queryByText(/blog/i)).not.toBeInTheDocument();
  });

  // The website comes first: the mobile app's screens are gone until the app is rebuilt.
  it.each([
    ["/users", /USER MANAGEMENT/i],
    ["/posts-list", /posts/i],
    ["/clips-list", /clips/i],
    ["/appointments", /appointment/i],
    ["/product-list", /product/i],
    ["/orders", /orders/i],
    ["/reward-rules", /reward/i],
    ["/banner", /banner/i],
  ])("has no app screen at %s", (path, heading) => {
    localStorage.setItem("adminToken", "test-token");
    renderAt(path);
    expect(screen.queryByRole("heading", { name: heading })).not.toBeInTheDocument();
  });

  it("shows no app screens in the sidebar", async () => {
    localStorage.setItem("adminToken", "test-token");
    renderAt("/");
    await screen.findByText("Access Management");
    for (const label of ["Users", "Posts", "Clips", "Appointments", "Referrals", "Glam Rewards Rules", "Ecommerce", "Banner"]) {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    }
  });
});
