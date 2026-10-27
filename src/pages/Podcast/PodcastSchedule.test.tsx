import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axios from "axios";
import PodcastSchedule from "./PodcastSchedule";

// No network in tests: each test says what the schedules list and the import answer.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), post: vi.fn<Call>(), delete: vi.fn<Call>() },
    // utils/apiError reads failures through this.
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <PodcastSchedule />
    </MemoryRouter>,
  );

const importButton = () => screen.getByRole("button", { name: /Import episodes from YouTube/ });

describe("Podcast schedules: importing episodes", () => {
  it("imports the playlists with one button and says how many episodes came in", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } });
    vi.mocked(axios.post).mockResolvedValue({
      data: { data: { imported: 34, series: [{ series: "beauty-vault-podcast", imported: 34 }] } },
    });
    renderPage();

    fireEvent.click(importButton());

    expect(await screen.findByText("34 new episodes imported from YouTube")).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith("https://api.test/api/v1/videos/admin/sync");
  });

  it("says when YouTube has nothing new", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } });
    vi.mocked(axios.post).mockResolvedValue({
      data: { data: { imported: 0, series: [{ series: "beauty-vault-podcast", imported: 0 }] } },
    });
    renderPage();

    fireEvent.click(importButton());

    expect(await screen.findByText("No new episodes on YouTube")).toBeInTheDocument();
  });

  it("shows the API's reason when the import can't run", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } });
    vi.mocked(axios.post).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 503,
        data: { message: "YouTube is not set up on the server (YOUTUBE_API_KEY).", code: "YOUTUBE_NOT_CONFIGURED" },
      },
    });
    renderPage();

    fireEvent.click(importButton());

    expect(await screen.findByText("YouTube is not set up on the server (YOUTUBE_API_KEY).")).toBeInTheDocument();
  });
});
