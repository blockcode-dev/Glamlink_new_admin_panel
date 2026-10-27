import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import axios from "axios";
import AddDirectoryListing from "./AddDirectoryListing";
import EditDirectoryListing from "./EditDirectoryListing";
import type { DirectoryApplication } from "../../types/directoryApplication";

// No network in tests: each test says what the listing and the save answer.
vi.mock("axios", () => {
  type Call = (...args: unknown[]) => Promise<unknown>;
  return {
    default: { get: vi.fn<Call>(), post: vi.fn<Call>(), put: vi.fn<Call>(), delete: vi.fn<Call>() },
    // utils/apiError reads failures through this.
    isAxiosError: (e: unknown) => Boolean((e as { isAxiosError?: boolean } | null)?.isAxiosError),
  };
});
// Shrinking photos needs a web worker; the tests keep them as picked.
vi.mock("../../utils/compressImage", () => ({ compressImage: async (file: File) => file }));

const API = "https://api.test/api/v1/";

const LISTING: DirectoryApplication = {
  id: 7,
  name: "Kate Lash",
  professional_title: "Lash Artist",
  email: "kate@example.com",
  phone: "7025550111",
  bio: "Lash lifts and brow lamination.",
  custom_handle: null,
  website: null,
  booking_link: null,
  preferred_booking_method: null,
  primary_specialty: "Lashes",
  specialties: ["Lashes", "Brows"],
  social_media: { instagram: "https://instagram.com/lashes", tiktok: "" },
  // A Google claim's location carries coordinates the form doesn't show; they must survive an edit.
  locations: [
    { label: "Studio", location_type: "exact_address", address: "9 Lash Ln", city: "Las Vegas", state: "NV", business_name: "Kate Lash Studio", phone: "", description: "", is_primary: true, sort_order: 1, latitude: 36.1699 },
  ],
  business_hours: [{ note: "Tue–Sat 10–6" }],
  business_name: "Kate Lash Studio",
  city: "Las Vegas",
  state: "NV",
  latitude: "36.169900",
  longitude: "-115.139800",
  profile_image: "https://api.test/images/profile_image-1.png",
  gallery: [{ url: "https://api.test/images/images-1.png", caption: "Classic set", is_thumbnail: true, sort_order: 1 }],
  offer_promotion: false,
  promotion_details: null,
  elite_setup: false,
  excites_about_glamlink: [],
  biggest_pain_points: [],
  wants_access_card: true,
  place_id: null,
  status: "approved",
  review_note: null,
  reviewed_by: 3,
  reviewed_at: "2026-10-24T09:00:00.000Z",
  user_id: 77,
  ip_address: null,
  created_at: "2026-10-23T10:00:00.000Z",
  updated_at: "2026-10-23T10:00:00.000Z",
};

beforeEach(() => {
  // jsdom has no object URLs; the photo previews need one.
  URL.createObjectURL = vi.fn<(file: Blob) => string>(() => "blob:preview");
  URL.revokeObjectURL = vi.fn<(url: string) => void>();
  vi.mocked(axios.get).mockImplementation(async (url: unknown) => {
    if (url === `${API}directory/applications/7`) return { data: { data: LISTING } };
    // The specialties the website offers.
    return { data: { data: { count: 1, rows: [{ id: 1, title: "Lashes" }] } } };
  });
});

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/directory-applications/add" element={<AddDirectoryListing />} />
        <Route path="/directory-applications/edit/:id" element={<EditDirectoryListing />} />
        <Route path="/directory-applications/:id" element={<p>Listing page</p>} />
      </Routes>
    </MemoryRouter>,
  );

const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

const pickFiles = (input: Element, files: File[]) => fireEvent.change(input, { target: { files } });

const photo = (name: string) => new File(["photo"], name, { type: "image/png" });

describe("Adding a listing", () => {
  it("sends the fields filled in, approved as a professional by default", async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { data: { ...LISTING, id: 9, email: "nia@example.com" } } });
    renderAt("/directory-applications/add");

    type("Name", "Nia Brows");
    type("Email", "nia@example.com");
    type("Professional title", "Brow Artist");
    type("City", "Reno");
    fireEvent.click(screen.getByRole("button", { name: "Add listing" }));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(`${API}directory/applications/admin`, {
        name: "Nia Brows",
        email: "nia@example.com",
        professional_title: "Brow Artist",
        locations: [
          {
            label: "",
            location_type: "exact_address",
            business_name: "",
            address: "",
            city: "Reno",
            state: "",
            phone: "",
            description: "",
            is_primary: true,
            sort_order: 1,
          },
        ],
        status: "approved",
        professional_type: "individual",
      }),
    );
    expect(await screen.findByText("Listing page")).toBeInTheDocument();
  });

  it("leaves a new listing pending when asked: no account type then", async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { data: { ...LISTING, id: 9, status: "pending" } } });
    renderAt("/directory-applications/add");

    type("Name", "Bo Owner");
    type("Email", "bo@example.com");
    fireEvent.click(screen.getByLabelText("Pending: review it later"));
    await waitFor(() => expect(screen.queryByLabelText("A brand")).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "Add listing" }));
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(`${API}directory/applications/admin`, {
        name: "Bo Owner",
        email: "bo@example.com",
        status: "pending",
      }),
    );
  });

  it("adds a brand", async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { data: { ...LISTING, id: 9 } } });
    renderAt("/directory-applications/add");

    type("Name", "Bo Owner");
    type("Email", "bo@example.com");
    fireEvent.click(screen.getByLabelText("A brand"));
    fireEvent.click(screen.getByRole("button", { name: "Add listing" }));
    await waitFor(() =>
      expect(axios.post).toHaveBeenLastCalledWith(`${API}directory/applications/admin`, {
        name: "Bo Owner",
        email: "bo@example.com",
        status: "approved",
        professional_type: "brand",
      }),
    );
  });

  it("needs a name and a valid email before sending", async () => {
    renderAt("/directory-applications/add");

    type("Email", "bo@");
    fireEvent.click(screen.getByRole("button", { name: "Add listing" }));

    expect(await screen.findByText("Enter the name")).toBeInTheDocument();
    expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });
});

describe("Editing a listing", () => {
  it("sends only the fields that changed", async () => {
    vi.mocked(axios.put).mockResolvedValue({ data: { data: LISTING } });
    renderAt("/directory-applications/edit/7");

    await screen.findByDisplayValue("Lash Artist");
    type("Professional title", "Lash & Brow Artist");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(`${API}directory/applications/7`, { professional_title: "Lash & Brow Artist" }),
    );
  });

  it("keeps a location's other keys when it changes", async () => {
    vi.mocked(axios.put).mockResolvedValue({ data: { data: LISTING } });
    renderAt("/directory-applications/edit/7");

    await screen.findByDisplayValue("9 Lash Ln");
    type("Address", "10 Lash Ln");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    const [, body] = vi.mocked(axios.put).mock.calls[0];
    expect(body).toEqual({
      locations: [{ ...(LISTING.locations?.[0] as object), address: "10 Lash Ln", is_primary: true, sort_order: 1 }],
    });
  });

  it("sends photos as multipart: a new profile photo, a new gallery photo with its caption, a removed one", async () => {
    vi.mocked(axios.put).mockResolvedValue({ data: { data: LISTING } });
    const { container } = renderAt("/directory-applications/edit/7");
    await screen.findByDisplayValue("Lash Artist");

    const [profileInput, galleryInput] = container.querySelectorAll('input[type="file"]');
    const me = photo("me.png");
    const studio = photo("studio.png");
    pickFiles(profileInput, [me]);
    expect(await screen.findByText("New photo: it's uploaded when you save.")).toBeInTheDocument();
    pickFiles(galleryInput, [studio]);
    fireEvent.change(await screen.findByLabelText("Caption for new photo 1"), { target: { value: "The studio" } });
    const savedPhoto = screen.getByText("Classic set").closest('[class*="photoTile"]') as HTMLElement;
    fireEvent.click(within(savedPhoto).getByRole("button", { name: /Remove$/ }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    const [url, body] = vi.mocked(axios.put).mock.calls[0];
    expect(url).toBe(`${API}directory/applications/7`);
    expect(body).toBeInstanceOf(FormData);
    const form = body as FormData;
    expect(form.get("profile_image")).toBe(me);
    expect(form.getAll("images")).toEqual([studio]);
    // The saved cover is removed, so the new photo becomes the cover.
    expect(JSON.parse(String(form.get("gallery_meta")))).toEqual([{ caption: "The studio", is_thumbnail: true, sort_order: 1 }]);
    expect(JSON.parse(String(form.get("remove_photos")))).toEqual(["https://api.test/images/images-1.png"]);
    expect(form.get("name")).toBeNull();
  });

  it("puts the API's refusal on its field", async () => {
    vi.mocked(axios.put).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: { success: false, message: "Please enter a valid phone number.", code: "INVALID_INPUT", details: { field: "phone" } },
      },
    });
    renderAt("/directory-applications/edit/7");

    await screen.findByDisplayValue("Lash Artist");
    type("Phone", "702-555-0111 ext 9");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(screen.getByLabelText("Phone")).toHaveAttribute("aria-invalid", "true"));
    expect((await screen.findAllByText("Please enter a valid phone number.")).length).toBeGreaterThan(0);
  });
});
