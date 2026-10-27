import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axios from "axios";
import WatchSeries from "./WatchSeries";
import type { VideoSeries } from "../../types/video";

// No network in tests: each test says what the list and the saves answer.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), post: vi.fn<Call>(), put: vi.fn<Call>() },
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const SERIES = "https://api.test/api/v1/video-series/admin";

const EXPERT_TAKE: VideoSeries = {
  id: 2,
  name: "Expert Take",
  slug: "expert-take",
  playlist_id: "PLexperttake01",
  sort_order: 2,
  is_active: true,
  created_at: "2026-10-23T09:00:00Z",
  updated_at: "2026-10-23T09:00:00Z",
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <WatchSeries />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(axios.get).mockResolvedValue({ data: { data: [EXPERT_TAKE] } });
});

describe("Video series", () => {
  it("adds a series from a playlist link; a blank slug is left out", async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { data: { ...EXPERT_TAKE, id: 5 } } });
    renderPage();
    expect(await screen.findByText("Expert Take")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Add series/ }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Name"), { target: { value: "Industry Voices " } });
    fireEvent.change(within(dialog).getByLabelText("YouTube playlist"), {
      target: { value: "https://www.youtube.com/playlist?list=PLindustry001" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Add series" }));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(SERIES, {
        name: "Industry Voices",
        playlist_id: "https://www.youtube.com/playlist?list=PLindustry001",
        sort_order: 0,
        is_active: true,
      }),
    );
    // The list comes again, with the new series in its place.
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
  });

  it("edits a series, then a new one starts blank", async () => {
    vi.mocked(axios.put).mockResolvedValue({ data: { data: EXPERT_TAKE } });
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Edit Expert Take" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Sort order"), { target: { value: "7" } });
    fireEvent.click(within(dialog).getByRole("switch"));
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(`${SERIES}/2`, {
        name: "Expert Take",
        slug: "expert-take",
        playlist_id: "PLexperttake01",
        sort_order: 7,
        is_active: false,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: /Add series/ }));
    await waitFor(() => expect(screen.getByRole("dialog", { name: "Add series" })).toBeInTheDocument());
    expect(within(screen.getByRole("dialog", { name: "Add series" })).getByLabelText("Name")).toHaveValue("");
  });

  it("shows a refusal on the field it names", async () => {
    vi.mocked(axios.post).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          message: "playlist_id is a YouTube playlist id or link.",
          code: "INVALID_VIDEO",
          details: { field: "playlist_id" },
        },
      },
    });
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: /Add series/ }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Name"), { target: { value: "Glow" } });
    fireEvent.change(within(dialog).getByLabelText("YouTube playlist"), { target: { value: "nope" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Add series" }));

    expect(await within(dialog).findByText("playlist_id is a YouTube playlist id or link.")).toBeInTheDocument();
  });
});
