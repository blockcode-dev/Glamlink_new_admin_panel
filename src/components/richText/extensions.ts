/** @format */

// Custom Tiptap extensions for RichTextEditor. They keep the HTML shapes that
// existing content (written with the old editor) already uses, so loading and
// re-saving a record does not strip anything:
//   - paragraph topic tags: data-paragraph-id / data-topic-ids / data-topic-names + class
//   - business mentions:    <a class="mention-tag" data-card-id="..">
//   - uploaded videos:      <video controls><source src type></video>
//   - embeds:               <iframe>
//   - table borders/widths and image styles
import { Extension, Node } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { isSafeEmbedSrc } from "../../utils/sanitizeHtml";

/** One row of the "@" suggestion list. */
export interface MentionItem {
  id: number | string;
  label: string;
  hint?: string;
  avatar?: string;
}

/** The link a chosen mention becomes. */
export interface MentionLink {
  text: string;
  /** Card URL; cards without a link still insert a (link-less) mention. */
  href: string | null | undefined;
  cardId: number | string;
}

export interface MentionSource {
  search: (query: string) => MentionItem[];
  toLink: (id: MentionItem["id"]) => MentionLink | null;
}

/** What the "@" extension reads from the editor on every keystroke. */
export interface MentionOptions {
  mentions?: MentionSource;
  mentionRenderer?: ReturnType<NonNullable<SuggestionOptions<MentionItem>["render"]>>;
}

const attr = (name: string, { keepOnSplit = true }: { keepOnSplit?: boolean } = {}) => ({
  default: null,
  keepOnSplit,
  parseHTML: (el: HTMLElement) => el.getAttribute(name),
  renderHTML: (attrs: Record<string, unknown>) => {
    const value = attrs[toCamel(name)];
    return value ? { [name]: value } : {};
  },
});
const toCamel = (name: string) =>
  name.replace(/^data-/, "").replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

export const TOPIC_BLOCK_TYPES = ["paragraph", "heading", "listItem", "blockquote"];

export const PreservedAttributes = Extension.create({
  name: "preservedAttributes",
  addGlobalAttributes() {
    return [
      {
        // A new paragraph created by pressing Enter must not inherit the tag.
        types: TOPIC_BLOCK_TYPES,
        attributes: {
          paragraphId: attr("data-paragraph-id", { keepOnSplit: false }),
          topicIds: attr("data-topic-ids", { keepOnSplit: false }),
          topicNames: attr("data-topic-names", { keepOnSplit: false }),
          class: attr("class", { keepOnSplit: false }),
        },
      },
      { types: ["link"], attributes: { cardId: attr("data-card-id") } },
      { types: ["image"], attributes: { style: attr("style") } },
      { types: ["table"], attributes: { style: attr("style"), border: attr("border") } },
      { types: ["tableCell", "tableHeader"], attributes: { style: attr("style") } },
    ];
  },
});

export const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (el) =>
          el.getAttribute("src") || el.querySelector("source")?.getAttribute("src"),
        renderHTML: () => ({}),
      },
      type: {
        default: null,
        parseHTML: (el) => el.querySelector("source")?.getAttribute("type"),
        renderHTML: () => ({}),
      },
      width: { default: null },
      style: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: "video" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const { src, type } = node.attrs;
    return [
      "video",
      { controls: "", ...HTMLAttributes },
      ["source", { src, ...(type ? { type } : {}) }],
    ];
  },
});

// Inline, like the old editor's media embeds (<p><iframe></p>).
export const Iframe = Node.create({
  name: "iframe",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      width: { default: null },
      height: { default: null },
      style: { default: null },
      title: { default: null },
      allow: { default: null },
      frameborder: { default: null },
      allowfullscreen: { default: null },
    };
  },
  parseHTML() {
    // Only https embeds; a javascript: or data: src would run inside the panel.
    return [{ tag: "iframe[src]", getAttrs: (el) => (isSafeEmbedSrc(el.getAttribute("src")) ? null : false) }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["iframe", HTMLAttributes];
  },
});

// "@" suggestions. `getOptions()` returns the editor's current props, so the
// list always reflects the latest data without rebuilding the editor.
export const createMentionExtension = (getOptions: () => MentionOptions) =>
  Extension.create({
    name: "businessMention",
    addProseMirrorPlugins() {
      return [
        Suggestion<MentionItem, MentionItem>({
          editor: this.editor,
          pluginKey: new PluginKey("businessMention"),
          char: "@",
          allow: () => Boolean(getOptions().mentions),
          items: ({ query }) => getOptions().mentions?.search(query) || [],
          command: ({ editor, range, props }) => {
            const link = getOptions().mentions?.toLink(props.id);
            if (!link) return;
            editor
              .chain()
              .focus()
              .insertContentAt(range, [
                {
                  type: "text",
                  text: link.text,
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: link.href,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        class: "mention-tag",
                        cardId: String(link.cardId),
                      },
                    },
                  ],
                },
                { type: "text", text: " " },
              ])
              .run();
          },
          render: () => getOptions().mentionRenderer ?? {},
        }),
      ];
    },
  });

// Everything RichTextEditor loads. `getOptions` is passed to the "@" mention extension.
export const buildExtensions = (getOptions: () => MentionOptions) => [
  StarterKit.configure({
    link: {
      openOnClick: false,
      HTMLAttributes: { target: null, rel: null },
    },
  }),
  TextStyleKit,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Image.configure({ inline: true, allowBase64: true }),
  TableKit.configure({ table: { resizable: false } }),
  Video,
  Iframe,
  PreservedAttributes,
  createMentionExtension(getOptions),
];
