import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import axios from "axios";
import AccessOrders from "./AccessOrders";
import type { AccessOrder } from "../../types/businessCard";
import type { ShippingRate } from "../../types/access";

// No network in tests: each test says what the API answers.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), post: vi.fn<Call>(), patch: vi.fn<Call>() },
    // utils/apiError reads failures through this.
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const API = "https://api.test/api/v1/";

const keychainOrder: AccessOrder = {
  id: 7,
  order_number: "GL-20261020-000007",
  created_at: "2026-10-20T17:00:00.000Z",
  customer_name: "Jane Smith",
  customer_email: "jane@example.com",
  amount_paid: "44.99",
  shipping_amount: "5.00",
  payment_status: "paid",
  fulfillment_status: "pending",
  recipient_name: "Jane Smith",
  shipping_address_line_1: "1 Main St",
  shipping_city: "Las Vegas",
  shipping_state: "NV",
  shipping_postal_code: "89101",
  shipping_country: "US",
  carrier: "USPS",
  service: "Ground Advantage",
  shippo_rate_id: "rate_checkout",
  shippo_transaction_id: null,
  label_url: null,
  tracking_number: null,
  tracking_link: null,
  tracking_status: null,
  business_card: { business_card_link: "https://glamlink.net/jane-smith" },
};

// Access Pro bought alone: an order for the record, nothing to ship.
const proOrder: AccessOrder = {
  id: 8,
  order_number: "GL-20261021-000008",
  created_at: "2026-10-21T17:00:00.000Z",
  customer_name: "Lee Park",
  customer_email: "lee@example.com",
  amount_paid: "4.99",
  shipping_amount: "0.00",
  payment_status: "paid",
  fulfillment_status: null,
  shipping_address_line_1: null,
  business_card: { business_card_link: "https://glamlink.net/lee-park" },
};

const rate = (rate_id: string, provider: string, service: string, amount_cents: number, days: number): ShippingRate => ({
  rate_id,
  amount_cents,
  currency: "usd",
  provider,
  service,
  service_token: null,
  estimated_days: days,
  duration_terms: null,
  attributes: [],
});

/** Answers each GET by its path under the API. */
const answerGets = (routes: Record<string, unknown>) => {
  vi.mocked(axios.get).mockImplementation((url) => {
    const path = String(url).replace(API, "");
    return path in routes
      ? Promise.resolve({ data: { success: true, data: routes[path] } })
      : Promise.reject(new Error(`No answer for GET ${path}`));
  });
};

const ordersList = {
  data: [keychainOrder, proOrder],
  pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
};

// The admin's order email links to /access-orders/:id, which opens that order.
const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/access-orders/:id?" element={<AccessOrders />} />
      </Routes>
    </MemoryRouter>,
  );

/** The rate picker that "Buy label" opens over the order's details. */
const openRatePicker = async (details: HTMLElement) => {
  fireEvent.click(within(details).getByRole("button", { name: /Buy label/ }));
  const title = await screen.findByText("Buy a label for GL-20261020-000007");
  return title.closest<HTMLElement>('[role="dialog"]')!;
};

describe("Access orders: shipping labels", () => {
  it("buys the label with the rate picked and shows it, ready to print", async () => {
    answerGets({
      "businessCard/access-orders": ordersList,
      "businessCard/access-orders/7": keychainOrder,
      "businessCard/access-orders/7/rates": {
        order_id: 7,
        shipment_id: "shp_1",
        rates: [rate("rate_cheap", "USPS", "Ground Advantage", 450, 4), rate("rate_fast", "UPS", "Next Day Air", 2500, 1)],
      },
    });
    const { business_card: _card, ...withoutCard } = keychainOrder;
    vi.mocked(axios.post).mockResolvedValue({
      data: {
        data: {
          ...withoutCard,
          fulfillment_status: "processing",
          carrier: "UPS",
          service: "Next Day Air",
          shippo_rate_id: "rate_fast",
          shippo_transaction_id: "tr_1",
          label_url: "https://labels.example/7.pdf",
          label_created_at: "2026-10-22T17:00:00.000Z",
          tracking_number: "1Z999AA10123456784",
          tracking_link: "https://track.example/1Z999AA10123456784",
        },
      },
    });
    renderAt("/access-orders/7");

    const details = await screen.findByRole("dialog");
    const picker = await openRatePicker(details);
    // The first choice is the checkout's rate; this one is picked instead.
    expect(within(picker).getByRole("radio", { name: /The rate chosen at checkout: USPS Ground Advantage/ })).toBeChecked();
    fireEvent.click(await within(picker).findByRole("radio", { name: /UPS Next Day Air/ }));
    fireEvent.click(within(picker).getByRole("button", { name: /Buy label/ }));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(`${API}businessCard/access-orders/7/label`, { rate_id: "rate_fast" }),
    );
    expect(await within(details).findByRole("link", { name: /Print label/ })).toHaveAttribute(
      "href",
      "https://labels.example/7.pdf",
    );
    expect(within(details).getByRole("link", { name: /1Z999AA10123456784/ })).toHaveAttribute(
      "href",
      "https://track.example/1Z999AA10123456784",
    );
    // The hand-edited tracking below follows the label, so saving it doesn't undo it.
    expect(within(details).getByDisplayValue("1Z999AA10123456784")).toBeInTheDocument();
    expect(within(details).getByRole("button", { name: /Void label/ })).toBeInTheDocument();
  });

  it("buys with the checkout's rate by default and shows Shippo's reasons when it fails", async () => {
    answerGets({
      "businessCard/access-orders": ordersList,
      "businessCard/access-orders/7": keychainOrder,
      "businessCard/access-orders/7/rates": { order_id: 7, shipment_id: "shp_1", rates: [] },
    });
    vi.mocked(axios.post).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 502,
        data: { message: "Shippo could not make the label: The address is not deliverable", code: "LABEL_FAILED" },
      },
    });
    renderAt("/access-orders/7");

    const picker = await openRatePicker(await screen.findByRole("dialog"));
    fireEvent.click(within(picker).getByRole("button", { name: /Buy label/ }));

    expect(
      await within(picker).findByText("Shippo could not make the label: The address is not deliverable"),
    ).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith(`${API}businessCard/access-orders/7/label`, {});
  });
});

describe("Access orders: Access Pro alone", () => {
  it("lists it as Access Pro only, with nothing to ship and no label actions", async () => {
    answerGets({ "businessCard/access-orders": ordersList, "businessCard/access-orders/8": proOrder });
    renderAt("/access-orders");

    expect(await screen.findByText("GL-20261021-000008")).toBeInTheDocument();
    expect(screen.getByText("Access Pro only")).toBeInTheDocument();
    expect(screen.getByText("Nothing to ship")).toBeInTheDocument();
  });

  it("shows nothing to ship in its details", async () => {
    answerGets({ "businessCard/access-orders": ordersList, "businessCard/access-orders/8": proOrder });
    renderAt("/access-orders/8");

    const details = await screen.findByRole("dialog");
    expect(await within(details).findByText("Access Pro only: nothing to ship.")).toBeInTheDocument();
    expect(within(details).queryByRole("button", { name: /Buy label/ })).not.toBeInTheDocument();
    expect(within(details).queryByText("Shipping label")).not.toBeInTheDocument();
  });
});
