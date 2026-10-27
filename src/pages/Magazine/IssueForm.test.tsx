import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import axios from "axios";
import IssueForm from "./IssueForm";
import type { MagazineIssue } from "../../types/magazine";

// No network in tests: each test says what the issue and the saves answer.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), post: vi.fn<Call>(), put: vi.fn<Call>(), delete: vi.fn<Call>() },
    // utils/apiError reads failures through this.
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const API = "https://api.test/api/v1/";

// One of the issues loaded from the old website: its cover is still on the website's host.
const ISSUE: MagazineIssue = {
  id: 7,
  slug: "issue-117",
  title: "Issue 117",
  issue_number: 117,
  cover_image: "https://glamlink.net/magazine/issue117.png",
  publish_date: "2026-11-01",
  short_description: null,
  is_featured: false,
  flipbook: {
    publuu_account_id: 992531,
    publuu_flipbook_id: 2578509,
    url: "https://publuu.com/flip-book/992531/2578509/page/1?embed",
  },
  status: "published",
  sort_order: 117,
  features: [
    { user_id: 5, role: "cover", page_number: 1 },
    { user_id: 6, role: "mentioned", page_number: null },
  ],
};

// Accounts the people picker shows: their names come from GET profiles/admin/:id, a search from profiles/admin/list.
const ACCOUNTS: Record<number, string> = { 5: "Cover Star", 6: "Mentioned Brand", 8: "New Face" };

const answerGets = (...issues: MagazineIssue[]) =>
  vi.mocked(axios.get).mockImplementation(async (url) => {
    const path = url.replace(API, "");
    const issue = issues.find((i) => path === `magazine/admin/${i.id}`);
    if (issue) return { data: { data: issue } };
    const account = Number(path.match(/^profiles\/admin\/(\d+)$/)?.[1]);
    if (account) return { data: { data: { slug: null, visible: true, public: { name: ACCOUNTS[account], type: "individual" } } } };
    if (path === "profiles/admin/list") {
      return { data: { data: { count: 1, rows: [{ id: 8, name: "New Face", slug: "newface", type: "individual", visible: true }] } } };
    }
    throw new Error(`Unexpected GET ${url}`);
  });

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/magazine/add" element={<IssueForm />} />
        <Route path="/magazine/edit/:id" element={<IssueForm />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Magazine issue form", () => {
  it("adds an issue with what was filled in, then opens it to add its people", async () => {
    const created: MagazineIssue = { ...ISSUE, id: 9, slug: "issue-118", title: "Issue 118", features: [] };
    answerGets(created);
    vi.mocked(axios.post).mockResolvedValue({ data: { data: created } });
    renderAt("/magazine/add");

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "  Issue 118 " } });
    fireEvent.change(screen.getByLabelText("Issue number"), { target: { value: "118" } });
    fireEvent.change(screen.getByLabelText("Short description"), { target: { value: "The winter issue" } });
    fireEvent.change(screen.getByLabelText("Flipbook link"), { target: { value: "https://example.com/book" } });
    fireEvent.click(screen.getByLabelText("Draft"));
    fireEvent.click(screen.getByRole("button", { name: "Add issue" }));

    // No slug (made from the title) and no cover; the sort order is the issue number.
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(`${API}magazine/admin`, {
        title: "Issue 118",
        issue_number: 118,
        publish_date: null,
        publuu_account_id: null,
        publuu_flipbook_id: null,
        flipbook_url: "https://example.com/book",
        short_description: "The winter issue",
        status: "draft",
        sort_order: 118,
        is_featured: false,
      }),
    );
    expect(await screen.findByText("People in this issue")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(`${API}magazine/admin/9`);
  });

  it("saves an issue's fields, leaving out the cover it already had", async () => {
    answerGets(ISSUE);
    vi.mocked(axios.put).mockImplementation(async (_url, body) => ({ data: { data: { ...ISSUE, ...(body as object) } } }));
    renderAt("/magazine/edit/7");

    fireEvent.change(await screen.findByDisplayValue("Issue 117"), { target: { value: "Issue 117: Winter" } });
    fireEvent.click(screen.getByRole("button", { name: "Save issue" }));

    // The Publuu ids come from the flipbook the API answers; the date goes back as it came.
    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(`${API}magazine/admin/7`, {
        title: "Issue 117: Winter",
        slug: "issue-117",
        issue_number: 117,
        publish_date: "2026-11-01",
        publuu_account_id: 992531,
        publuu_flipbook_id: 2578509,
        flipbook_url: "",
        short_description: "",
        status: "published",
        sort_order: 117,
        is_featured: false,
      }),
    );
  });

  it("sends a removed cover as empty", async () => {
    answerGets(ISSUE);
    vi.mocked(axios.put).mockResolvedValue({ data: { data: { ...ISSUE, cover_image: null } } });
    renderAt("/magazine/edit/7");

    fireEvent.click(await screen.findByRole("button", { name: /Remove$/ }));
    fireEvent.click(screen.getByRole("button", { name: "Save issue" }));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(vi.mocked(axios.put).mock.calls[0][1]).toMatchObject({ cover_image: "" });
  });

  it("shows a refusal on the field it names", async () => {
    answerGets(ISSUE);
    vi.mocked(axios.put).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: "This slug is taken.", code: "INVALID_ISSUE", details: { field: "slug" } },
      },
    });
    renderAt("/magazine/edit/7");

    fireEvent.click(await screen.findByRole("button", { name: "Save issue" }));

    expect((await screen.findAllByText("This slug is taken.")).length).toBeGreaterThan(0);
  });

  it("says when the issue doesn't exist", async () => {
    vi.mocked(axios.get).mockRejectedValue({ isAxiosError: true, response: { status: 404, data: { code: "NOT_FOUND" } } });
    renderAt("/magazine/edit/404");

    expect(await screen.findByText(/There's no such issue/)).toBeInTheDocument();
  });
});

describe("People in an issue", () => {
  it("saves the people left, with their part and page", async () => {
    answerGets(ISSUE);
    vi.mocked(axios.put).mockResolvedValue({ data: { data: { ...ISSUE, features: [ISSUE.features[0]] } } });
    renderAt("/magazine/edit/7");

    expect(await screen.findByText("Mentioned Brand")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove person 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Save people" }));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(`${API}magazine/admin/7/features`, {
        features: [{ user_id: 5, role: "cover", page_number: 1 }],
      }),
    );
  });

  it("adds a person picked by name", async () => {
    answerGets({ ...ISSUE, features: [] });
    vi.mocked(axios.put).mockImplementation(async (_url, body) => ({ data: { data: { ...ISSUE, ...(body as object) } } }));
    renderAt("/magazine/edit/7");

    fireEvent.click(await screen.findByRole("button", { name: /Add a person/ }));
    // The new row's picker: open it, then pick from the accounts it lists.
    const [picker] = screen.getAllByRole("combobox");
    fireEvent.mouseDown(picker);
    fireEvent.click(await screen.findByText("New Face"));
    fireEvent.change(screen.getByLabelText("Page of person 1"), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "Save people" }));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(`${API}magazine/admin/7/features`, {
        features: [{ user_id: 8, role: "featured", page_number: 12 }],
      }),
    );
  });

  it("shows a refusal of the list under it", async () => {
    answerGets(ISSUE);
    vi.mocked(axios.put).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: "6 is not a professional or brand account.", code: "INVALID_ISSUE", details: { field: "features" } },
      },
    });
    renderAt("/magazine/edit/7");

    fireEvent.click(await screen.findByRole("button", { name: "Save people" }));

    // Under the list, and in the toast.
    await waitFor(() => expect(screen.getAllByText("6 is not a professional or brand account.")).toHaveLength(2));
  });

  it("asks for an account on a row left empty", async () => {
    answerGets({ ...ISSUE, features: [] });
    renderAt("/magazine/edit/7");

    fireEvent.click(await screen.findByRole("button", { name: /Add a person/ }));
    fireEvent.click(screen.getByRole("button", { name: "Save people" }));

    expect(await screen.findByText("Pick a professional or brand, or remove this row")).toBeInTheDocument();
    expect(axios.put).not.toHaveBeenCalled();
  });
});
