import { describe, expect, it, vi } from "vitest";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { FormInstance, FormRule } from "antd";
import { bioRules, existingCardId, phoneRules, showCardError, videoProblem } from "./cardRules";

const run = (rules: FormRule[], value: unknown) =>
  Promise.all(rules.map((rule) => (typeof rule === "function" ? rule({} as FormInstance) : rule).validator?.({} as never, value, () => {})));

const apiError = (status: number, data: unknown) =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", {} as InternalAxiosRequestConfig, null, {
    status,
    statusText: "",
    data,
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  });

describe("card form rules", () => {
  it("counts the bio's text, not its markup, against 80 characters", async () => {
    await expect(run(bioRules, `<p><strong>${"a".repeat(80)}</strong></p>`)).resolves.toBeDefined();
    await expect(run(bioRules, `<p>${"a".repeat(81)}</p>`)).rejects.toThrow("at most 80 characters (now 81)");
    await expect(run(bioRules, "<p> </p>")).rejects.toThrow("Bio is required");
  });

  it("wants 10 digits only while the phone is shown", async () => {
    const form = (visible: boolean) => ({ getFieldValue: () => visible }) as unknown as FormInstance;
    await expect(run(phoneRules(form(true)), "(555) 123-4567")).resolves.toBeDefined();
    await expect(run(phoneRules(form(true)), "555-1234")).rejects.toThrow("10-digit");
    await expect(run(phoneRules(form(false)), "")).resolves.toBeDefined();
  });

  it("refuses videos that aren't MP4 or are over 21 MB", async () => {
    expect(await videoProblem(new File(["x"], "clip.mov", { type: "video/quicktime" }))).toMatch("MP4");
    const big = new File(["x"], "clip.mp4", { type: "video/mp4" });
    Object.defineProperty(big, "size", { value: 22 * 1024 * 1024 });
    expect(await videoProblem(big)).toMatch("21 MB");
  });
});

describe("card API errors", () => {
  it("puts an INVALID_CARD message on the field it names", () => {
    const form = { setFields: vi.fn<FormInstance["setFields"]>(), scrollToField: vi.fn<FormInstance["scrollToField"]>() } as unknown as FormInstance;
    const error = apiError(400, { code: "INVALID_CARD", message: "Add an Instagram handle.", details: { field: "instagram" } });
    expect(showCardError(form, error)).toBe("Add an Instagram handle.");
    expect(form.setFields).toHaveBeenCalledWith([{ name: "instagram_links", errors: ["Add an Instagram handle."] }]);
    expect(showCardError(form, apiError(500, { message: "Boom" }))).toBeNull();
  });

  it("recognises CARD_EXISTS", () => {
    expect(existingCardId(apiError(409, { code: "CARD_EXISTS", details: { card_id: 7 } }))).toBe(7);
    expect(existingCardId(apiError(400, { code: "INVALID_CARD" }))).toBeNull();
  });
});
