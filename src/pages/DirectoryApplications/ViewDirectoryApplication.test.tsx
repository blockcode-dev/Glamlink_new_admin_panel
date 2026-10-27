import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import axios from "axios";
import ViewDirectoryApplication from "./ViewDirectoryApplication";
import type { DirectoryApplication } from "../../types/directoryApplication";

// No network in tests: each test says what the application (and the admins list) answers, and what a review answers.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), post: vi.fn<Call>(), put: vi.fn<Call>(), delete: vi.fn<Call>() },
    // utils/apiError reads failures through this.
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});

const URL_5 = "https://api.test/api/v1/directory/applications/5";

// As the website's form sends it: a claim on a Google listing, two locations, photos and the form's answers.
const PENDING: DirectoryApplication = {
  id: 5,
  name: "Bo Owner",
  professional_title: "Lash Artist",
  email: "bo@example.com",
  phone: "7025550111",
  bio: "Lash lifts and brow lamination in a calm studio.",
  custom_handle: "@bo_lashes",
  website: "javascript:alert(1)",
  booking_link: "bo.example.com/book",
  preferred_booking_method: "Walk-ins welcome",
  primary_specialty: "Lashes",
  specialties: ["Lashes", "Brows", { not: "text" }],
  social_media: { instagram: "https://instagram.com/bo", tiktok: "" },
  locations: [
    { label: "Studio", location_type: "exact_address", address: "9 Lash Ln", city: "Las Vegas", state: "NV", business_name: "Bo Lash Studio", is_primary: true },
    { label: "Online", location_type: "virtual", is_primary: false },
  ],
  business_hours: [{ note: "Tue–Sat 10–6" }],
  business_name: "Bo Lash Studio",
  city: "Las Vegas",
  state: "NV",
  latitude: "36.169900",
  longitude: "-115.139800",
  profile_image: "https://api.test/images/profile_image-1.png",
  gallery: [{ url: "https://api.test/images/images-1.png", caption: "Classic set", is_thumbnail: true, sort_order: 1 }],
  offer_promotion: true,
  promotion_details: "20% off first booking",
  elite_setup: false,
  excites_about_glamlink: ["Pro shops & e-commerce"],
  biggest_pain_points: ["No shows"],
  wants_access_card: true,
  place_id: "ChIJ-test-place",
  status: "pending",
  review_note: null,
  reviewed_by: null,
  reviewed_at: null,
  user_id: null,
  ip_address: "203.0.113.9",
  created_at: "2026-10-23T10:00:00.000Z",
  updated_at: "2026-10-23T10:00:00.000Z",
};

const answer = (application: DirectoryApplication) =>
  vi.mocked(axios.get).mockImplementation(async (url: unknown) => {
    if (String(url).endsWith("admin/list")) return { data: { data: [{ id: 3, name: "Melanie", email: "m@glamlink.net" }] } };
    if (url === URL_5) return { data: { data: application } };
    throw { isAxiosError: true, response: { status: 404, data: { message: "Not found.", code: "NOT_FOUND" } } };
  });

const renderView = () =>
  render(
    <MemoryRouter initialEntries={["/directory-applications/5"]}>
      <Routes>
        <Route path="/directory-applications/:id" element={<ViewDirectoryApplication />} />
      </Routes>
    </MemoryRouter>,
  );

// The page's buttons carry an icon, whose label starts their name ("check Approve").
const pageButton = (name: string) => screen.findByRole("button", { name: new RegExp(`${name}$`) });

const openDialog = async (button: string) => {
  fireEvent.click(await pageButton(button));
  return screen.findByRole("dialog");
};

describe("Directory application: view and review", () => {
  it("shows every field, and doesn't link text that isn't a web link", async () => {
    answer(PENDING);
    renderView();

    expect(await screen.findByRole("heading", { name: "Bo Owner" })).toBeInTheDocument();
    expect(screen.getByText("Lash lifts and brow lamination in a calm studio.")).toBeInTheDocument();
    expect(screen.getByText("Brows")).toBeInTheDocument();
    expect(screen.getByText("9 Lash Ln")).toBeInTheDocument();
    expect(screen.getByText("Tue–Sat 10–6")).toBeInTheDocument();
    expect(screen.getByText("Classic set")).toBeInTheDocument();
    expect(screen.getByText("20% off first booking")).toBeInTheDocument();
    expect(screen.getByText("Pro shops & e-commerce")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ChIJ-test-place/ })).toHaveAttribute(
      "href",
      "https://www.google.com/maps/place/?q=place_id:ChIJ-test-place",
    );
    expect(screen.getByRole("link", { name: "bo.example.com/book" })).toHaveAttribute("href", "https://bo.example.com/book");
    expect(screen.getByText("javascript:alert(1)").closest("a")).toBeNull();
  });

  it("approves: says what approval does, reminds to check the Google claim, and sends just the status", async () => {
    answer(PENDING);
    vi.mocked(axios.put).mockResolvedValue({
      data: { data: { ...PENDING, status: "approved", user_id: 77, reviewed_by: 3, reviewed_at: "2026-10-24T09:00:00.000Z" } },
    });
    renderView();

    const dialog = await openDialog("Approve");
    expect(within(dialog).getByText(/Finds the Glamlink account for bo@example.com, or makes one/)).toBeInTheDocument();
    expect(within(dialog).getByText(/Makes no Access card/)).toBeInTheDocument();
    expect(within(dialog).getByText("This application claims a Google listing")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve" }));

    await waitFor(() => expect(axios.put).toHaveBeenCalledWith(`${URL_5}/status`, { status: "approved" }));
    expect(await screen.findByText("Approved. bo@example.com was emailed how to sign in.")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Account #77" })).toHaveAttribute("href", "/viewProfessionals/77");
    expect(await pageButton("Move back to pending")).toBeInTheDocument();
  });

  it("approves as a brand named after the main location's business", async () => {
    answer(PENDING);
    vi.mocked(axios.put).mockResolvedValue({ data: { data: { ...PENDING, status: "approved", user_id: 78 } } });
    renderView();

    const dialog = await openDialog("Approve as brand");
    expect(within(dialog).getByText("Bo Lash Studio")).toBeInTheDocument();
    fireEvent.change(within(dialog).getByRole("textbox"), { target: { value: "Checked the studio's Instagram" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve as brand" }));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(`${URL_5}/status`, {
        status: "approved",
        professional_type: "brand",
        note: "Checked the studio's Instagram",
      }),
    );
  });

  it("asks why before rejecting", async () => {
    answer(PENDING);
    vi.mocked(axios.put).mockResolvedValue({ data: { data: { ...PENDING, status: "rejected", review_note: "Not a real business" } } });
    renderView();

    const dialog = await openDialog("Reject");
    fireEvent.click(within(dialog).getByRole("button", { name: "Reject" }));
    expect(await within(dialog).findByText("Say why it's rejected")).toBeInTheDocument();
    expect(axios.put).not.toHaveBeenCalled();

    fireEvent.change(within(dialog).getByRole("textbox"), { target: { value: "Not a real business" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Reject" }));
    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(`${URL_5}/status`, { status: "rejected", note: "Not a real business" }),
    );
  });

  it("moves an approved listing back to pending, and shows the API's refusal", async () => {
    answer({ ...PENDING, status: "approved", user_id: 77, reviewed_by: 3, reviewed_at: "2026-10-24T09:00:00.000Z" });
    vi.mocked(axios.put).mockRejectedValue({
      isAxiosError: true,
      response: { status: 400, data: { message: "status is pending, approved or rejected.", code: "INVALID_INPUT", details: { field: "status" } } },
    });
    renderView();

    expect(await screen.findByText(/by Melanie on Oct 24, 2026/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Approve$/ })).toBeNull();
    const dialog = await openDialog("Move back to pending");
    expect(within(dialog).getByText(/Approving it again sends no email/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Move back to pending" }));

    await waitFor(() => expect(axios.put).toHaveBeenCalledWith(`${URL_5}/status`, { status: "pending" }));
    expect(await screen.findByText("status is pending, approved or rejected.")).toBeInTheDocument();
  });
});
