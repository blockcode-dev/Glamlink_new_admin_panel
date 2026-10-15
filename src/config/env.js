// Central place for environment-driven config. Values come from .env
// (see .env.example). CRA only exposes variables prefixed with REACT_APP_
// and bakes them in at build time, so restart `npm start` after edits.

const required = (name) => {
  const value = process.env[name];
  if (!value) {
    // eslint-disable-next-line no-console
    console.error(`Missing environment variable: ${name}. Check your .env file.`);
  }
  return value || "";
};

export const API_BASE_URL = required("REACT_APP_API_BASE_URL");
export const IMAGE_BASE_URL = required("REACT_APP_IMAGE_BASE_URL");
export const VIDEO_BASE_URL = required("REACT_APP_VIDEO_BASE_URL");

export const TINYMCE_API_KEY = required("REACT_APP_TINYMCE_API_KEY");

// REACT_APP_GOOGLE_MAPS_API_KEY is used in public/index.html (Maps script tag).
required("REACT_APP_GOOGLE_MAPS_API_KEY");
