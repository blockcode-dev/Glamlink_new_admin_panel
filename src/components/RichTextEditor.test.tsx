import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RichTextEditor from "./RichTextEditor";

const journalHtml =
  '<p class="topic-tagged-paragraph" data-paragraph-id="para_1" data-topic-ids="3" data-topic-names="Facelift">Tagged</p>' +
  '<p>See <a href="https://glamlink.net/access-card/luxe" target="_blank" rel="noopener noreferrer" class="mention-tag" data-card-id="42">@luxe</a></p>';

const topics = [
  { id: 3, name: "Facelift" },
  { id: 7, name: "Botox" },
];
const fullProps = {
  full: true,
  uploadMedia: async () => "https://cdn.example.com/file",
  mentions: { search: () => [], toLink: () => null },
  topics,
};

describe("RichTextEditor", () => {
  it("shows font and media tools only in full mode", () => {
    const { container, unmount } = render(<RichTextEditor value="<p>Hi</p>" onChange={() => {}} />);
    expect(container.querySelector(".ProseMirror")).toHaveTextContent("Hi");
    expect(container.querySelectorAll(".rte__toolbar .ant-select")).toHaveLength(1); // block type only
    expect(screen.queryByRole("button", { name: /topic/i })).not.toBeInTheDocument();
    unmount();

    const full = render(<RichTextEditor {...fullProps} value="" onChange={() => {}} />);
    expect(full.container.querySelectorAll(".rte__toolbar .ant-select")).toHaveLength(3); // block, font, size
    expect(screen.getByRole("button", { name: /topic/i })).toBeInTheDocument();
  });

  it("shows content that arrives after mount without reporting a change", () => {
    const onChange = vi.fn<(html: string) => void>();
    const { container, rerender } = render(<RichTextEditor {...fullProps} value="" onChange={onChange} />);
    rerender(<RichTextEditor {...fullProps} value={journalHtml} onChange={onChange} />);

    const doc = container.querySelector(".ProseMirror")!;
    expect(doc.querySelector('p.topic-tagged-paragraph[data-topic-ids="3"]')).toBeInTheDocument();
    expect(doc.querySelector('a.mention-tag[data-card-id="42"]')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("tags the paragraph at the cursor with the topics picked in the dialog", async () => {
    const onChange = vi.fn<(html: string) => void>();
    render(<RichTextEditor {...fullProps} value="<p>Untagged paragraph</p>" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /topic/i }));
    fireEvent.click(await screen.findByRole("checkbox", { name: "Botox" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const html = onChange.mock.calls.at(-1)![0];
    const root = document.createElement("div");
    root.innerHTML = html;
    const p = root.querySelector("p");
    expect(p).toHaveClass("topic-tagged-paragraph");
    expect(p).toHaveAttribute("data-topic-ids", "7");
    expect(p).toHaveAttribute("data-topic-names", "Botox");
    expect(p?.getAttribute("data-paragraph-id")).toMatch(/^para_/);
  });

  it("offers only the website's formatting in simple mode, with a character count", () => {
    render(<RichTextEditor simple maxLength={80} value="<p>Hello <strong>there</strong></p>" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /strikethrough/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /table/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /html source/i })).not.toBeInTheDocument();
    expect(screen.getByText("11 / 80 characters")).toBeInTheDocument();
  });

  it("drops scripts and unsafe embeds from loaded content", () => {
    const hostile =
      '<p>Hi<img src="x" onerror="steal()"></p>' +
      '<p><iframe src="javascript:steal()"></iframe><iframe src="https://www.youtube.com/embed/abc"></iframe></p>' +
      '<p><a href="javascript:steal()">link</a></p>';
    const { container } = render(<RichTextEditor value={hostile} onChange={() => {}} />);

    const doc = container.querySelector(".ProseMirror")!;
    expect(doc.innerHTML).not.toMatch(/onerror|javascript:/i);
    const frames = doc.querySelectorAll("iframe");
    expect(frames).toHaveLength(1);
    expect(frames[0]).toHaveAttribute("src", "https://www.youtube.com/embed/abc");
  });
});
