import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("quotes cells with commas, quotes and line breaks", () => {
    expect(toCsv(["Name", "Note"], [['Glow, "Co"', "line 1\nline 2"]])).toBe(
      'Name,Note\r\n"Glow, ""Co""","line 1\nline 2"',
    );
  });

  it("neutralises cells a spreadsheet would run as a formula", () => {
    expect(toCsv(["Name"], [['=HYPERLINK("https://evil.example","Click")'], ["@SUM(A1)"], ["+cmd|' /C calc'!A0"]])).toBe(
      "Name\r\n\"'=HYPERLINK(\"\"https://evil.example\"\",\"\"Click\"\")\"\r\n'@SUM(A1)\r\n'+cmd|' /C calc'!A0",
    );
  });

  it("leaves phone numbers, numbers and empty cells alone", () => {
    expect(toCsv(["Mobile", "Price", "Stock", "Email"], [["+91 98765 43210", -5, 0, null]])).toBe(
      "Mobile,Price,Stock,Email\r\n+91 98765 43210,-5,0,",
    );
  });
});
