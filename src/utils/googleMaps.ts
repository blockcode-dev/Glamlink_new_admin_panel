import { GOOGLE_MAPS_API_KEY } from "../config/env";

// Google Maps is only used by the access card forms (address autocomplete and the
// city geocoder), so its script loads the first time one of them needs it, not on
// every page. The login page and the rest of the panel run no Google script and
// don't expose the key.

const CALLBACK = "__glamlinkMapsReady";
let loading: Promise<void> | null = null;

const load = async () => {
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const params = new URLSearchParams({ key: GOOGLE_MAPS_API_KEY, loading: "async", callback: CALLBACK });
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    (window as unknown as Record<string, () => void>)[CALLBACK] = resolve;
    script.onerror = () => {
      script.remove();
      reject(new Error("Google Maps failed to load."));
    };
    document.head.append(script);
  });
  // Also fills in google.maps.places and google.maps.Geocoder, which the forms use.
  await Promise.all([google.maps.importLibrary("places"), google.maps.importLibrary("geocoding")]);
};

/** Loads the Maps JavaScript API with Places and the geocoder. Safe to call any number of times. */
export const loadGoogleMaps = (): Promise<void> => {
  loading ??= load().catch((error: unknown) => {
    loading = null; // let a later call try again
    throw error;
  });
  return loading;
};
