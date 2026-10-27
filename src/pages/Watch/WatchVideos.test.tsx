import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useParams } from "react-router";
import axios from "axios";
import WatchVideos from "./WatchVideos";
import type { Video, VideoRow, VideoSeries } from "../../types/video";

// No network in tests: each test says what the lists, the import and the link answer.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), post: vi.fn<Call>() },
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const API = "https://api.test/api/v1/";

const series = (id: number, name: string, slug: string): VideoSeries => ({
  id,
  name,
  slug,
  playlist_id: null,
  sort_order: id,
  is_active: true,
  created_at: "2026-10-23T09:00:00Z",
  updated_at: "2026-10-23T09:00:00Z",
});

const SERIES = [series(1, "Beauty Vault Podcast", "beauty-vault-podcast"), series(2, "Expert Take", "expert-take")];

const ROW: VideoRow = {
  id: 41,
  slug: "glow-up-secrets",
  title: "Glow Up Secrets",
  youtube_id: "abcdefghijk",
  thumbnail: "https://i.ytimg.com/vi/abcdefghijk/maxresdefault.jpg",
  published_at: "2026-10-01T12:00:00Z",
  duration_seconds: 3723,
  is_featured: true,
  series: { id: 1, name: "Beauty Vault Podcast", slug: "beauty-vault-podcast" },
  status: "published",
  source: "sync",
};

const VIDEO: Video = {
  ...ROW,
  id: 42,
  slug: "lash-talk",
  title: "Lash Talk",
  youtube_id: "zyxwvutsrqp",
  source: "admin",
  description: null,
  featured_order: 0,
  people: [],
  topic_ids: [],
};

const answerGets = () =>
  vi.mocked(axios.get).mockImplementation(async (url) => {
    if (url === `${API}video-series/admin`) return { data: { data: SERIES } };
    if (url === `${API}videos/admin/list`) return { data: { data: { count: 1, rows: [ROW] } } };
    throw new Error(`Unexpected GET ${url}`);
  });

const EditScreen = () => <p>Editing video {useParams().id}</p>;

const renderPage = (path = "/watch/videos") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/watch/videos" element={<WatchVideos />} />
        <Route path="/watch/videos/:id" element={<EditScreen />} />
      </Routes>
    </MemoryRouter>,
  );

const listCalls = () => vi.mocked(axios.get).mock.calls.filter(([url]) => url === `${API}videos/admin/list`);

// Opens "Add from YouTube" and sends a link.
const addLink = async (url: string) => {
  fireEvent.click(await screen.findByRole("button", { name: /Add from YouTube/ }));
  const dialog = await screen.findByRole("dialog");
  fireEvent.change(within(dialog).getByLabelText("YouTube link"), { target: { value: url } });
  fireEvent.click(within(dialog).getByRole("button", { name: "Add video" }));
  return dialog;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Videos", () => {
  it("lists the videos with their series, source and length", async () => {
    answerGets();
    renderPage("/watch/videos?series=1");

    expect(await screen.findByText("Glow Up Secrets")).toBeInTheDocument();
    expect(screen.getByText("Playlist import")).toBeInTheDocument();
    expect(screen.getByText("1:02:03")).toBeInTheDocument();
    // The series screen's link opens the list on that series.
    expect(listCalls()[0][1]).toMatchObject({ params: { page: 1, limit: 50, series: 1 } });
  });

  it("adds a video from its link, in the series picked, and opens it", async () => {
    answerGets();
    vi.mocked(axios.post).mockResolvedValue({ status: 201, data: { data: { created: true, video: VIDEO } } });
    renderPage();
    await screen.findByText("Glow Up Secrets");

    fireEvent.click(screen.getByRole("button", { name: /Add from YouTube/ }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("YouTube link"), { target: { value: " https://youtu.be/zyxwvutsrqp " } });
    fireEvent.mouseDown(within(dialog).getByLabelText("Series"));
    fireEvent.click(await screen.findByTitle("Expert Take"));
    fireEvent.click(within(dialog).getByRole("button", { name: "Add video" }));

    expect(await screen.findByText("Editing video 42")).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith(`${API}videos/admin/import`, {
      url: "https://youtu.be/zyxwvutsrqp",
      series_id: 2,
    });
  });

  it("offers to open a video that's already here", async () => {
    answerGets();
    vi.mocked(axios.post).mockResolvedValue({ status: 200, data: { data: { created: false, video: VIDEO } } });
    renderPage();

    const dialog = await addLink("https://www.youtube.com/watch?v=zyxwvutsrqp");

    expect(await within(dialog).findByText('"Lash Talk" is already here')).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith(`${API}videos/admin/import`, {
      url: "https://www.youtube.com/watch?v=zyxwvutsrqp",
      series_id: undefined,
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Open it" }));
    expect(await screen.findByText("Editing video 42")).toBeInTheDocument();
  });

  it("puts a link YouTube can't use on the link field", async () => {
    answerGets();
    vi.mocked(axios.post).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: "This is not a public YouTube video.", code: "INVALID_VIDEO", details: { field: "url" } },
      },
    });
    renderPage();

    const dialog = await addLink("https://youtu.be/private0001");

    expect(await within(dialog).findByText("This is not a public YouTube video.")).toBeInTheDocument();
  });

  it("says when the server has no YouTube key", async () => {
    answerGets();
    vi.mocked(axios.post).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 503,
        data: { message: "YouTube is not set up on the server (YOUTUBE_API_KEY).", code: "YOUTUBE_NOT_CONFIGURED" },
      },
    });
    renderPage();

    await addLink("https://youtu.be/zyxwvutsrqp");

    expect(await screen.findByText(/The server has no YouTube key yet/)).toBeInTheDocument();
  });

  it("imports the playlists, says how many came in, and reloads the list", async () => {
    answerGets();
    vi.mocked(axios.post).mockResolvedValue({
      data: { data: { imported: 3, series: [{ series: "beauty-vault-podcast", imported: 3 }] } },
    });
    renderPage();
    await screen.findByText("Glow Up Secrets");

    fireEvent.click(screen.getByRole("button", { name: /Import playlists/ }));

    expect(await screen.findByText("3 new videos imported from YouTube")).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith(`${API}videos/admin/sync`);
    await waitFor(() => expect(listCalls()).toHaveLength(2));
  });

  it("names the series whose playlist YouTube couldn't read", async () => {
    answerGets();
    vi.mocked(axios.post).mockResolvedValue({
      data: {
        data: {
          imported: 1,
          series: [
            { series: "beauty-vault-podcast", imported: 1 },
            { series: "expert-take", imported: 0, error: "Request failed with status code 404" },
          ],
        },
      },
    });
    renderPage();
    await screen.findByText("Glow Up Secrets");

    fireEvent.click(screen.getByRole("button", { name: /Import playlists/ }));

    expect(
      await screen.findByText("1 new video imported. YouTube couldn't be read for Expert Take: Request failed with status code 404"),
    ).toBeInTheDocument();
  });
});
