import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axios from "axios";
import MagazineIssues from "./MagazineIssues";
import type { IssueRow } from "../../types/magazine";

// No network in tests: each test says what the list and the delete answer.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), delete: vi.fn<Call>() },
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const LIST = "https://api.test/api/v1/magazine/admin/list";

const issue = (id: number, title: string, status: IssueRow["status"] = "published"): IssueRow => ({
  id,
  slug: title.toLowerCase().replace(/\s+/g, "-"),
  title,
  issue_number: id,
  cover_image: null,
  publish_date: "2026-11-01",
  short_description: null,
  is_featured: false,
  flipbook: null,
  status,
  sort_order: id,
});

const listed = (rows: IssueRow[], count = rows.length) => ({ data: { data: { count, rows } } });

const lastListParams = () => {
  const calls = vi.mocked(axios.get).mock.calls.filter(([url]) => url === LIST);
  const config = calls.at(-1)?.[1] as { params: Record<string, unknown> } | undefined;
  return config?.params;
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <MagazineIssues />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Magazine issues", () => {
  it("lists 50 a page and searches titles on the server", async () => {
    vi.mocked(axios.get).mockResolvedValue(listed([issue(117, "Issue 117"), issue(118, "Issue 118", "draft")], 60));
    renderPage();

    expect(await screen.findByText("Issue 117")).toBeInTheDocument();
    expect(screen.getByText("/magazine/issue-117")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(lastListParams()).toMatchObject({ page: 1, limit: 50 });

    fireEvent.change(screen.getByPlaceholderText("Search titles"), { target: { value: " winter " } });
    await waitFor(() => expect(lastListParams()).toMatchObject({ page: 1, search: "winter" }));
  });

  it("deletes an issue after confirming, then reloads", async () => {
    vi.mocked(axios.get).mockResolvedValue(listed([issue(117, "Issue 117")]));
    vi.mocked(axios.delete).mockResolvedValue({ data: { data: { deleted: true } } });
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Delete Issue 117" }));
    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledWith("https://api.test/api/v1/magazine/admin/117"));
    await waitFor(() => expect(vi.mocked(axios.get).mock.calls.filter(([url]) => url === LIST)).toHaveLength(2));
  });
});
