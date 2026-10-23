import { describe, expect, it } from "vitest";
import { cropUnsupportedReason } from "./cropVideo";

// The encode itself needs WebCodecs, which jsdom doesn't have; it was checked in
// headless Chrome (MP4 and WebM-with-audio sources, exact output size, audio removed).
describe("cropUnsupportedReason", () => {
  it("explains when the browser has no video encoder", async () => {
    expect(typeof VideoEncoder).toBe("undefined");
    expect(await cropUnsupportedReason(600, 500)).toMatch(/can't encode video/);
  });
});
