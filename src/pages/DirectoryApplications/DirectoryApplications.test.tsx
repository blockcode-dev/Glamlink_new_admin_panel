import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axios from "axios";
import DirectoryApplications from "./DirectoryApplications";
import type { DirectoryApplication } from "../../types/directoryApplication";

// No network in tests: each test says what the list (and the admins list, for reviewers' names) answers.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), post: vi.fn<Call>(), put: vi.fn<Call>(), delete: vi.fn<Call>() },
    // utils/apiError reads failures through this.
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const LIST_URL = "https://api.test/api/v1/directory/applications";

const application = (fields: Partial<DirectoryApplication>): DirectoryApplication => ({
  id: 1,
  name: "Kate Sue",
  professional_title: "Makeup Artist",
  email: "kate@example.com",
  phone: "(702) 677-4576",
  bio: null,
  custom_handle: "katesue",
  website: null,
  booking_link: null,
  preferred_booking_method: null,
  primary_specialty: "Makeup",
  specialties: null,
  social_media: null,
  locations: null,
  business_hours: null,
  business_name: "Kate Sue Beauty",
  city: "Las Vegas",
  state: "NV",
  latitude: null,
  longitude: null,
  profile_image: null,
  gallery: null,
  offer_promotion: false,
  promotion_details: null,
  elite_setup: false,
  excites_about_glamlink: null,
  biggest_pain_points: null,
  wants_access_card: false,
  place_id: null,
  status: "pending",
  review_note: null,
  reviewed_by: null,
  reviewed_at: null,
  user_id: null,
  ip_address: null,
  created_at: "2026-10-23T10:00:00.000Z",
  updated_at: "2026-10-23T10:00:00.000Z",
  ...fields,
});

const KATE = application({});
const MIA = application({
  id: 2,
  name: "Mia Brows",
  email: "mia@example.com",
  status: "approved",
  reviewed_by: 3,
  reviewed_at: "2026-10-24T09:00:00.000Z",
  user_id: 41,
});

const answer = (rows: DirectoryApplication[]) =>
  vi.mocked(axios.get).mockImplementation(async (url: unknown) =>
    String(url).endsWith("admin/list")
      ? { data: { data: [{ id: 3, name: "Melanie", email: "melanie@glamlink.net" }] } }
      : { data: { data: { count: rows.length, rows } } },
  );

const listCalls = () => vi.mocked(axios.get).mock.calls.filter(([url]) => url === LIST_URL);

const renderList = () =>
  render(
    <MemoryRouter initialEntries={["/directory-applications"]}>
      <DirectoryApplications />
    </MemoryRouter>,
  );

describe("Directory applications list", () => {
  it("shows the pending applications first, 50 a page", async () => {
    answer([KATE]);
    renderList();

    expect(await screen.findByText("Kate Sue")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(LIST_URL, { params: { status: "pending", page: 1, limit: 50 } });
    expect(screen.getByText("Kate Sue Beauty · @katesue")).toBeInTheDocument();
    expect(screen.getByText("Las Vegas, NV")).toBeInTheDocument();
  });

  it("filters by status, and shows who reviewed an approved one and its account", async () => {
    answer([KATE]);
    renderList();
    await screen.findByText("Kate Sue");

    answer([MIA]);
    fireEvent.click(screen.getByText("Approved"));
    expect(await screen.findByText("Mia Brows")).toBeInTheDocument();
    expect(listCalls().at(-1)?.[1]).toEqual({ params: { status: "approved", page: 1, limit: 50 } });
    expect(await screen.findByText(/Melanie · Oct 24, 2026/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Account #41" })).toHaveAttribute("href", "/viewProfessionals/41");

    fireEvent.click(screen.getByText("All"));
    await waitFor(() => expect(listCalls().at(-1)?.[1]).toEqual({ params: { page: 1, limit: 50 } }));
  });

  it("searches on the server once typing pauses", async () => {
    answer([KATE]);
    renderList();
    await screen.findByText("Kate Sue");

    fireEvent.change(screen.getByPlaceholderText("Search name, email, handle, title or specialty"), {
      target: { value: "kate@" },
    });
    await waitFor(() =>
      expect(listCalls().at(-1)?.[1]).toEqual({ params: { status: "pending", search: "kate@", page: 1, limit: 50 } }),
    );
  });

  it("deletes the selected applications together", async () => {
    answer([KATE, MIA]);
    vi.mocked(axios.post).mockResolvedValue({ data: { data: { deleted: 2 } } });
    renderList();
    await screen.findByText("Kate Sue");

    const [kateRow, miaRow] = ["Kate Sue", "Mia Brows"].map((name) => screen.getByText(name).closest("tr") as HTMLElement);
    fireEvent.click(within(kateRow).getByRole("checkbox"));
    fireEvent.click(within(miaRow).getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Delete selected \(2\)/ }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/An approved listing leaves the directory/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith(`${LIST_URL}/delete`, { ids: [1, 2] }));
  });
});
