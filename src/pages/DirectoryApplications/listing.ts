import type {
  DirectoryApplication,
  DirectoryApplicationStatus,
  DirectoryListingFields,
  GalleryPhoto,
  ListingAccountType,
  ListingPhotoChanges,
} from "../../types/directoryApplication";

// What the directory application screens share: reading the JSON fields (kept as the website's form sent them, so any
// item may be malformed), the words for statuses and location types, and the listing form's values.

export const LIST_PATH = "/directory-applications";
export const viewPath = (id: number | string) => `${LIST_PATH}/${id}`;
export const editPath = (id: number | string) => `${LIST_PATH}/edit/${id}`;

/** Router state the list hands on, so the pages it opens lead back to it as it was (filter, search, page). */
export interface FromList {
  list: string;
}

/** Where "back" goes: the list as the admin left it, else its first page. */
export const listUrlFrom = (state: unknown): string => {
  const list = (state as Partial<FromList> | null)?.list;
  return typeof list === "string" && list.startsWith(LIST_PATH) ? list : LIST_PATH;
};

export const STATUS_LABELS: Record<DirectoryApplicationStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const STATUS_COLORS: Record<DirectoryApplicationStatus, string> = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

export const LOCATION_TYPES: { value: string; label: string }[] = [
  { value: "exact_address", label: "Exact address" },
  { value: "service_area", label: "City or area only" },
  { value: "virtual", label: "Virtual" },
];

export const locationTypeLabel = (type: string) => LOCATION_TYPES.find((t) => t.value === type)?.label ?? type;

/** The platforms the website shows links for, in its order. */
export const SOCIAL_PLATFORMS: { key: string; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : "";

/** The text items of a list the form sent (specialties, the answers to its questions). */
export const textList = (value: unknown): string[] => (Array.isArray(value) ? value.map(text).filter(Boolean) : []);

/** The business-hours lines (`{ note }` each). */
export const hourNotes = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => (isRecord(item) ? text(item.note) : text(item))).filter(Boolean) : [];

/** A location's fields as text, ready to show or edit; the other keys it carries ride along. */
export interface LocationFields extends Record<string, unknown> {
  label: string;
  location_type: string;
  business_name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  description: string;
  is_primary: boolean;
}

/** The locations, field by field; the main one is the one marked primary, else the first. */
export const locationsOf = (value: unknown): LocationFields[] => {
  const locations = (Array.isArray(value) ? value : []).filter(isRecord).map(
    (l): LocationFields => ({
      ...l,
      label: text(l.label),
      location_type: text(l.location_type),
      business_name: text(l.business_name),
      address: text(l.address),
      city: text(l.city),
      state: text(l.state),
      phone: text(l.phone),
      description: text(l.description),
      is_primary: Boolean(l.is_primary),
    }),
  );
  // As the API picks it: the first marked primary, else the first.
  const main = Math.max(0, locations.findIndex((l) => l.is_primary));
  return locations.map((l, i) => ({ ...l, is_primary: i === main }));
};

/** The social links the form sent, as the website reads them: a link, or a handle. */
export const socialLinksOf = (value: unknown): { key: string; label: string; value: string; url: string | null }[] => {
  if (!isRecord(value)) return [];
  return Object.entries(value)
    .map(([key, raw]) => {
      const shown = text(raw);
      const label = SOCIAL_PLATFORMS.find((p) => p.key === key)?.label ?? key;
      return { key, label, value: shown, url: /^https?:\/\//i.test(shown) ? shown : null };
    })
    .filter((link) => link.value);
};

/**
 * A link to open from what the form sent: web links as they are, a bare domain with https://. Anything with another
 * scheme ("javascript:", "data:", …) is no link: the public form can send any text.
 */
export const linkFor = (value: string | null): string | null => {
  const url = value?.trim();
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (/^[a-z][a-z\d+.-]*:/i.test(url) || /\s/.test(url)) return null;
  return `https://${url}`;
};

/** "@handle", however it was typed. */
export const handleOf = (handle: string | null) => (handle ? `@${handle.replace(/^@+/, "")}` : "");

/** "City, State" of the main location. */
export const placeOf = (row: Pick<DirectoryApplication, "city" | "state">) => [row.city, row.state].filter(Boolean).join(", ");

/** The claimed Google listing on Google Maps. */
export const googleMapsUrl = (placeId: string) =>
  `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`;

/** The gallery in its order. */
export const galleryOf = (gallery: GalleryPhoto[] | null): GalleryPhoto[] =>
  (Array.isArray(gallery) ? gallery : [])
    .filter((photo) => isRecord(photo) && typeof photo.url === "string")
    .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));

// --- The listing form

/** Suggestions the form offers; any text is kept. */
export const BOOKING_METHODS = ["Go to Booking Link", "Call / text", "DM on Instagram", "Walk-ins welcome", "By appointment only"];

export const BUSINESS_HOUR_PRESETS = [
  "Hours: By Appointment Only",
  "Availability: Flexible Daily Hours",
  "Booking: Advance Booking Required",
  "Early/Late Times: Available Upon Request",
  "Please Provide Requested Time When Booking",
  "Travel Available Upon Request",
];

export const EXCITES_OPTIONS = [
  "Clients ability to discover pros nearby and check out their services, work, reviews, etc",
  "Seamless booking inside Glamlink either in app or goes directly to your booking link",
  "Pro shops & e-commerce",
  "The Glamlink Edit magazine & spotlights",
  "AI powered discovery & smart recommendations (coming soon)",
  "Community & networking with other pros",
];

export const PAIN_POINT_OPTIONS = [
  "Posting but no conversions",
  "DMs - too much back and forth",
  "No shows",
  "Juggling too many platforms (booking, social media, e-commerce, etc)",
  "Inventory/aftercare not tied to treatments",
  "Client notes/consents all over the place",
  "Finding new clients",
  "None of the above",
];

/** The form's text fields, which the API trims and saves empty as null. */
const TEXT_FIELDS = [
  "name",
  "professional_title",
  "email",
  "phone",
  "bio",
  "custom_handle",
  "website",
  "booking_link",
  "preferred_booking_method",
  "primary_specialty",
  "promotion_details",
  "place_id",
] as const;

type TextField = (typeof TEXT_FIELDS)[number];

/** A photo picked for the gallery, waiting for the save. */
export interface PickedPhoto {
  uid: string;
  file: File;
  /** An object URL for the preview. */
  preview: string;
  caption: string;
  is_thumbnail: boolean;
}

/** The gallery's changes: saved photos to take out (by link), and new ones. */
export interface GalleryChanges {
  remove: string[];
  add: PickedPhoto[];
}

/** What the listing form holds. */
export type ListingFormValues = Record<TextField, string> & {
  specialties: string[];
  /** The saved object, with the known platforms as text. */
  social_media: Record<string, unknown>;
  locations: LocationFields[];
  business_hours: string[];
  offer_promotion: boolean;
  elite_setup: boolean;
  excites_about_glamlink: string[];
  biggest_pain_points: string[];
  wants_access_card: boolean;
  /** Unchanged when undefined; a new photo, or "" to remove it. */
  profile_image?: File | "";
  gallery: GalleryChanges;
  /** A new listing's status and account type. */
  status: "approved" | "pending";
  professional_type: ListingAccountType;
};

export const blankLocation = (isPrimary: boolean): LocationFields => ({
  label: "",
  location_type: "exact_address",
  business_name: "",
  address: "",
  city: "",
  state: "",
  phone: "",
  description: "",
  is_primary: isPrimary,
});

// Each text once, as the form's tag pickers hold them.
const unique = (items: unknown) => [...new Set(textList(items))];

/** The form's values for a listing; a blank form (with one main location) without it. */
export const toFormValues = (listing?: DirectoryApplication): ListingFormValues => {
  const social = isRecord(listing?.social_media) ? listing.social_media : {};
  const texts = Object.fromEntries(TEXT_FIELDS.map((field) => [field, text(listing?.[field])])) as Record<TextField, string>;
  return {
    ...texts,
    specialties: unique(listing?.specialties),
    social_media: { ...social, ...Object.fromEntries(SOCIAL_PLATFORMS.map(({ key }) => [key, text(social[key])])) },
    locations: listing ? locationsOf(listing.locations) : [blankLocation(true)],
    business_hours: [...new Set(hourNotes(listing?.business_hours))],
    offer_promotion: Boolean(listing?.offer_promotion),
    elite_setup: Boolean(listing?.elite_setup),
    excites_about_glamlink: unique(listing?.excites_about_glamlink),
    biggest_pain_points: unique(listing?.biggest_pain_points),
    wants_access_card: Boolean(listing?.wants_access_card),
    profile_image: undefined,
    gallery: { remove: [], add: [] },
    status: "approved",
    professional_type: "individual",
  };
};

const LOCATION_TEXT = ["label", "location_type", "business_name", "address", "city", "state", "phone", "description"] as const;

// A location with nothing filled in (a blank one added and left) isn't sent; a virtual one needs no text.
const isBlank = (l: LocationFields) =>
  l.location_type !== "virtual" && LOCATION_TEXT.every((key) => key === "location_type" || !l[key]);

/** The listing's fields as the API takes them. Blank locations are dropped; one stays the main one. */
export const fieldsOf = (values: ListingFormValues): DirectoryListingFields => {
  const locations = (values.locations ?? [])
    .map((l) => ({ ...l, ...Object.fromEntries(LOCATION_TEXT.map((key) => [key, text(l[key])])) }) as LocationFields)
    .filter((l) => !isBlank(l));
  const main = Math.max(0, locations.findIndex((l) => l.is_primary));
  const social = Object.fromEntries(
    Object.entries(values.social_media ?? {}).flatMap(([key, value]) => {
      const kept = typeof value === "string" ? value.trim() : value;
      return kept === "" || kept === null || kept === undefined ? [] : [[key, kept]];
    }),
  );
  return {
    ...(Object.fromEntries(TEXT_FIELDS.map((field) => [field, text(values[field])])) as Record<TextField, string>),
    specialties: unique(values.specialties),
    social_media: social,
    locations: locations.map((l, i) => ({ ...l, is_primary: i === main, sort_order: i + 1 })),
    business_hours: unique(values.business_hours).map((note) => ({ note })),
    offer_promotion: values.offer_promotion,
    elite_setup: values.elite_setup,
    excites_about_glamlink: unique(values.excites_about_glamlink),
    biggest_pain_points: unique(values.biggest_pain_points),
    wants_access_card: values.wants_access_card,
  };
};

/** The photo changes to send. New photos follow the saved ones that stay, in the order they were added. */
export const photoChangesOf = (values: ListingFormValues, saved: GalleryPhoto[] | null): ListingPhotoChanges => {
  const { remove, add } = values.gallery ?? { remove: [], add: [] };
  const lastOrder = Math.max(0, ...galleryOf(saved).filter((p) => !remove.includes(p.url)).map((p) => p.sort_order || 0));
  return {
    profile_image: values.profile_image,
    images: add.map((photo, i) => ({
      file: photo.file,
      caption: photo.caption.trim(),
      is_thumbnail: photo.is_thumbnail,
      sort_order: lastOrder + i + 1,
    })),
    remove_photos: remove,
  };
};

export const hasPhotoChanges = ({ profile_image, images = [], remove_photos = [] }: ListingPhotoChanges) =>
  profile_image !== undefined || images.length > 0 || remove_photos.length > 0;

// The same value whatever the order of its keys.
const canonical = (value: unknown): unknown =>
  Array.isArray(value)
    ? value.map(canonical)
    : isRecord(value)
      ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]))
      : value;

/**
 * The fields whose value differs from `before`. An edit sends only these: resending unchanged locations would reset
 * the main location's coordinates and geocode it again.
 */
export const changedFields = (next: DirectoryListingFields, before: DirectoryListingFields): DirectoryListingFields =>
  Object.fromEntries(
    Object.entries(next).filter(
      ([key, value]) =>
        JSON.stringify(canonical(value)) !== JSON.stringify(canonical(before[key as keyof DirectoryListingFields])),
    ),
  );
