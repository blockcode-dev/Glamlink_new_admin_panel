import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import axios from "axios";
import dayjs from "dayjs";
import ProfilePageAnalytics from "./ProfilePageAnalytics";
import { clickCounts, fillDays, rangeParams, targetText } from "./analytics";
import type { PageAnalytics } from "../../types/profile";

// No network in tests: each test says what the numbers are.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), post: vi.fn<Call>(), put: vi.fn<Call>() },
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

// jsdom has no canvas: the chart shows the days it was given instead.
vi.mock("./DailyChart", () => ({
  default: ({ days }: { days: { date: string }[] }) => <div>{`Chart of ${days.length} days`}</div>,
}));

const DAY = "YYYY-MM-DD";

describe("Page analytics: reading the API's numbers", () => {
  it("gives every day of the range a count, 0 where the API lists none", () => {
    const days = fillDays({
      date_range: { from: "2026-10-01", to: "2026-10-04" },
      daily_views: [
        { date: "2026-10-01", count: 5 },
        { date: "2026-10-03", count: 2 },
      ],
      daily_clicks: [{ date: "2026-10-03", count: 1 }],
    });
    expect(days).toEqual([
      { date: "2026-10-01", views: 5, clicks: 0 },
      { date: "2026-10-02", views: 0, clicks: 0 },
      { date: "2026-10-03", views: 2, clicks: 1 },
      { date: "2026-10-04", views: 0, clicks: 0 },
    ]);
  });

  it("leaves today out of the request, so the API uses its own today", () => {
    const today = dayjs("2026-10-28");
    expect(rangeParams(dayjs("2026-09-29"), today, today)).toEqual(["2026-09-29", undefined]);
    expect(rangeParams(today, today, today)).toEqual([undefined, undefined]);
    expect(rangeParams(dayjs("2026-10-01"), dayjs("2026-10-07"), today)).toEqual(["2026-10-01", "2026-10-07"]);
  });

  it("names the clicks, most first, without page views", () => {
    const counts = clickCounts({ PAGE_VIEW: 120, WEBSITE_CLICK: 3, PRODUCT_CLICK: 12, GALLERY_CLICK: 1 });
    expect(counts.slice(0, 3).map((c) => [c.label, c.count])).toEqual([
      ["Products", 12],
      ["Website", 3],
      ["Gallery", 1],
    ]);
    expect(counts.map((c) => c.type)).not.toContain("PAGE_VIEW");
    expect(targetText({ event_type: "PRODUCT_CLICK", event_target: "31" })).toBe("Product #31");
    expect(targetText({ event_type: "SOCIAL_CLICK", event_target: "tiktok" })).toBe("TikTok");
  });
});

const numbers = (fields: Partial<PageAnalytics> = {}): PageAnalytics => ({
  page: { id: 812, slug: "revance", name: "Revance", visible: true },
  date_range: { from: dayjs().subtract(29, "day").format(DAY), to: dayjs().format(DAY) },
  summary: { total_views: 1234, unique_visitors: 80, total_clicks: 30 },
  events: { PAGE_VIEW: 1234, WEBSITE_CLICK: 10, PRODUCT_CLICK: 20 },
  daily_views: [{ date: dayjs().format(DAY), count: 1234 }],
  daily_clicks: [{ date: dayjs().format(DAY), count: 30 }],
  device_breakdown: [
    { device_type: "mobile", count: 1000 },
    { device_type: "desktop", count: 234 },
  ],
  top_targets: [
    { event_type: "PRODUCT_CLICK", event_target: "31", count: 20 },
    { event_type: "WEBSITE_CLICK", event_target: "https://revance.com", count: 10 },
  ],
  ...fields,
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/pages/812/analytics"]}>
      <Routes>
        <Route path="/pages/:userId/analytics" element={<ProfilePageAnalytics />} />
      </Routes>
    </MemoryRouter>,
  );

describe("Page analytics: the screen", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the last 30 days: totals, every day, clicks by type, devices and the most clicked", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { data: numbers() } });
    renderPage();

    expect(await screen.findByText("1,234")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith("https://api.test/api/v1/profiles/admin/812/analytics", {
      params: { from: dayjs().subtract(29, "day").format(DAY), to: undefined },
    });
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("Chart of 30 days")).toBeInTheDocument();
    expect(screen.getByText("1,000 · 81%")).toBeInTheDocument();
    expect(screen.getByText("Product #31")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://revance.com" })).toHaveAttribute("href", "https://revance.com");

    // The same days as a table, with the empty ones at 0.
    fireEvent.click(screen.getByText("Table"));
    const table = screen.getByText(dayjs().format("ddd, MMM D, YYYY")).closest("table") as HTMLElement;
    expect(within(table).getAllByRole("row")).toHaveLength(31); // a header and 30 days
    expect(within(table).getAllByRole("cell", { name: "0" }).length).toBeGreaterThanOrEqual(58);
  });

  it("says when a page doesn't exist", async () => {
    vi.mocked(axios.get).mockRejectedValue({
      isAxiosError: true,
      response: { status: 404, data: { success: false, message: "Page not found.", code: "NOT_FOUND" } },
    });
    renderPage();

    expect(await screen.findByText(/No page for this account/)).toBeInTheDocument();
  });
});
