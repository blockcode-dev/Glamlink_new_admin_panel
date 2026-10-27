import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axios from "axios";
import HomeSettings from "./HomeSettings";

vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), put: vi.fn<Call>(), post: vi.fn<Call>() },
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const SETTINGS = "https://api.test/api/v1/settings/home";

const saved = {
  hero_image: "https://api.test/images/hero.jpg",
  popular_searches: ["Botox", "Facials"],
  find_professional_image: null,
  updated_at: "2026-10-23T09:00:00Z",
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <HomeSettings />
    </MemoryRouter>,
  );

describe("Home page settings", () => {
  it("saves the images and the popular searches, trimmed, in their order", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { data: saved } });
    vi.mocked(axios.put).mockImplementation(async (_url, body) => ({ data: { data: { ...saved, ...(body as object) } } }));
    renderPage();

    const second = await screen.findByDisplayValue("Facials");
    fireEvent.change(second, { target: { value: "  Lash lift " } });
    fireEvent.click(screen.getAllByRole("button", { name: "Move up" })[1]);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(SETTINGS, {
        hero_image: "https://api.test/images/hero.jpg",
        find_professional_image: "",
        popular_searches: ["Lash lift", "Botox"],
      }),
    );
  });

  it("shows a refusal on the field it names", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { data: saved } });
    vi.mocked(axios.put).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: "At most 10 popular searches.", code: "INVALID_SETTING", details: { field: "popular_searches" } },
      },
    });
    renderPage();
    await screen.findByDisplayValue("Facials");

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect((await screen.findAllByText("At most 10 popular searches.")).length).toBeGreaterThan(0);
  });
});
