import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import axios from "axios";
import EditProfilePage from "./EditProfilePage";
import type { PageSettings, PageView } from "../../types/profile";

// No network in tests: each test says what the page and the save answer.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), post: vi.fn<Call>(), put: vi.fn<Call>() },
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const PAGE = "https://api.test/api/v1/profiles/admin/812";

// A brand with a live card and nothing set on its page: everything shown comes from the card.
const view = (page: Partial<PageSettings> = {}, fields: Partial<PageView> = {}): PageView => ({
  user_id: 812,
  slug: "revance",
  visible: true,
  hidden_because: null,
  page: {
    slug: null,
    is_listed: true,
    is_featured: false,
    featured_order: 0,
    created_by_admin: false,
    tagline: null,
    about: null,
    image: null,
    cover_image: null,
    website: null,
    social: null,
    ...page,
  },
  public: {
    id: 812,
    slug: "revance",
    type: "brand",
    name: "Revance",
    image: "https://api.test/images/card.jpg",
    tagline: "The card's title",
    city: null,
    state: null,
    specialty: null,
    is_featured: false,
    cover_image: null,
    about: "<p>The card's bio</p>",
    website: "https://revance.com",
    social: [{ title: "Instagram", url: "https://www.instagram.com/revance" }],
    location: null,
    specialties: [],
    email: null,
    phone: null,
    booking_link: null,
    access_card: { slug: "revance", url: "https://glamlink.net/access/revance" },
    listing: null,
    topics: [],
  },
  ...fields,
});

const refusal = (status: number, code: string, message: string, details?: object) => ({
  isAxiosError: true,
  response: { status, data: { success: false, status, message, code, details } },
});

const renderPage = (state?: object) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: "/pages/812", state }]}>
      <Routes>
        <Route path="/pages/:userId" element={<EditProfilePage />} />
      </Routes>
    </MemoryRouter>,
  );

const save = () => fireEvent.click(screen.getByRole("button", { name: "Save page" }));

describe("Professional and brand pages: one page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saves the form's fields only, leaving the card's handle and links alone", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { data: view() } });
    vi.mocked(axios.put).mockResolvedValue({ data: { data: view({ tagline: "Skin care, made simple" }) } });
    renderPage({ claimed: true });

    const tagline = await screen.findByRole("textbox", { name: "Tagline" });
    // An empty field shows what the page falls back to.
    expect(tagline).toHaveAttribute("placeholder", "The card's title");
    expect(screen.getByRole("textbox", { name: "Address" })).toHaveValue("revance");

    fireEvent.change(tagline, { target: { value: "Skin care, made simple" } });
    save();

    expect(await screen.findByText("Page saved")).toBeInTheDocument();
    expect(axios.put).toHaveBeenCalledWith(PAGE, {
      is_listed: true,
      is_featured: false,
      featured_order: 0,
      tagline: "Skin care, made simple",
      about: null,
      website: null,
      social: null,
      image: null,
      cover_image: null,
    });
  });

  it("sends a new address, and shows the API's refusal on that field", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { data: view() } });
    vi.mocked(axios.put).mockRejectedValue(
      refusal(400, "INVALID_PAGE", "This slug is taken.", { field: "slug" }),
    );
    renderPage({ claimed: true });

    fireEvent.change(await screen.findByRole("textbox", { name: "Address" }), { target: { value: "Revance Skin" } });
    save();

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(vi.mocked(axios.put).mock.lastCall?.[1]).toMatchObject({ slug: "revance-skin" });
    // On the field, and in the message (the field may be out of view).
    await waitFor(() => expect(screen.getAllByText("This slug is taken.")).toHaveLength(2));
  });

  it("says why a page is hidden", async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        data: view(
          { is_listed: false },
          { visible: false, hidden_because: "no_live_card", public: { ...view().public, access_card: null } },
        ),
      },
    });
    renderPage({ claimed: true });

    expect(await screen.findByText("Hidden from the website")).toBeInTheDocument();
    expect(screen.getByText(/It is unlisted/)).toBeInTheDocument();
    expect(screen.getByText(/It has no live Access card/)).toBeInTheDocument();
  });

  it("offers the claim email when it isn't known whether the account can sign in", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { data: view() } });
    vi.mocked(axios.post).mockRejectedValue(
      refusal(409, "ALREADY_CLAIMED", "This account already has a password: it can sign in."),
    );
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: /Send claim email/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Send" }));

    expect(await screen.findByText(/This account can already sign in/)).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith(`${PAGE}/invite`);
    await waitFor(() => expect(screen.queryByRole("button", { name: /Send claim email/ })).not.toBeInTheDocument());
  });

  it("doesn't offer the claim email to an account that can sign in", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { data: view() } });
    renderPage({ claimed: true });

    await screen.findByRole("textbox", { name: "Tagline" });
    expect(screen.queryByRole("button", { name: /Send claim email/ })).not.toBeInTheDocument();
  });
});
