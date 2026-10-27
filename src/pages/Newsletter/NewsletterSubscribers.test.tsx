import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axios from "axios";
import NewsletterSubscribers from "./NewsletterSubscribers";
import * as csv from "../../utils/csv";

// No network in tests: each test says what the list, export and delete answer.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), post: vi.fn<Call>() },
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const LIST = "https://api.test/api/v1/newsletter/list";

const subscriber = (id: number, email: string, source = "footer") => ({
  id,
  email,
  first_name: null,
  last_name: null,
  source,
  created_at: "2026-10-20T10:00:00Z",
  updated_at: "2026-10-20T10:00:00Z",
});

const listed = (rows: ReturnType<typeof subscriber>[], count = rows.length) => ({ data: { data: { count, rows } } });

const renderPage = () =>
  render(
    <MemoryRouter>
      <NewsletterSubscribers />
    </MemoryRouter>,
  );

const lastListParams = () => {
  const calls = vi.mocked(axios.get).mock.calls.filter(([url]) => url === LIST);
  const config = calls.at(-1)?.[1] as { params: Record<string, unknown> } | undefined;
  return config?.params;
};

describe("Newsletter subscribers", () => {
  it("lists the first page, 50 at a time, and searches on the server", async () => {
    vi.mocked(axios.get).mockResolvedValue(listed([subscriber(1, "ana@example.com")], 120));
    renderPage();

    expect(await screen.findByText("ana@example.com")).toBeInTheDocument();
    expect(lastListParams()).toMatchObject({ page: 1, limit: 50 });

    fireEvent.change(screen.getByPlaceholderText("Search email or name"), { target: { value: " ana " } });
    await waitFor(() => expect(lastListParams()).toMatchObject({ page: 1, search: "ana" }));
  });

  it("exports what the filters show as a CSV file", async () => {
    vi.mocked(axios.get).mockImplementation(async (url) =>
      url === LIST ? listed([subscriber(1, "ana@example.com")]) : { data: new Blob(["Email\r\n"]) },
    );
    const save = vi.spyOn(csv, "saveFile").mockImplementation(() => {});
    renderPage();
    await screen.findByText("ana@example.com");

    fireEvent.click(screen.getByRole("button", { name: /Export CSV/ }));

    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.calls[0][1]).toMatch(/^newsletter-subscribers-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(axios.get).toHaveBeenCalledWith("https://api.test/api/v1/newsletter/export", {
      params: { search: undefined, source: undefined },
      responseType: "blob",
    });
  });

  it("removes a subscriber after confirming", async () => {
    vi.mocked(axios.get).mockResolvedValue(listed([subscriber(7, "bo@example.com")]));
    vi.mocked(axios.post).mockResolvedValue({ data: { data: { deleted: 1 } } });
    renderPage();
    await screen.findByText("bo@example.com");

    fireEvent.click(screen.getByRole("button", { name: "Remove bo@example.com" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Remove" }));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith("https://api.test/api/v1/newsletter/delete", { ids: [7] }),
    );
    expect(await screen.findByText("1 subscriber removed")).toBeInTheDocument();
  });
});
