import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// jsdom has no layout engine; ProseMirror (rich-text editor) and antd call these.
if (!document.elementFromPoint) document.elementFromPoint = () => null;
const emptyRect = { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0 };
Range.prototype.getClientRects ??= () => Object.assign([], { item: () => null });
Range.prototype.getBoundingClientRect ??= () => ({ ...emptyRect, toJSON: () => emptyRect });
// antd measures the scrollbar via getComputedStyle(el, "::-webkit-scrollbar"), which jsdom
// only supports by logging "Not implemented"; drop the pseudo-element argument instead.
const getComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = (el: Element) => getComputedStyle(el);
window.matchMedia ??= (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent: () => false,
});
