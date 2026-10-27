import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation, useParams } from "react-router";
import axios from "axios";
import NewBrandPage from "./NewBrandPage";

// No network in tests: each test says what creating the page answers.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), post: vi.fn<Call>(), put: vi.fn<Call>() },
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const BRANDS = "https://api.test/api/v1/profiles/admin/brands";

// Stands in for the page's screen: shows what it was handed.
const PageScreen = () => {
  const { userId } = useParams();
  const { state } = useLocation();
  const { claimed, created } = (state ?? {}) as { claimed?: boolean; created?: boolean };
  return <div>{`Page ${userId}, claimed: ${String(claimed)}, created: ${String(created)}`}</div>;
};

const renderForm = () =>
  render(
    <MemoryRouter initialEntries={["/pages/new"]}>
      <Routes>
        <Route path="/pages/new" element={<NewBrandPage />} />
        <Route path="/pages/:userId" element={<PageScreen />} />
      </Routes>
    </MemoryRouter>,
  );

const fillAndCreate = () => {
  fireEvent.change(screen.getByRole("textbox", { name: "Brand name" }), { target: { value: " Revance " } });
  fireEvent.change(screen.getByRole("textbox", { name: "Email" }), { target: { value: "hello@revance.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Create brand page" }));
};

describe("Professional and brand pages: a new brand page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates the page and opens its screen, which offers the claim email", async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { data: { user_id: 900 } } });
    renderForm();

    fillAndCreate();

    expect(await screen.findByText("Page 900, claimed: false, created: true")).toBeInTheDocument();
    // No address given: the API makes one from the name.
    expect(axios.post).toHaveBeenCalledWith(BRANDS, {
      name: "Revance",
      email: "hello@revance.com",
      is_listed: true,
      is_featured: false,
      featured_order: 0,
      tagline: null,
      about: null,
      website: null,
      social: null,
      image: null,
      cover_image: null,
    });
  });

  it("offers the page of the account that already has the email", async () => {
    vi.mocked(axios.post).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          success: false,
          status: 409,
          message: "This email already has an account: edit its page instead.",
          code: "ACCOUNT_EXISTS",
          details: { user_id: 77 },
        },
      },
    });
    renderForm();

    fillAndCreate();

    // On the email field, and as the warning with the way out.
    await waitFor(() => expect(screen.getAllByText("This email already has an account")).toHaveLength(2));
    fireEvent.click(screen.getByRole("button", { name: "Open its page" }));

    expect(await screen.findByText(/^Page 77/)).toBeInTheDocument();
  });
});
