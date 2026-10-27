import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AccessSubscriptions from "./AccessSubscriptions";
import type { SubscriptionSeat } from "../../types/access";

// No network in tests: each test says what the API answers.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), post: vi.fn<Call>(), put: vi.fn<Call>() },
    // utils/apiError reads failures through this.
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const API = "https://api.test/api/v1/";

const seat = (fields: Partial<SubscriptionSeat>): SubscriptionSeat => ({
  id: 1,
  user_id: 12,
  source: "comp",
  status: "active",
  stripe_customer_id: null,
  stripe_subscription_id: null,
  amount_cents: null,
  currency: "usd",
  current_period_end: null,
  cancel_at_period_end: false,
  started_at: "2026-10-08T12:00:00.000Z",
  canceled_at: null,
  ended_at: null,
  created_at: "2026-10-16T12:00:00.000Z",
  updated_at: "2026-10-16T12:00:00.000Z",
  ...fields,
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

const renderPage = () =>
  render(
    <MemoryRouter>
      <AccessSubscriptions />
    </MemoryRouter>,
  );

describe("Access subscriptions: complimentary Pro", () => {
  it("shows whose seat it is and takes back complimentary Pro after asking", async () => {
    answerGets({
      "access/admin/subscriptions": [seat({})],
      "admin/users/getUserById/12": { id: 12, email: "kate@example.com", user_profile: { name: "Kate Sibley" } },
    });
    vi.mocked(axios.put).mockResolvedValue({ data: { data: seat({ status: "canceled" }) } });
    renderPage();

    expect(await screen.findByRole("link", { name: "Kate Sibley" })).toHaveAttribute("href", "/viewProfessionals/12");
    expect(screen.getByText("Complimentary")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Take back complimentary/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Take back" }));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(`${API}access/admin/subscriptions/12/comp`, { active: false }),
    );
  });

  it("makes a canceled seat complimentary", async () => {
    answerGets({
      "access/admin/subscriptions": [seat({ id: 2, user_id: 13, source: "stripe", status: "canceled", amount_cents: 499 })],
      "admin/users/getUserById/13": { id: 13, email: "lee@example.com", user_profile: { name: "Lee Park" } },
    });
    vi.mocked(axios.put).mockResolvedValue({ data: { data: seat({ id: 2, user_id: 13 }) } });
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: /Make complimentary/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Give Pro" }));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(`${API}access/admin/subscriptions/13/comp`, { active: true }),
    );
  });

  it("explains that someone who pays through Stripe can't be given complimentary Pro", async () => {
    answerGets({
      "access/admin/subscriptions": [],
      "profiles/admin/list": {
        count: 1,
        rows: [{ id: 30, name: "Jane Smith", slug: "jane-smith", type: "individual", visible: true }],
      },
    });
    vi.mocked(axios.put).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: { message: "This person pays for Access Pro; cancel that subscription instead.", code: "SUBSCRIPTION_PAID" },
      },
    });
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: /Give complimentary Pro/ }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.mouseDown(within(dialog).getByRole("combobox"));
    fireEvent.click(await screen.findByText("Jane Smith"));
    fireEvent.click(within(dialog).getByRole("button", { name: /Give Pro/ }));

    expect(await within(dialog).findByText(/They pay for Access Pro through Stripe/)).toBeInTheDocument();
    expect(axios.put).toHaveBeenCalledWith(`${API}access/admin/subscriptions/30/comp`, { active: true });
  });
});

describe("Access subscriptions: cancelling", () => {
  it("cancels a paid seat now only after asking", async () => {
    answerGets({
      "access/admin/subscriptions": [
        seat({
          id: 3,
          user_id: 14,
          source: "stripe",
          status: "active",
          amount_cents: 499,
          stripe_subscription_id: "sub_14",
          current_period_end: "2026-11-08T12:00:00.000Z",
        }),
      ],
      "admin/users/getUserById/14": { id: 14, email: "sam@example.com", user_profile: { name: "Sam Lee" } },
    });
    vi.mocked(axios.post).mockResolvedValue({ data: { data: seat({ id: 3, user_id: 14, status: "canceled" }) } });
    renderPage();

    expect(await screen.findByText("$4.99 / month")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Cancel now/ }));
    expect(axios.post).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByRole("button", { name: "End it now" }));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(`${API}access/admin/subscriptions/14/cancel`, { now: true }),
    );
  });
});
