import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation, useParams } from "react-router";
import axios from "axios";
import ProfilePages from "./ProfilePages";
import { websiteUrl } from "../../utils/website";
import type { PageRow } from "../../types/profile";

// No network in tests: each test says what the pages list answers.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), post: vi.fn<Call>(), put: vi.fn<Call>() },
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const LIST = "https://api.test/api/v1/profiles/admin/list";

const row = (fields: Partial<PageRow> = {}): PageRow => ({
  id: 812,
  slug: "revance",
  type: "brand",
  name: "Revance",
  image: null,
  tagline: "Skin care, made simple",
  city: null,
  state: null,
  specialty: null,
  is_featured: false,
  featured_order: 0,
  is_listed: true,
  created_by_admin: false,
  has_live_card: true,
  visible: true,
  claimed: true,
  ...fields,
});

const KATE = row({
  id: 9,
  slug: "kate-sue",
  type: "individual",
  name: "Kate Sue",
  tagline: null,
  specialty: "Lashes",
  is_listed: false,
  visible: false,
  has_live_card: false,
  claimed: false,
  is_featured: true,
  featured_order: 2,
});

const answer = (rows: PageRow[], count = rows.length) =>
  vi.mocked(axios.get).mockResolvedValue({ data: { data: { count, rows } } });

// Stands in for the page's screen: shows what the list handed it.
const PageScreen = () => {
  const { userId } = useParams();
  const { state } = useLocation();
  return <div>{`Page ${userId}, claimed: ${String((state as { claimed?: boolean } | null)?.claimed)}`}</div>;
};

const renderList = () =>
  render(
    <MemoryRouter initialEntries={["/pages"]}>
      <Routes>
        <Route path="/pages" element={<ProfilePages />} />
        <Route path="/pages/:userId" element={<PageScreen />} />
      </Routes>
    </MemoryRouter>,
  );

const lastQuery = () => vi.mocked(axios.get).mock.lastCall?.[1];

describe("Professional and brand pages: the list", () => {
  beforeEach(() => vi.mocked(axios.get).mockReset());

  it("asks for the first 50 pages and shows how each one stands", async () => {
    answer([row(), KATE]);
    renderList();

    expect(await screen.findByText("Revance")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(LIST, { params: { page: 1, limit: 50 } });

    // A shown page links to the website; a hidden one doesn't.
    expect(screen.getByRole("link", { name: "/revance" })).toHaveAttribute("href", websiteUrl("/profiles/revance"));
    expect(screen.queryByRole("link", { name: "/kate-sue" })).not.toBeInTheDocument();
    expect(screen.getByText("Skin care, made simple")).toBeInTheDocument();
    expect(screen.getByText("Lashes")).toBeInTheDocument();

    expect(screen.getByText("Shown")).toBeInTheDocument();
    expect(screen.getByText("Live card")).toBeInTheDocument();
    expect(screen.getByText("Hidden: unlisted")).toBeInTheDocument();
    expect(screen.getByText("Unclaimed")).toBeInTheDocument();
    expect(screen.getByText("Order 2")).toBeInTheDocument();
  });

  it("sends the type, featured and search filters with the request, from the first page", async () => {
    answer([row()], 120);
    renderList();
    await screen.findByText("Revance");

    fireEvent.click(screen.getByTitle("2"));
    await waitFor(() => expect(lastQuery()).toEqual({ params: { page: 2, limit: 50 } }));

    fireEvent.click(screen.getByText("Brands"));
    await waitFor(() => expect(lastQuery()).toEqual({ params: { page: 1, limit: 50, type: "brand" } }));

    fireEvent.click(screen.getByRole("switch", { name: "Featured only" }));
    await waitFor(() =>
      expect(lastQuery()).toEqual({ params: { page: 1, limit: 50, type: "brand", featured: "true" } }),
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Search pages" }), { target: { value: " kate " } });
    await waitFor(() =>
      expect(lastQuery()).toEqual({
        params: { page: 1, limit: 50, type: "brand", featured: "true", search: "kate" },
      }),
    );

    fireEvent.click(screen.getByText("All"));
    await waitFor(() =>
      expect(lastQuery()).toEqual({ params: { page: 1, limit: 50, featured: "true", search: "kate" } }),
    );
  });

  it("tells the page's screen whether the account can sign in", async () => {
    answer([row(), KATE]);
    renderList();
    await screen.findByText("Kate Sue");

    fireEvent.click(screen.getByRole("link", { name: "Kate Sue" }));

    expect(await screen.findByText("Page 9, claimed: false")).toBeInTheDocument();
  });
});
