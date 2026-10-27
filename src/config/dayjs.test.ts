import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import "./dayjs";

describe("dayjs setup", () => {
  it("parses with an explicit format, strictly", () => {
    expect(dayjs("2026-10-15", "YYYY-MM-DD", true).isValid()).toBe(true);
    expect(dayjs("15-10-2026", "YYYY-MM-DD", true).isValid()).toBe(false);
  });

  it("formats parsed dates the way the old moment calls did", () => {
    expect(
      dayjs("2026-10-15 13:05:00", "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD hh:mm A"),
    ).toBe("2026-10-15 01:05 PM");
  });

  it("supports the start-of-day comparison used by the podcast schedule", () => {
    const yesterday = dayjs("2026-10-14", "YYYY-MM-DD", true);
    expect(yesterday.isBefore(dayjs("2026-10-15T09:00:00").startOf("day"))).toBe(true);
  });
});
