// Central place for environment-driven config. Values come from .env
// (see .env.example). Vite only exposes variables prefixed with VITE_
// and bakes them in at build time, so restart `npm run dev` after edits.

const required = (name: Extract<keyof ImportMetaEnv, `VITE_${string}`>): string => {
  const value = import.meta.env[name];
  if (!value) {
    console.error(`Missing environment variable: ${name}. Check your .env file.`);
  }
  return value || "";
};

export const API_BASE_URL = required("VITE_API_BASE_URL");
export const IMAGE_BASE_URL = required("VITE_IMAGE_BASE_URL");
export const VIDEO_BASE_URL = required("VITE_VIDEO_BASE_URL");

// Loaded on first use by utils/googleMaps.ts (access card address search and geocoding).
export const GOOGLE_MAPS_API_KEY = required("VITE_GOOGLE_MAPS_API_KEY");

// The public website, for "view on site" links; optional (production by default).
export const WEBSITE_URL = (import.meta.env.VITE_WEBSITE_URL || "https://glamlink.net").replace(/\/+$/, "");
