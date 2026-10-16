import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mapsScripts = () =>
  document.querySelectorAll<HTMLScriptElement>('script[src^="https://maps.googleapis.com/maps/api/js"]');

describe("loadGoogleMaps", () => {
  // The loader remembers its promise, so each test gets a fresh copy of the module.
  beforeEach(() => vi.resetModules());
  afterEach(() => {
    mapsScripts().forEach((s) => s.remove());
    vi.unstubAllGlobals();
  });

  it("adds the script once, on first use, and waits for Places and the geocoder", async () => {
    const importLibrary = vi.fn<(name: string) => Promise<unknown>>(() => Promise.resolve({}));
    vi.stubGlobal("google", { maps: { importLibrary } });
    const { loadGoogleMaps } = await import("./googleMaps");
    expect(mapsScripts()).toHaveLength(0);

    const loads = Promise.all([loadGoogleMaps(), loadGoogleMaps()]);
    expect(mapsScripts()).toHaveLength(1);
    const url = new URL(mapsScripts()[0].src);
    expect(url.searchParams.get("key")).toBe("test");
    expect(url.searchParams.get("loading")).toBe("async");

    // Google calls the callback named in the URL once the API is ready.
    (window as unknown as Record<string, () => void>)[url.searchParams.get("callback")!]();
    await loads;
    expect(importLibrary).toHaveBeenCalledWith("places");
    expect(importLibrary).toHaveBeenCalledWith("geocoding");
  });

  it("lets a later call try again after the script fails to load", async () => {
    const { loadGoogleMaps } = await import("./googleMaps");
    const failed = loadGoogleMaps();
    mapsScripts()[0].dispatchEvent(new Event("error"));
    await expect(failed).rejects.toThrow("Google Maps failed to load.");
    expect(mapsScripts()).toHaveLength(0);

    void loadGoogleMaps().catch(() => {});
    expect(mapsScripts()).toHaveLength(1);
  });
});
