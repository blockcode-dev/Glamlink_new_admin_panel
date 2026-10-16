import DOMPurify, { type Config } from "dompurify";

// Stored HTML (bios, descriptions, FAQ answers, journal bodies) is written by
// app users, sellers and admins, so every string is cleaned before it is
// rendered or loaded into the editor. The admin token sits in localStorage, so
// one script running here could take over the panel.

/** Embeds must come from an https page; anything else (javascript:, data:, http:) is dropped. */
export const isSafeEmbedSrc = (src: string | null | undefined): boolean =>
  /^https:\/\//i.test(src?.trim() ?? "");

// Lets video players (YouTube, Vimeo) run, but not navigate the panel or open dialogs.
const IFRAME_SANDBOX = "allow-scripts allow-same-origin allow-popups allow-presentation";

const CONFIG: Config = {
  // DOMPurify's defaults keep formatting, links, images, tables, video/source, class,
  // style and data-* attributes, and drop scripts, event handlers and javascript: URLs.
  // Embeds and link targets are what the editor adds on top.
  ADD_TAGS: ["iframe"],
  ADD_ATTR: ["target", "allow", "allowfullscreen", "frameborder"],
  // <style> restyles the whole panel and forms can phish; content never needs either.
  FORBID_TAGS: ["style", "form", "input", "button", "select", "textarea", "option"],
};

// A separate instance, so these hooks don't apply to other DOMPurify users.
const purify = DOMPurify(window);

purify.addHook("uponSanitizeElement", (node, data) => {
  if (data.tagName === "iframe" && node instanceof Element && !isSafeEmbedSrc(node.getAttribute("src"))) {
    node.remove();
  }
});

purify.addHook("afterSanitizeAttributes", (node) => {
  if (!(node instanceof HTMLElement)) return;
  // A fixed or absolute box could cover the panel with a fake screen.
  node.style.removeProperty("position");
  if (node.tagName === "IFRAME") node.setAttribute("sandbox", IFRAME_SANDBOX);
  if (node.tagName === "A" && node.hasAttribute("target")) node.setAttribute("rel", "noopener noreferrer");
});

/** Returns `html` with anything that could run code or take over the page removed. */
export const sanitizeHtml = (html: string | null | undefined): string =>
  html ? purify.sanitize(html, CONFIG) : "";

/** Plain text of an HTML string. Parsing happens in an inert document, so nothing loads or runs. */
export const htmlToText = (html: string | null | undefined): string =>
  html ? (new DOMParser().parseFromString(html, "text/html").body.textContent ?? "") : "";
