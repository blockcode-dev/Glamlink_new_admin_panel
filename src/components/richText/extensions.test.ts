// Content saved by the old editor (TinyMCE) must survive being loaded and
// re-saved: the journal topic sync and the public site read these attributes.
import { afterEach, describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import { buildExtensions } from "./extensions";

const editors: Editor[] = [];
const load = (html: string) => {
  const editor = new Editor({
    element: document.createElement("div"),
    extensions: buildExtensions(() => ({})),
    content: html,
  });
  editors.push(editor);
  return editor;
};
// Parse into an element of this document so jest-dom matchers accept the nodes.
const toDom = (html: string) => {
  const root = document.createElement("div");
  root.innerHTML = html;
  return root;
};
const roundTrip = (html: string) => toDom(load(html).getHTML());

afterEach(() => {
  editors.splice(0).forEach((e) => e.destroy());
});

describe("legacy journal HTML round-trip", () => {
  it("keeps business mentions", () => {
    const a = roundTrip(
      '<p>Visit <a href="https://glamlink.net/access-card/luxe" target="_blank" rel="noopener noreferrer" class="mention-tag" data-card-id="42">@luxe</a>&nbsp;today</p>',
    ).querySelector("a");
    expect(a).toHaveClass("mention-tag");
    expect(a).toHaveAttribute("data-card-id", "42");
    expect(a).toHaveAttribute("href", "https://glamlink.net/access-card/luxe");
    expect(a).toHaveAttribute("target", "_blank");
    expect(a).toHaveAttribute("rel", "noopener noreferrer");
    expect(a).toHaveTextContent("@luxe");
  });

  it.each([
    ["paragraph", '<p class="topic-tagged-paragraph" data-paragraph-id="para_1" data-topic-ids="3,7" data-topic-names="Facelift, Botox">Text</p>', "p"],
    ["heading", '<h2 class="topic-tagged-paragraph" data-paragraph-id="para_1" data-topic-ids="3,7" data-topic-names="Facelift, Botox">Text</h2>', "h2"],
    ["quote", '<blockquote class="topic-tagged-paragraph" data-paragraph-id="para_1" data-topic-ids="3,7" data-topic-names="Facelift, Botox"><p>Text</p></blockquote>', "blockquote"],
    ["list item", '<ul><li class="topic-tagged-paragraph" data-paragraph-id="para_1" data-topic-ids="3,7" data-topic-names="Facelift, Botox">Text</li></ul>', "li"],
  ])("keeps topic tags on a %s", (_, html, selector) => {
    const el = roundTrip(html).querySelector(selector);
    expect(el).toHaveClass("topic-tagged-paragraph");
    expect(el).toHaveAttribute("data-paragraph-id", "para_1");
    expect(el).toHaveAttribute("data-topic-ids", "3,7");
    expect(el).toHaveAttribute("data-topic-names", "Facelift, Botox");
  });

  it("does not copy a paragraph's topic tag into the next paragraph on Enter", () => {
    const editor = load(
      '<p class="topic-tagged-paragraph" data-paragraph-id="para_x" data-topic-ids="9" data-topic-names="Lips">Tagged</p>',
    );
    editor.commands.setTextSelection(editor.state.doc.content.size - 1);
    editor.commands.splitBlock();
    editor.commands.insertContent("new paragraph");
    const html = editor.getHTML();
    expect(html.match(/data-paragraph-id="para_x"/g)).toHaveLength(1);
    expect(html).toContain("<p>new paragraph</p>");
  });

  it("keeps uploaded videos with their source", () => {
    const body = roundTrip(
      '<video controls="controls" width="100%" style="width:100%;border-radius:12px;"><source src="https://cdn.example.com/v.mp4" type="video/mp4"></video>',
    );
    expect(body.querySelector("video")).toHaveAttribute("controls");
    expect(body.querySelector("video source")).toHaveAttribute("src", "https://cdn.example.com/v.mp4");
    expect(body.querySelector("video source")).toHaveAttribute("type", "video/mp4");
  });

  it("keeps embedded iframes inside their paragraph", () => {
    const body = roundTrip(
      '<p><iframe src="https://www.youtube.com/embed/xyz" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>',
    );
    expect(body.querySelector("p > iframe")).toHaveAttribute("src", "https://www.youtube.com/embed/xyz");
    expect(body.querySelectorAll("p")).toHaveLength(1);
  });

  it("keeps table borders and cell widths", () => {
    const body = roundTrip(
      '<table style="border-collapse: collapse; width: 100%;" border="1"><tbody><tr><td style="width: 50%;">A</td><td style="width: 50%;">B</td></tr></tbody></table>',
    );
    expect(body.querySelector("table")).toHaveAttribute("border", "1");
    expect(body.querySelector("table")?.getAttribute("style")).toContain("border-collapse: collapse");
    expect(body.querySelector("td")?.getAttribute("style")).toContain("width: 50%");
  });

  it("keeps fonts, sizes, colours and alignment", () => {
    const body = roundTrip(
      '<p style="text-align: center;"><span style="font-family: georgia, palatino, serif; font-size: 18pt; color: #e03e2d; background-color: #fbeeb8;">Styled</span></p>',
    );
    expect(body.querySelector("p")?.style.textAlign).toBe("center");
    const span = body.querySelector("span")!;
    expect(span.style.fontFamily).toContain("georgia");
    expect(span.style.fontSize).toBe("18pt");
    expect(span.style.color).toBe("rgb(224, 62, 45)");
    expect(span.style.backgroundColor).toBe("rgb(251, 238, 184)");
  });

  it("keeps images inline with their size and style", () => {
    const img = roundTrip(
      '<p>Before <img src="https://cdn.example.com/a.jpg" alt="a" width="300" height="200" style="float: left;"> after</p>',
    ).querySelector<HTMLImageElement>("p > img")!;
    expect(img).toHaveAttribute("width", "300");
    expect(img).toHaveAttribute("height", "200");
    expect(img.style.float).toBe("left");
  });
});
