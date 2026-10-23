import { describe, expect, it } from "vitest";
import { htmlToText, isSafeEmbedSrc, sanitizeHtml } from "./sanitizeHtml";

describe("sanitizeHtml", () => {
  it("removes scripts, event handlers and javascript: links", () => {
    const html = sanitizeHtml(
      '<p onclick="steal()">Hi<script>steal()</script></p><img src="x" onerror="steal()"><a href="javascript:steal()">link</a>',
    );
    expect(html).not.toMatch(/script|onclick|onerror|javascript:/i);
    expect(html).toContain("<p>Hi</p>");
    expect(html).toContain('<img src="x">');
  });

  it("removes <style> tags and forms, keeping their visible text", () => {
    const html = sanitizeHtml(
      '<style>body{display:none}</style><form action="https://evil.example"><input name="password"><button>Go</button></form><p>ok</p>',
    );
    expect(html).toBe("Go<p>ok</p>");
  });

  it("keeps the markup the editor writes", () => {
    const source =
      '<p class="topic" data-paragraph-id="p1" data-topic-ids="1,2" data-topic-names="Hair">Text</p>' +
      '<p><a class="mention-tag" data-card-id="7" href="https://glamlink.example/card/7">@Studio</a></p>' +
      '<video controls=""><source src="https://cdn.example/v.mp4" type="video/mp4"></video>' +
      '<table style="border-collapse: collapse;" border="1"><tbody><tr><td style="width: 50%;">Cell</td></tr></tbody></table>';
    expect(sanitizeHtml(source)).toBe(source);
  });

  it("keeps https embeds, sandboxed, and drops other embeds", () => {
    const html = sanitizeHtml(
      '<iframe src="https://www.youtube.com/embed/abc" allowfullscreen="true" frameborder="0"></iframe>' +
        '<iframe src="javascript:steal()"></iframe><iframe src="http://insecure.example"></iframe><iframe srcdoc="<script>steal()</script>"></iframe>',
    );
    const frames = new DOMParser().parseFromString(html, "text/html").querySelectorAll("iframe");
    expect(frames).toHaveLength(1);
    expect(frames[0].getAttribute("src")).toBe("https://www.youtube.com/embed/abc");
    expect(frames[0].getAttribute("sandbox")).toBe("allow-scripts allow-same-origin allow-popups allow-presentation");
    expect(frames[0].hasAttribute("allowfullscreen")).toBe(true);
  });

  it("strips position from inline styles, so content can't cover the page", () => {
    const html = sanitizeHtml('<div style="position: fixed; inset: 0px; color: red;">Session expired</div>');
    expect(html).not.toContain("position");
    expect(html).toContain("color: red");
  });

  it("adds rel=noopener to links that open a new tab", () => {
    expect(sanitizeHtml('<a href="https://example.com" target="_blank">x</a>')).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">x</a>',
    );
  });

  it("returns an empty string for empty input", () => {
    expect(sanitizeHtml(null)).toBe("");
    expect(sanitizeHtml(undefined)).toBe("");
    expect(sanitizeHtml("")).toBe("");
  });
});

describe("isSafeEmbedSrc", () => {
  it("accepts only https URLs", () => {
    expect(isSafeEmbedSrc("https://player.vimeo.com/video/1")).toBe(true);
    expect(isSafeEmbedSrc(" HTTPS://example.com")).toBe(true);
    expect(isSafeEmbedSrc("http://example.com")).toBe(false);
    expect(isSafeEmbedSrc("javascript:alert(1)")).toBe(false);
    expect(isSafeEmbedSrc("data:text/html,<script>1</script>")).toBe(false);
    expect(isSafeEmbedSrc(null)).toBe(false);
  });
});

describe("htmlToText", () => {
  it("returns the text without running handlers", () => {
    let ran = false;
    (window as unknown as { onTest: () => void }).onTest = () => (ran = true);
    expect(htmlToText('<p>Hello <b>world</b></p><img src="x" onerror="onTest()">')).toBe("Hello world");
    expect(ran).toBe(false);
  });
});
