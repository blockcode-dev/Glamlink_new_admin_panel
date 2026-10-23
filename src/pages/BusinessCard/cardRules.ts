import type { FormInstance, FormRule } from "antd";
import { apiErrorBody } from "../../utils/apiError";
import { htmlToText } from "../../utils/sanitizeHtml";

// The API checks a card with the website form's rules (backend docs/access.md, section 1).
// These mirror the ones an admin is likely to hit, so the form says so before saving.

export const BIO_MAX = 80;
/** Up to 20 photos and 1 video for an admin (owners are limited by their plan). */
export const MAX_PHOTOS = 20;
export const MAX_VIDEOS = 1;
const VIDEO_MAX_MB = 21;
const VIDEO_MAX_SECONDS = 60;

/** Why a card video would be refused (MP4, at most 21 MB and 60 seconds), or null. */
export const videoProblem = async (file: File): Promise<string | null> => {
  if (file.type !== "video/mp4" && !/\.mp4$/i.test(file.name)) return "Videos must be MP4 files.";
  if (file.size > VIDEO_MAX_MB * 1024 * 1024) return `Videos can be at most ${VIDEO_MAX_MB} MB.`;
  const seconds = await new Promise<number>((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.preload = "metadata";
    video.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(video.duration); };
    video.onerror = () => { URL.revokeObjectURL(url); resolve(NaN); };
    video.src = url;
  });
  if (Number.isNaN(seconds)) return "This video can't be read. Try another MP4 file.";
  return seconds > VIDEO_MAX_SECONDS ? `Videos can be at most ${VIDEO_MAX_SECONDS} seconds.` : null;
};

export const nameRules: FormRule[] = [
  { required: true, whitespace: true, message: "Name is required" },
  { max: 100, message: "At most 100 characters" },
];
export const titleRules: FormRule[] = [
  { required: true, whitespace: true, message: "Title is required" },
  { max: 100, message: "At most 100 characters" },
];
export const businessNameRules: FormRule[] = [
  { required: true, whitespace: true, message: "Business name is required" },
  { max: 150, message: "At most 150 characters" },
];

/** Bio: required, at most 80 characters of text (formatting doesn't count). */
export const bioRules: FormRule[] = [
  {
    validator: async (_, value: string | undefined) => {
      const length = htmlToText(value).trim().length;
      if (!length) throw new Error("Bio is required");
      if (length > BIO_MAX) throw new Error(`The bio can be at most ${BIO_MAX} characters (now ${length})`);
    },
  },
];

/** Phone: exactly 10 digits while it's shown on the card. */
export const phoneRules = (form: FormInstance): FormRule[] => [
  {
    validator: async (_, value: string | undefined) => {
      const digits = String(value ?? "").replace(/\D/g, "");
      const visible = form.getFieldValue("is_phone_visible") !== false;
      if (visible && digits.length !== 10) throw new Error("Enter a 10-digit phone number (or hide the phone)");
    },
  },
];

// API field names that differ from this form's.
const FORM_FIELD: Record<string, string> = { instagram: "instagram_links" };

/**
 * Shows a 400 INVALID_CARD on the field it names (`details.field`) and returns its message.
 * Returns null for any other error.
 */
export const showCardError = (form: FormInstance, error: unknown): string | null => {
  const body = apiErrorBody(error);
  if (body?.code !== "INVALID_CARD") return null;
  const text = body.message || "Please check the card's details.";
  const field = body.details?.field;
  if (field) {
    const name = FORM_FIELD[field] ?? field;
    form.setFields([{ name, errors: [text] }]);
    form.scrollToField(name, { block: "center" });
  }
  return text;
};

/** The id of the card this email already has, when creating answers 409 CARD_EXISTS. */
export const existingCardId = (error: unknown): number | string | null => {
  const body = apiErrorBody(error);
  return body?.code === "CARD_EXISTS" ? (body.details?.card_id ?? "") : null;
};
