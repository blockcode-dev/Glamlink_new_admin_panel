import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AccessPricing from "./AccessPricing";
import type { AccessCatalog, AccessProduct } from "../../types/access";

// No network in tests: each test says what the API answers.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), post: vi.fn<Call>(), put: vi.fn<Call>(), patch: vi.fn<Call>() },
    // utils/apiError reads failures through this.
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const API = "https://api.test/api/v1/";

const product = (id: number, code: string, name: string, cents: number, monthly: boolean): AccessProduct => ({
  id,
  code,
  name,
  kind: monthly ? "subscription" : "one_time",
  amount_cents: cents,
  currency: "usd",
  billing_interval: monthly ? "month" : null,
  stripe_product_id: null,
  stripe_price_id: null,
  is_active: true,
  created_at: "2026-10-16T12:00:00.000Z",
  updated_at: "2026-10-16T12:00:00.000Z",
});

const pro = product(1, "pro", "Access Pro", 499, true);

const catalog: AccessCatalog = {
  products: [pro, product(2, "keychain", "NFC keychain", 3999, false), product(3, "shipping", "Shipping", 0, false)],
  plans: [],
  settings: {
    entitlements: {
      free: { photos: 4, videos: 1, edit_details: true, edit_media: false, special_offers: false, analytics: false, priority_search: false },
      pro: { photos: 4, videos: 1, edit_details: true, edit_media: true, special_offers: true, analytics: true, priority_search: true },
    },
    keychains_per_person: 1,
    shipping: {
      mode: "live",
      flat_amount_cents: 0,
      countries: ["US"],
      parcel: { length: 4, width: 4, height: 1, distance_unit: "in", weight: 0.2, mass_unit: "lb" },
    },
  },
  discounts: [],
  active_discount: null,
};

/** Answers each GET by its path under the API. */
const answerGets = (routes: Record<string, unknown>) => {
  vi.mocked(axios.get).mockImplementation((url) => {
    const path = String(url).replace(API, "");
    return path in routes
      ? Promise.resolve({ data: { success: true, data: routes[path] } })
      : Promise.reject(new Error(`No answer for GET ${path}`));
  });
};

const renderTab = (tab: string) =>
  render(
    <MemoryRouter initialEntries={[`/access-pricing?tab=${tab}`]}>
      <AccessPricing />
    </MemoryRouter>,
  );

describe("Access pricing: prices", () => {
  it("sends the new price in whole cents, moves subscribers when asked, and says who moved", async () => {
    answerGets({ "access/admin/catalog": catalog, "access/admin/price-changes": [], "admin/list": [] });
    vi.mocked(axios.put).mockResolvedValue({
      data: {
        data: {
          product: { ...pro, amount_cents: 599 },
          moved: 3,
          failed: [{ user_id: 12, error: "No such subscription: sub_123" }],
        },
      },
    });
    renderTab("prices");

    fireEvent.click(await screen.findByRole("button", { name: "Change the price of Access Pro" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByRole("spinbutton"), { target: { value: "5.99" } });
    fireEvent.click(within(dialog).getByRole("checkbox", { name: /Move paying subscribers to this price/ }));
    fireEvent.click(within(dialog).getByRole("button", { name: /Change price/ }));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(`${API}access/admin/products/pro/price`, {
        amount_cents: 599,
        move_subscribers: true,
      }),
    );
    expect(await screen.findByText(/3 paying subscribers move to it at their next renewal/)).toBeInTheDocument();
    expect(screen.getByText(/No such subscription: sub_123/)).toBeInTheDocument();
  });

  it("doesn't offer to move subscribers for the keychain", async () => {
    answerGets({ "access/admin/catalog": catalog, "access/admin/price-changes": [], "admin/list": [] });
    vi.mocked(axios.put).mockResolvedValue({ data: { data: { product: { ...catalog.products[1], amount_cents: 2999 } } } });
    renderTab("prices");

    fireEvent.click(await screen.findByRole("button", { name: "Change the price of NFC keychain" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).queryByRole("checkbox")).not.toBeInTheDocument();
    fireEvent.change(within(dialog).getByRole("spinbutton"), { target: { value: "29.99" } });
    fireEvent.click(within(dialog).getByRole("button", { name: /Change price/ }));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(`${API}access/admin/products/keychain/price`, { amount_cents: 2999 }),
    );
  });
});

describe("Access pricing: plans", () => {
  it("saves the whole plan, keeping each feature's soon and keychain marks", async () => {
    const features = [
      { text: "Directory listing & digital card" },
      { text: "Performance analytics", soon: true },
      { text: "NFC keychain — tap to share your profile", highlight: "keychain" },
    ];
    const plan = {
      id: 4,
      code: "nfc_with_subscription",
      name: "Pro + keychain",
      label: "Pro",
      badge: "Most popular",
      tagline: "Full Pro plan with the NFC keychain included.",
      products: ["pro", "keychain"],
      features,
      sort_order: 4,
      is_active: true,
      created_at: "2026-10-16T12:00:00.000Z",
      updated_at: "2026-10-16T12:00:00.000Z",
    };
    answerGets({ "access/admin/catalog": { ...catalog, plans: [plan] } });
    vi.mocked(axios.put).mockResolvedValue({ data: { data: { ...plan, badge: "Best value" } } });
    renderTab("plans");

    expect(await screen.findByText("$4.99 / month + $39.99 one-time")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit Pro + keychain" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Badge"), { target: { value: "Best value" } });
    fireEvent.click(within(dialog).getByRole("button", { name: /Save/ }));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(`${API}access/admin/plans/nfc_with_subscription`, {
        name: "Pro + keychain",
        label: "Pro",
        badge: "Best value",
        tagline: "Full Pro plan with the NFC keychain included.",
        features,
        products: ["pro", "keychain"],
        sort_order: 4,
        is_active: true,
      }),
    );
  });
});

describe("Access pricing: settings", () => {
  it("saves the whole shipping setting, in cents", async () => {
    answerGets({ "access/admin/catalog": catalog });
    const shipping = { ...catalog.settings.shipping, mode: "flat" as const, flat_amount_cents: 500 };
    vi.mocked(axios.put).mockResolvedValue({ data: { data: { ...catalog.settings, shipping } } });
    renderTab("settings");

    fireEvent.click(await screen.findByRole("radio", { name: "A flat amount" }));
    fireEvent.change(screen.getByLabelText("Flat amount"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /Save shipping/ }));

    await waitFor(() => expect(axios.put).toHaveBeenCalledWith(`${API}access/admin/settings`, { shipping }));
  });
});

describe("Access pricing: discounts", () => {
  it("says only one sale can run at a time when the dates overlap another", async () => {
    answerGets({ "access/admin/catalog": catalog, "access/admin/discounts": [] });
    vi.mocked(axios.post).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          success: false,
          message: 'Another discount runs then: "Launch".',
          code: "DISCOUNT_OVERLAPS",
          details: { discount_id: 4 },
        },
      },
    });
    renderTab("discounts");

    fireEvent.click(await screen.findByRole("button", { name: /New discount/ }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Name"), { target: { value: "Spring sale" } });
    fireEvent.change(within(dialog).getByRole("spinbutton", { name: "Percent off" }), { target: { value: "20" } });
    fireEvent.click(within(dialog).getByRole("button", { name: /Create discount/ }));

    expect(
      await within(dialog).findByText('Only one sale can run at a time. Another discount runs then: "Launch".'),
    ).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith(`${API}access/admin/discounts`, {
      name: "Spring sale",
      percent_off: 20,
      applies_to: ["pro"],
      duration: "once",
    });
  });
});
