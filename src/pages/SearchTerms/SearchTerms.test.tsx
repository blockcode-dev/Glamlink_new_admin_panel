import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axios, { type AxiosRequestConfig } from "axios";
import SearchTerms from "./SearchTerms";

vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), put: vi.fn<Call>() },
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const TERMS = "https://api.test/api/v1/search/admin/terms";
const SETTINGS = "https://api.test/api/v1/settings/home";

const term = (text: string, last_results = 4) => ({
  term: text,
  searches: 12,
  last_results,
  last_searched_at: "2026-10-27T18:00:00Z",
});

const answer = (popular: string[]) => async (url: string, config?: AxiosRequestConfig) => {
  if (url === SETTINGS) return { data: { data: { popular_searches: popular } } };
  const sort = (config?.params as { sort?: string } | undefined)?.sort;
  return { data: { data: sort === "empty" ? [term("hydrafacial", 0)] : [term("botox"), term("facials")] } };
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <SearchTerms />
    </MemoryRouter>,
  );

describe("Search terms", () => {
  it("lists the most searched, then the searches that found nothing", async () => {
    vi.mocked(axios.get).mockImplementation(answer([]));
    renderPage();
    expect(await screen.findByText("botox")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(TERMS, { params: { sort: "top", page: 1, limit: 50 } });

    fireEvent.click(screen.getByText("Found nothing"));

    expect(await screen.findByText("hydrafacial")).toBeInTheDocument();
    expect(screen.getByText("None")).toBeInTheDocument();
  });

  it("adds a term to the home page's popular searches", async () => {
    vi.mocked(axios.get).mockImplementation(answer(["Botox"]));
    vi.mocked(axios.put).mockResolvedValue({ data: { data: { popular_searches: ["Botox", "facials"] } } });
    renderPage();
    await screen.findByText("facials");

    // "botox" is already a popular search (any case), so only "facials" can be added.
    const add = await screen.findByRole("button", { name: /Add/ });
    fireEvent.click(add);

    await waitFor(() => expect(axios.put).toHaveBeenCalledWith(SETTINGS, { popular_searches: ["Botox", "facials"] }));
    expect(await screen.findByText(/"facials" now shows/)).toBeInTheDocument();
  });
});
