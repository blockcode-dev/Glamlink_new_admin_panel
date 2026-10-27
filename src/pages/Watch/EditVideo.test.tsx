import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import axios from "axios";
import EditVideo from "./EditVideo";
import type { Video } from "../../types/video";

// No network in tests: each test says what the video and the saves answer.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), put: vi.fn<Call>() },
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const API = "https://api.test/api/v1/";

const VIDEO: Video = {
  id: 42,
  slug: "lash-talk",
  title: "Lash Talk",
  youtube_id: "zyxwvutsrqp",
  thumbnail: "https://i.ytimg.com/vi/zyxwvutsrqp/maxresdefault.jpg",
  published_at: "2026-10-01T12:00:00Z",
  duration_seconds: 485,
  is_featured: false,
  series: null,
  status: "published",
  source: "sync",
  description: "From YouTube.",
  featured_order: 0,
  people: [
    { user_id: 5, role: "host" },
    { user_id: 6, role: "guest" },
  ],
  // 99 was made inactive since: it isn't in the topics list.
  topic_ids: [3, 99, 1],
};

const TOPICS = [
  { id: 1, name: "Lashes" },
  { id: 3, name: "Brows" },
  { id: 4, name: "Facials" },
];

const ACCOUNTS: Record<number, string> = { 5: "Vault Host", 6: "Guest Star" };

const answerGets = (video: Video = VIDEO) =>
  vi.mocked(axios.get).mockImplementation(async (url) => {
    const path = url.replace(API, "");
    if (path === `videos/admin/${video.id}`) return { data: { data: video } };
    if (path === "video-series/admin") return { data: { data: [] } };
    if (path === "journal/topic") return { data: { data: TOPICS } };
    const account = Number(path.match(/^profiles\/admin\/(\d+)$/)?.[1]);
    if (account) return { data: { data: { slug: null, visible: true, public: { name: ACCOUNTS[account], type: "individual" } } } };
    throw new Error(`Unexpected GET ${url}`);
  });

// Each save answers the video with what was sent.
const answerPuts = () =>
  vi.mocked(axios.put).mockImplementation(async (_url, body) => ({ data: { data: { ...VIDEO, ...(body as object) } } }));

const renderPage = (id = 42) =>
  render(
    <MemoryRouter initialEntries={[`/watch/videos/${id}`]}>
      <Routes>
        <Route path="/watch/videos/:id" element={<EditVideo />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Editing a video", () => {
  it("saves its fields: a blank slug is left out, no series is empty", async () => {
    answerGets();
    answerPuts();
    renderPage();

    fireEvent.change(await screen.findByDisplayValue("lash-talk"), { target: { value: "  " } });
    fireEvent.click(screen.getByLabelText("Draft"));
    fireEvent.click(screen.getByRole("button", { name: "Save video" }));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(`${API}videos/admin/42`, {
        title: "Lash Talk",
        description: "From YouTube.",
        series_id: "",
        status: "draft",
        is_featured: false,
        featured_order: 0,
      }),
    );
  });

  it("shows a refusal on the field it names", async () => {
    answerGets();
    vi.mocked(axios.put).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: "This slug is taken.", code: "INVALID_VIDEO", details: { field: "slug" } },
      },
    });
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Save video" }));

    expect((await screen.findAllByText("This slug is taken.")).length).toBeGreaterThan(0);
  });

  it("saves the people left, with their parts", async () => {
    answerGets();
    answerPuts();
    renderPage();

    expect(await screen.findByText("Guest Star")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove person 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Save people" }));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(`${API}videos/admin/42/people`, { people: [{ user_id: 5, role: "host" }] }),
    );
  });

  it("saves the topics in the order picked, without inactive ones", async () => {
    answerGets();
    answerPuts();
    renderPage();

    const topics = await screen.findByLabelText("Topics");
    fireEvent.mouseDown(topics);
    fireEvent.click(await screen.findByTitle("Facials"));
    fireEvent.click(screen.getByRole("button", { name: "Save topics" }));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(`${API}videos/admin/42/topics`, { topic_ids: [3, 1, 4] }),
    );
  });

  it("says when the video doesn't exist", async () => {
    vi.mocked(axios.get).mockImplementation(async (url) => {
      if (url === `${API}videos/admin/404`) throw { isAxiosError: true, response: { status: 404, data: { code: "NOT_FOUND" } } };
      return { data: { data: [] } };
    });
    renderPage(404);

    expect(await screen.findByText("There's no such video.")).toBeInTheDocument();
  });
});
