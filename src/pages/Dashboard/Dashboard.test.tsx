import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import axios from "axios";
import Dashboard from "./Dashboard";

vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>() },
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const API = "https://api.test/api/v1/";

// What each endpoint answers; anything else fails, to show a failing count doesn't break the page.
const answers: Record<string, unknown> = {
  "businessCard/getAllBusinessCards": [{ status: "pending" }, { status: "pending" }, { status: "accepted" }],
  "form/getPendingFormCount": "4",
  "directory/applications": { count: 3, rows: [] },
  "businessCard/access-orders": { data: [{ fulfillment_status: "pending" }, { fulfillment_status: "shipped" }, { fulfillment_status: null }] },
  "admin/users/list/7": { count: 87, rows: [] },
  "profiles/admin/list": { count: 64, rows: [] },
  "access/admin/subscriptions": [{ user_id: 1, status: "active" }, { user_id: 2, status: "active" }],
  "newsletter/list": { count: 1203, rows: [] },
  "feature-request/list": { count: 9, rows: [] },
  "search/admin/terms": [{ term: "botox", searches: 40, last_results: 3, last_searched_at: "2026-10-27" }],
};

const tile = (title: string) => screen.getByText(title).closest(".ant-card") as HTMLElement;

describe("Dashboard", () => {
  it("shows each number with its screen, and a dash for one that can't load", async () => {
    vi.mocked(axios.get).mockImplementation(async (url) => {
      const path = String(url).replace(API, "");
      if (path in answers) return { data: { data: answers[path] } };
      throw new Error(`No answer for ${path}`);
    });
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/digital-card" element={<p>Card requests screen</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await within(tile("Card requests to review")).findByText("2")).toBeInTheDocument();
    expect(await within(tile("Live Access cards")).findByText("1")).toBeInTheDocument();
    expect(await within(tile("Applicant forms to review")).findByText("4")).toBeInTheDocument();
    expect(await within(tile("Directory applications to review")).findByText("3")).toBeInTheDocument();
    // Only pending or processing orders wait to ship; one with no fulfillment is Access Pro alone.
    expect(await within(tile("Keychain orders to ship")).findByText("1")).toBeInTheDocument();
    expect(await within(tile("Access Pro subscribers")).findByText("2")).toBeInTheDocument();
    expect(await within(tile("Newsletter subscribers")).findByText("1,203")).toBeInTheDocument();
    expect(await within(tile("Partner inquiries")).findByText("–")).toBeInTheDocument();
    expect(await screen.findAllByText("botox")).not.toHaveLength(0);

    fireEvent.click(tile("Card requests to review"));
    expect(await screen.findByText("Card requests screen")).toBeInTheDocument();
  });
});
