/** @format */

import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { ChainedCommands, EditorEvents } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import type { EditorState } from "@tiptap/pm/state";
import {
  Button,
  Checkbox,
  ColorPicker,
  Divider,
  Dropdown,
  Empty,
  Input,
  Modal,
  Select,
  Tooltip,
  message,
} from "antd";
import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  ClearOutlined,
  CodeOutlined,
  DisconnectOutlined,
  FontColorsOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  HighlightOutlined,
  ItalicOutlined,
  LinkOutlined,
  MenuOutlined,
  OrderedListOutlined,
  PictureOutlined,
  RedoOutlined,
  TableOutlined,
  TagsOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  UndoOutlined,
  UnorderedListOutlined,
  VideoCameraAddOutlined,
} from "@ant-design/icons";
import {
  buildExtensions,
  TOPIC_BLOCK_TYPES,
  type MentionItem,
  type MentionOptions,
  type MentionSource,
} from "./richText/extensions";
import { sanitizeHtml } from "../utils/sanitizeHtml";
import "./RichTextEditor.scss";

const FONT_FAMILIES = [
  { label: "Arial", value: "arial, helvetica, sans-serif" },
  { label: "Calibri", value: "calibri, arial, helvetica, sans-serif" },
  { label: "Times New Roman", value: "times new roman, times, serif" },
  { label: "Georgia", value: "georgia, palatino, serif" },
  { label: "Verdana", value: "verdana, geneva, sans-serif" },
  { label: "Courier New", value: "courier new, courier, monospace" },
];
const FONT_SIZES = ["8pt", "10pt", "12pt", "14pt", "18pt", "24pt", "36pt"];
const BLOCKS = [
  { label: "Paragraph", value: "p" },
  ...[1, 2, 3, 4, 5, 6].map((level) => ({ label: `Heading ${level}`, value: `h${level}` })),
];
// The website's bio editor allows paragraphs and h3 only (the API cleans to that list).
const SIMPLE_BLOCKS = BLOCKS.filter((b) => b.value === "p" || b.value === "h3");
const TAGGED_CLASS = "topic-tagged-paragraph";
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface Topic {
  id: number;
  name: string;
}

export interface UploadMediaOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  height?: number;
  full?: boolean;
  /**
   * The website's formatting only (paragraph or h3, bold, italic, underline, strike,
   * lists, quotes, links): no fonts, colours, tables, media or HTML source. For fields
   * the API cleans to that list, such as an access card's bio.
   */
  simple?: boolean;
  /** Shows a character counter (text only, not markup) against this limit. */
  maxLength?: number;
  uploadMedia?: (file: File, options: UploadMediaOptions) => Promise<string>;
  mentions?: MentionSource;
  topics?: Topic[];
}

interface MentionUi {
  items: MentionItem[];
  index: number;
  rect: DOMRect | null | undefined;
}

interface EditorRefs extends MentionOptions {
  insertDroppedImages: (files: FileList | undefined, pos: number | null) => boolean;
}

const toggleClass = (classes: string | null | undefined, name: string, on: boolean) => {
  const list = (classes || "").split(/\s+/).filter((c) => c && c !== name);
  if (on) list.push(name);
  return list.length ? list.join(" ") : null;
};

// The block a topic tag applies to: the nearest paragraph / heading / quote /
// list item around the cursor (a paragraph inside a list item tags the item).
const findTopicBlock = (state: EditorState): { node: PMNode; pos: number } | null => {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (!TOPIC_BLOCK_TYPES.includes(node.type.name)) continue;
    if (node.type.name === "paragraph" && depth > 1 && $from.node(depth - 1).type.name === "listItem") {
      return { node: $from.node(depth - 1), pos: $from.before(depth - 1) };
    }
    return { node, pos: $from.before(depth) };
  }
  return null;
};

const newParagraphId = (doc: PMNode) => {
  const used = new Set<string>();
  doc.descendants((n) => {
    if (n.attrs?.paragraphId) used.add(n.attrs.paragraphId);
  });
  let id: string;
  do {
    id = `para_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  } while (used.has(id));
  return id;
};

const pickFile = (accept: string) =>
  new Promise<File | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => resolve(input.files?.[0] || null);
    input.click();
  });

/**
 * The app's single rich-text editor (Tiptap). `value` is an HTML string and
 * `onChange` receives the new HTML ("" when empty). Works standalone or inside
 * an antd Form.Item.
 *
 * Optional features:
 *  - `full`:        fonts, colours, alignment, images and video
 *  - `uploadMedia`: (file, { onProgress, signal }) => Promise<url>, used for images/video
 *  - `mentions`:    { search(query), toLink(id) } enables "@" business tags
 *  - `topics`:      [{ id, name }] enables tagging a paragraph with topics
 */
const RichTextEditor = ({
  value,
  onChange,
  height = 300,
  full = false,
  simple = false,
  maxLength,
  uploadMedia,
  mentions,
  topics,
}: RichTextEditorProps) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [source, setSource] = useState<string | null>(null); // HTML being edited in source view
  const [linkModal, setLinkModal] = useState<{ href: string; newTab: boolean } | null>(null);
  const [topicModal, setTopicModal] = useState<{ pos: number; selected: number[]; search: string } | null>(null);
  const [mentionUi, setMentionUi] = useState<MentionUi | null>(null);
  const mentionState = useRef<{ items: MentionItem[]; index: number; command: ((item: MentionItem) => void) | null }>({
    items: [],
    index: 0,
    command: null,
  });
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const showMention = (items: MentionItem[], index: number, rect: DOMRect | null | undefined) => {
    mentionState.current = { ...mentionState.current, items, index };
    setMentionUi(items.length ? { items, index, rect } : null);
  };
  const optionsRef = useRef<EditorRefs | null>(null);
  optionsRef.current = {
    mentions,
    insertDroppedImages,
    mentionRenderer: {
      onStart: (props) => {
        mentionState.current.command = props.command;
        showMention(props.items, 0, props.clientRect?.());
      },
      onUpdate: (props) => {
        mentionState.current.command = props.command;
        showMention(props.items, 0, props.clientRect?.());
      },
      onKeyDown: ({ event }) => {
        const { items, index, command } = mentionState.current;
        if (!items.length) return false;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          const next = (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
          mentionState.current.index = next;
          setMentionUi((ui) => ui && { ...ui, index: next });
          return true;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          command?.(items[index]);
          return true;
        }
        if (event.key === "Escape") {
          setMentionUi(null);
          return true;
        }
        return false;
      },
      onExit: () => {
        mentionState.current = { items: [], index: 0, command: null };
        setMentionUi(null);
      },
    },
  };

  const editor = useEditor({
    extensions: buildExtensions(() => optionsRef.current ?? {}),
    // Stored and pasted HTML is sanitized on the way in: the editor renders it live.
    content: sanitizeHtml(value),
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: ed }) => onChangeRef.current?.(ed.isEmpty ? "" : ed.getHTML()),
    // These handlers are captured once at creation, so they go through the ref.
    editorProps: {
      transformPastedHTML: (html) => sanitizeHtml(html),
      handlePaste: (view, event) =>
        optionsRef.current?.insertDroppedImages(event.clipboardData?.files, null),
      handleDrop: (view, event) => {
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        return optionsRef.current?.insertDroppedImages(event.dataTransfer?.files, coords?.pos ?? null);
      },
    },
  });

  // Content that arrives after mount (edit pages load it from the API).
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if ((value || "") !== current) editor.commands.setContent(sanitizeHtml(value), { emitUpdate: false });
  }, [editor, value]);

  // ---- media upload ----
  const uploadImage = async (file: File, pos: number | null) => {
    if (!uploadMedia) return;
    const key = `image-upload-${Date.now()}`;
    message.loading({ key, content: `Uploading ${file.name}...`, duration: 0 });
    try {
      const url = await uploadMedia(file, {});
      const at = pos ?? editor.state.selection.from;
      editor.chain().focus().insertContentAt(at, { type: "image", attrs: { src: url, alt: file.name } }).run();
      message.destroy(key);
    } catch (err) {
      console.error("Image upload failed:", err);
      message.error({ key, content: "Image upload failed" });
    }
  };

  function insertDroppedImages(files: FileList | undefined, pos: number | null) {
    if (!uploadMedia || !full || !files?.length) return false;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!images.length) return false;
    images.forEach((file) => uploadImage(file, pos));
    return true;
  }

  const insertVideo = async () => {
    const file = await pickFile("video/*");
    if (!file || !uploadMedia) return;
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 100) message.warning("Large file — upload may take a while");

    // Keep the insert position valid while the admin keeps typing.
    let pos = editor.state.selection.from;
    const track = ({ transaction }: EditorEvents["transaction"]) => {
      pos = transaction.mapping.map(pos);
    };
    editor.on("transaction", track);
    const controller = new AbortController();
    const key = "video-upload";
    const progress = (percent: number) =>
      message.open({
        key,
        duration: 0,
        content: (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
            <span>
              <strong>Uploading video...</strong> {percent}% ({file.name}, {sizeMB.toFixed(1)} MB)
            </span>
            <Button danger size="small" onClick={() => controller.abort()}>
              Cancel
            </Button>
          </span>
        ),
      });
    progress(0);
    try {
      const url = await uploadMedia(file, { onProgress: progress, signal: controller.signal });
      if (!editor.isDestroyed) {
        editor
          .chain()
          .focus()
          .insertContentAt(pos, {
            type: "video",
            attrs: {
              src: url,
              type: file.type,
              width: "100%",
              style: "width:100%;border-radius:12px;margin:14px 0;background:#000;", // color-literal-ok: saved into the article HTML
            },
          })
          .run();
      }
      message.destroy(key);
      message.success("Video uploaded successfully");
    } catch (err) {
      message.destroy(key);
      if (err instanceof Error && err.name === "CanceledError") message.warning("Upload cancelled");
      else {
        console.error(err);
        message.error("Video upload failed");
      }
    } finally {
      editor.off("transaction", track);
    }
  };

  // ---- topic tags ----
  const openTopicModal = () => {
    const target = findTopicBlock(editor.state);
    if (!target) {
      message.warning("Click inside a paragraph, heading, list item, or quote first");
      return;
    }
    if (!topics?.length) {
      message.warning("No topics available yet — create one first");
      return;
    }
    const ids = (target.node.attrs.topicIds || "").split(",").filter(Boolean).map(Number);
    setTopicModal({ pos: target.pos, selected: ids, search: "" });
  };

  const saveTopics = () => {
    if (!topicModal || !topics) return;
    const { pos, selected } = topicModal;
    const node = editor.state.doc.nodeAt(pos);
    if (!node) return setTopicModal(null);
    const chosen = topics.filter((t) => selected.includes(t.id));
    const attrs =
      chosen.length === 0
        ? { ...node.attrs, topicIds: null, topicNames: null, paragraphId: null, class: toggleClass(node.attrs.class, TAGGED_CLASS, false) }
        : {
            ...node.attrs,
            paragraphId: node.attrs.paragraphId || newParagraphId(editor.state.doc),
            topicIds: chosen.map((t) => t.id).join(","),
            topicNames: chosen.map((t) => t.name).join(", "),
            class: toggleClass(node.attrs.class, TAGGED_CLASS, true),
          };
    editor.chain().focus().command(({ tr }) => {
      tr.setNodeMarkup(pos, undefined, attrs);
      return true;
    }).run();
    if (chosen.length === 0) message.info("Topic tags removed from this paragraph");
    else message.success(`Paragraph tagged with: ${attrs.topicNames}`);
    setTopicModal(null);
  };

  // ---- links ----
  const openLinkModal = () => {
    const current = editor.getAttributes("link");
    setLinkModal({ href: current.href || "", newTab: current.target === "_blank" });
  };
  const saveLink = () => {
    if (!linkModal) return;
    const { href, newTab } = linkModal;
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!href) chain.unsetLink().run();
    else
      chain
        .setLink({ href, target: newTab ? "_blank" : null, rel: newTab ? "noopener noreferrer" : null })
        .run();
    setLinkModal(null);
  };

  if (!editor) return null;

  const blockValue = (() => {
    for (let level = 1; level <= 6; level++) if (editor.isActive("heading", { level })) return `h${level}`;
    return "p";
  })();
  const setBlock = (v: string) => {
    const chain = editor.chain().focus();
    if (v === "p") chain.setParagraph().run();
    else chain.toggleHeading({ level: Number(v.slice(1)) as HeadingLevel }).run();
  };
  const textStyle = editor.getAttributes("textStyle");
  const tool = (
    title: string,
    icon: React.ReactNode,
    onClick: () => void,
    { active = false, disabled = false }: { active?: boolean; disabled?: boolean } = {},
  ) => (
    <Tooltip title={title} key={title}>
      <Button
        size="small"
        type={active ? "primary" : "text"}
        ghost={false}
        icon={icon}
        disabled={disabled || source !== null}
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()}
      />
    </Tooltip>
  );
  const sep = (key: string) => <Divider key={key} orientation="vertical" style={{ margin: "0 2px" }} />;
  const can = editor.can();
  const inTable = editor.isActive("table");
  const filteredTopics = topicModal
    ? (topics || []).filter((t) => t.name.toLowerCase().includes(topicModal.search.toLowerCase()))
    : [];

  return (
    <div className={`rte${fullscreen ? " rte--fullscreen" : ""}`}>
      <div className="rte__toolbar">
        {tool("Undo", <UndoOutlined />, () => editor.chain().focus().undo().run(), { disabled: !can.undo() })}
        {tool("Redo", <RedoOutlined />, () => editor.chain().focus().redo().run(), { disabled: !can.redo() })}
        {sep("s1")}
        <Select size="small" style={{ width: 120 }} value={blockValue} options={simple ? SIMPLE_BLOCKS : BLOCKS} onChange={setBlock} disabled={source !== null} />
        {full && (
          <>
            <Select
              size="small"
              style={{ width: 130 }}
              placeholder="Font"
              allowClear
              value={FONT_FAMILIES.find((f) => f.value === textStyle.fontFamily)?.value}
              options={FONT_FAMILIES}
              onChange={(v) => (v ? editor.chain().focus().setFontFamily(v).run() : editor.chain().focus().unsetFontFamily().run())}
              disabled={source !== null}
            />
            <Select
              size="small"
              style={{ width: 80 }}
              placeholder="Size"
              allowClear
              value={textStyle.fontSize || undefined}
              options={FONT_SIZES.map((s) => ({ label: s, value: s }))}
              onChange={(v) => (v ? editor.chain().focus().setFontSize(v).run() : editor.chain().focus().unsetFontSize().run())}
              disabled={source !== null}
            />
          </>
        )}
        {sep("s2")}
        {tool("Bold", <BoldOutlined />, () => editor.chain().focus().toggleBold().run(), { active: editor.isActive("bold") })}
        {tool("Italic", <ItalicOutlined />, () => editor.chain().focus().toggleItalic().run(), { active: editor.isActive("italic") })}
        {tool("Underline", <UnderlineOutlined />, () => editor.chain().focus().toggleUnderline().run(), { active: editor.isActive("underline") })}
        {simple && tool("Strikethrough", <StrikethroughOutlined />, () => editor.chain().focus().toggleStrike().run(), { active: editor.isActive("strike") })}
        {full && (
          <>
            <ColorPicker
              size="small"
              value={textStyle.color || "#000000"} // color-literal-ok: picker default for article text
              onChangeComplete={(c) => editor.chain().focus().setColor(c.toHexString()).run()}
              disabled={source !== null}
            >
              <Tooltip title="Text colour">
                <Button size="small" type="text" icon={<FontColorsOutlined style={{ color: textStyle.color }} />} />
              </Tooltip>
            </ColorPicker>
            <ColorPicker
              size="small"
              value={textStyle.backgroundColor || "#ffff00"} // color-literal-ok: picker default for article highlight
              onChangeComplete={(c) => editor.chain().focus().setBackgroundColor(c.toHexString()).run()}
              disabled={source !== null}
            >
              <Tooltip title="Background colour">
                <Button size="small" type="text" icon={<HighlightOutlined style={{ color: textStyle.backgroundColor }} />} />
              </Tooltip>
            </ColorPicker>
            {sep("s3")}
            {tool("Align left", <AlignLeftOutlined />, () => editor.chain().focus().setTextAlign("left").run(), { active: editor.isActive({ textAlign: "left" }) })}
            {tool("Align center", <AlignCenterOutlined />, () => editor.chain().focus().setTextAlign("center").run(), { active: editor.isActive({ textAlign: "center" }) })}
            {tool("Align right", <AlignRightOutlined />, () => editor.chain().focus().setTextAlign("right").run(), { active: editor.isActive({ textAlign: "right" }) })}
            {tool("Justify", <MenuOutlined />, () => editor.chain().focus().setTextAlign("justify").run(), { active: editor.isActive({ textAlign: "justify" }) })}
          </>
        )}
        {sep("s4")}
        {tool("Bullet list", <UnorderedListOutlined />, () => editor.chain().focus().toggleBulletList().run(), { active: editor.isActive("bulletList") })}
        {tool("Numbered list", <OrderedListOutlined />, () => editor.chain().focus().toggleOrderedList().run(), { active: editor.isActive("orderedList") })}
        {tool("Quote", <span className="rte__glyph">❝</span>, () => editor.chain().focus().toggleBlockquote().run(), { active: editor.isActive("blockquote") })}
        {sep("s5")}
        {tool("Link", <LinkOutlined />, openLinkModal, { active: editor.isActive("link") })}
        {tool("Remove link", <DisconnectOutlined />, () => editor.chain().focus().extendMarkRange("link").unsetLink().run(), { disabled: !editor.isActive("link") })}
        {full && uploadMedia && (
          <>
            {tool("Image", <PictureOutlined />, async () => {
              const file = await pickFile("image/*");
              if (file) uploadImage(file, null);
            })}
            {tool("Video", <VideoCameraAddOutlined />, insertVideo)}
          </>
        )}
        {!simple && (
        <Dropdown
          trigger={["click"]}
          disabled={source !== null}
          menu={{
            items: [
              { key: "insert", label: "Insert table", disabled: inTable },
              { type: "divider" },
              { key: "rowAfter", label: "Add row below", disabled: !inTable },
              { key: "colAfter", label: "Add column right", disabled: !inTable },
              { key: "delRow", label: "Delete row", disabled: !inTable },
              { key: "delCol", label: "Delete column", disabled: !inTable },
              { key: "delTable", label: "Delete table", danger: true, disabled: !inTable },
            ],
            onClick: ({ key }) => {
              const c = editor.chain().focus();
              const actions: Record<string, () => ChainedCommands> = {
                insert: () => c.insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
                rowAfter: () => c.addRowAfter(),
                colAfter: () => c.addColumnAfter(),
                delRow: () => c.deleteRow(),
                delCol: () => c.deleteColumn(),
                delTable: () => c.deleteTable(),
              };
              actions[key]().run();
            },
          }}
        >
          <Tooltip title="Table">
            <Button size="small" type={inTable ? "primary" : "text"} icon={<TableOutlined />} disabled={source !== null} />
          </Tooltip>
        </Dropdown>
        )}
        {topics && (
          <>
            {sep("s6")}
            <Tooltip title="Tag this paragraph with one or more Topics">
              <Button size="small" icon={<TagsOutlined />} onClick={openTopicModal} onMouseDown={(e) => e.preventDefault()} disabled={source !== null}>
                Topic
              </Button>
            </Tooltip>
          </>
        )}
        {sep("s7")}
        {tool("Clear formatting", <ClearOutlined />, () => editor.chain().focus().unsetAllMarks().clearNodes().run())}
        {!simple && (
        <Tooltip title={source === null ? "Edit HTML source" : "Back to editor"}>
          <Button
            size="small"
            type={source === null ? "text" : "primary"}
            icon={<CodeOutlined />}
            onClick={() => {
              if (source === null) setSource(editor.isEmpty ? "" : editor.getHTML());
              else {
                editor.commands.setContent(sanitizeHtml(source), { emitUpdate: true });
                setSource(null);
              }
            }}
          />
        </Tooltip>
        )}
        {full &&
          tool(fullscreen ? "Exit full screen" : "Full screen", fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />, () => setFullscreen(!fullscreen))}
      </div>

      {source === null ? (
        <EditorContent editor={editor} className="rte__content" style={{ minHeight: height }} />
      ) : (
        <Input.TextArea
          className="rte__source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          style={{ minHeight: height }}
        />
      )}

      {maxLength !== undefined && (() => {
        const length = editor.getText().trim().length;
        return (
          <div className={`rte__count${length > maxLength ? " rte__count--over" : ""}`} aria-live="polite">
            {length} / {maxLength} characters
          </div>
        );
      })()}

      {mentionUi && mentionUi.rect && (
        <div
          className="rte__mentions"
          style={{ top: mentionUi.rect.bottom + 6, left: mentionUi.rect.left }}
        >
          {mentionUi.items.map((item, i) => (
            <div
              key={item.id}
              className={`rte__mention${i === mentionUi.index ? " rte__mention--active" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                mentionState.current.command?.(item);
              }}
            >
              {item.avatar ? <img src={item.avatar} alt="" /> : <span className="rte__mention-avatar" />}
              <span>
                {item.label}
                {item.hint && <span className="rte__mention-hint"> · {item.hint}</span>}
              </span>
            </div>
          ))}
        </div>
      )}

      <Modal
        title="Link"
        open={Boolean(linkModal)}
        onOk={saveLink}
        onCancel={() => setLinkModal(null)}
        okText="Save"
        destroyOnHidden
      >
        {linkModal && (
          <>
            <Input
              autoFocus
              placeholder="https://"
              value={linkModal.href}
              onChange={(e) => setLinkModal({ ...linkModal, href: e.target.value })}
              onPressEnter={saveLink}
            />
            <Checkbox
              style={{ marginTop: 12 }}
              checked={linkModal.newTab}
              onChange={(e) => setLinkModal({ ...linkModal, newTab: e.target.checked })}
            >
              Open in new tab
            </Checkbox>
          </>
        )}
      </Modal>

      <Modal
        title="Tag paragraph with topics"
        open={Boolean(topicModal)}
        onOk={saveTopics}
        onCancel={() => setTopicModal(null)}
        okText="Save"
        destroyOnHidden
      >
        {topicModal && (
          <>
            <Input
              allowClear
              placeholder="Search topics..."
              value={topicModal.search}
              onChange={(e) => setTopicModal({ ...topicModal, search: e.target.value })}
            />
            <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: "8px 0" }}>
              {topicModal.selected.length
                ? `${topicModal.selected.length} topic${topicModal.selected.length > 1 ? "s" : ""} selected`
                : "No topics selected"}
            </div>
            {filteredTopics.length ? (
              <Checkbox.Group
                style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" }}
                value={topicModal.selected}
                onChange={(visibleChecked) => {
                  // Keep selections that are hidden by the current search.
                  const visible = new Set(filteredTopics.map((t) => t.id));
                  const hidden = topicModal.selected.filter((id) => !visible.has(id));
                  setTopicModal({ ...topicModal, selected: [...hidden, ...visibleChecked] });
                }}
                options={filteredTopics.map((t) => ({ label: t.name, value: t.id }))}
              />
            ) : (
              <Empty description={`No topics match "${topicModal.search}"`} />
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default RichTextEditor;
