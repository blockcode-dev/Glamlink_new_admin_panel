// CSV exports carry names and descriptions that app users and sellers wrote.

type Cell = string | number | boolean | null | undefined;

// Spreadsheet apps run a cell that starts with one of these as a formula
// (e.g. =HYPERLINK(...)), so such cells get a leading apostrophe. Phone numbers
// and signed numbers ("+91 98765 43210", "-5") can't call anything and stay as they are.
const FORMULA_START = /^[=+\-@\t\r]/;
const PLAIN_NUMBER = /^[+-]?[\d\s().-]+$/;

const csvCell = (value: Cell): string => {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (typeof value === "string" && FORMULA_START.test(text) && !PLAIN_NUMBER.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) || text !== text.trim() ? `"${text.replace(/"/g, '""')}"` : text;
};

/** One CSV document: a header row, then one line per row. */
export const toCsv = (header: string[], rows: Cell[][]): string =>
  [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");

/** Saves `toCsv(header, rows)` as `filename`. */
export const downloadCsv = (filename: string, header: string[], rows: Cell[][]) => {
  // The BOM makes Excel read the file as UTF-8.
  saveFile(new Blob(["﻿", toCsv(header, rows)], { type: "text/csv;charset=utf-8" }), filename);
};

/** Hands a file (e.g. a CSV the API made) to the browser to save as `filename`. */
export const saveFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
