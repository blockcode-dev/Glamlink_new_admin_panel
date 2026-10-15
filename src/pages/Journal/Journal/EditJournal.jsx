/** @format */

import React, { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../../../services/Host";
import { TINYMCE_API_KEY } from "../../../config/env";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Select,
  Row,
  Col,
  Empty,
  Tag,
  Skeleton,
  DatePicker,
  Collapse,
  Checkbox,
} from "antd";
import {
  UploadOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  PictureOutlined,
  FormOutlined,
  PaperClipOutlined,
  PlusOutlined,
  DeleteOutlined,
  LinkOutlined,
  HolderOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { Box } from "@material-ui/core";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import {
  GetJournalById,
  UpdateJournal,
  GetJournalCategory,
  GetAllAuthors,
  GetAllShop,
  GetAllJournalTopics,
  GetAllJournalFaqs,
  GetJournalTopicMappings,
  GetJournalFaqMappings,
  UpdateJournalTopicMappings,
  UpdateJournalFaqMappings,
  GetJournalTopicParagraphs,
  UpdateJournalTopicParagraphs,
} from "../../../services/Api/JournalApi";
import { GetAllBusinessCards } from "../../../services/Api/BusinessCardApi";
import ImgCrop from "antd-img-crop";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./AddJournal.module.scss";

const SectionCard = ({ icon, title, hint, children }) => (
  <div className={styles.sectionCard}>
    <div className={styles.sectionHeader}>
      <div className={styles.sectionIcon}>{icon}</div>
      <div className={styles.sectionHeaderText}>
        <span className={styles.sectionTitle}>{title}</span>
        {hint && <span className={styles.sectionHint}>{hint}</span>}
      </div>
    </div>
    <div className={styles.sectionBody}>{children}</div>
  </div>
);

const statusColors = {
  published: "green",
  draft: "gold",
};

// One draggable download card — same drag-to-reorder pattern used on the
// Journals list page, applied here to the downloads within a journal.
const SortableDownloadItem = ({ download, index, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: download.id });

  const style = {
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    ...(isDragging
      ? { zIndex: 999, boxShadow: "0 4px 16px rgba(35, 184, 203, 0.25)" }
      : {}),
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.downloadItem}>
      <div className={styles.downloadItemHeader}>
        <span className={styles.downloadItemLabel}>
          <span
            className={styles.downloadDragHandle}
            {...attributes}
            {...listeners}
          >
            <HolderOutlined />
          </span>
          <span className={styles.downloadIndex}>{index + 1}</span>
          {download.title || `Download ${index + 1}`}
          {download.isExisting && <Tag style={{ marginLeft: 4 }}>Existing</Tag>}
        </span>

        {children.removeButton}
      </div>

      <div className={styles.downloadItemBody}>{children.body}</div>
    </div>
  );
};

const EditBlog = () => {
  const { id } = useParams();
  const isMounted = useRef(true);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState([]);
  const [content, setContent] = useState("");
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [deletedDownloadIds, setDeletedDownloadIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("draft");

  const [topics, setTopics] = useState([]);
  const [faqs, setFaqs] = useState([]);

  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [selectedFaqIds, setSelectedFaqIds] = useState([]);

  // A saved journal already has a real, possibly-shared/indexed slug, so we
  // start in "Custom" mode and never auto-overwrite it just because the
  // Title changed. Only flips to auto-follow if it loads with no slug at all,
  // or if the user explicitly hits "Reset to title".
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(true);

  // ---- @mention (business cards / Access Cards) ----
  const [businessCards, setBusinessCards] = useState([]);
  const businessCardsRef = useRef([]); // avoids stale closure inside TinyMCE's setup()

  // Tracks which topic ids were tagged onto ANY paragraph in this journal
  // when it was first loaded — used so that removing the last paragraph
  // tagged with a topic still clears that topic's server-side row for this
  // journal instead of leaving it stale.
  const initialParagraphTopicIdsRef = useRef([]);

  const topicsRef = useRef([]);
  useEffect(() => {
    topicsRef.current = topics;
  }, [topics]);

  useEffect(() => {
    businessCardsRef.current = businessCards;
  }, [businessCards]);

  // Slug used in /access-card/<slug> — falls back gracefully if the link is missing
  const getCardSlug = (card) =>
    card.business_card_link?.split("/").filter(Boolean).pop() ||
    card.custom_handle?.replace("@", "") ||
    String(card.id);

  // Instagram-style @ search: matches name, handle, or business name
  const getMentionMatches = (pattern) => {
    const q = pattern.toLowerCase();
    return businessCardsRef.current
      .filter((c) => c.is_active)
      .filter((c) =>
        `${c.name || ""} ${c.custom_handle || ""} ${c.business_name || ""}`
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 50)
      .map((c) => ({
        type: "autocompleteitem",
        value: String(c.id),
        text: `${c.name}${c.custom_handle ? " · " + c.custom_handle : ""}`,
        icon: `<img src="${
          c.profile_image || ""
        }" style="width:26px;height:26px;border-radius:50%;object-fit:cover;margin-right:8px;vertical-align:middle;" />`,
      }));
  };

  // editor.dom.uniqueId() keeps its own counter starting at 1 for every
  // fresh editor instance — it has no idea the journal's SAVED content
  // already contains ids like "para_1" from a previous session. That
  // collision is exactly what caused paragraphs to end up sharing the same
  // data-paragraph-id (and the backend's "Validation error"). Generate our
  // own id and check it against every data-paragraph-id already present in
  // the current content before using it.
  const generateUniqueParagraphId = (editor) => {
    const usedIds = new Set(
      Array.from(editor.dom.select("[data-paragraph-id]")).map((el) =>
        el.getAttribute("data-paragraph-id"),
      ),
    );

    let candidate;
    do {
      candidate = `para_${Date.now().toString(36)}${Math.random()
        .toString(36)
        .slice(2, 8)}`;
    } while (usedIds.has(candidate));

    return candidate;
  };

  // Reads every block in the editor tagged with topics and groups their
  // paragraph_ids by topic_id — reflects current state written into the HTML
  // itself via data-paragraph-id / data-topic-ids attributes.
  const extractParagraphTopicMap = (html) => {
    if (!html) return {};

    const doc = new DOMParser().parseFromString(html, "text/html");
    const tagged = doc.querySelectorAll("[data-paragraph-id][data-topic-ids]");

    const map = {}; // topicId -> [{ paragraph_id, sort_order }]

    tagged.forEach((el, index) => {
      const paragraphId = el.getAttribute("data-paragraph-id");
      const topicIds = (el.getAttribute("data-topic-ids") || "")
        .split(",")
        .filter(Boolean)
        .map(Number);

      topicIds.forEach((topicId) => {
        if (!map[topicId]) map[topicId] = [];
        map[topicId].push({ paragraph_id: paragraphId, sort_order: index + 1 });
      });
    });

    return map;
  };

  // Reconciles this journal's paragraph-topic tags against each affected
  // topic's mapping table WITHOUT touching other journals' rows — the update
  // endpoint replaces the WHOLE topic mapping table, so we must preserve rows
  // belonging to other journals ourselves before calling it.
  //
  // Also de-duplicates by (journal_id, paragraph_id) before sending — the
  // backend has no protection against duplicate pairs in one request and
  // will reject the whole call with a validation error if it sees one.
  //
  // Each topic is synced in its own try/catch: this call and the journal's
  // `content` save are two separate, non-atomic API requests, so a failure
  // on ONE topic must never (a) abort syncing the other topics too, or
  // (b) get silently swallowed — content can end up saved with a tag that
  // never made it into the mapping table otherwise, which is exactly what
  // happened before this fix. Returns the list of topic ids that failed so
  // the caller can warn the admin and retry them on the next save.
  const syncParagraphTopics = async (
    journalId,
    currentMap,
    previousTopicIds = [],
  ) => {
    const topicIdsToProcess = new Set([
      ...Object.keys(currentMap).map(Number),
      ...previousTopicIds.map(Number),
    ]);

    const failedTopicIds = [];

    for (const topicId of topicIdsToProcess) {
      try {
        const res = await GetJournalTopicParagraphs(topicId);
        const existing = res?.data?.data || [];

        const others = existing
          .filter((m) => Number(m.journal_id) !== Number(journalId))
          .map((m) => ({
            journal_id: m.journal_id,
            paragraph_id: m.paragraph_id,
            sort_order: m.sort_order,
          }));

        const mine = (currentMap[topicId] || []).map((item) => ({
          journal_id: journalId,
          paragraph_id: item.paragraph_id,
          sort_order: item.sort_order,
        }));

        // Keep only one row per (journal_id, paragraph_id) — "mine" wins
        // over "others" if there's ever an overlap, since it reflects the
        // latest edit.
        const deduped = Array.from(
          [...others, ...mine]
            .reduce((map, row) => {
              map.set(`${row.journal_id}::${row.paragraph_id}`, row);
              return map;
            }, new Map())
            .values(),
        );

        await UpdateJournalTopicParagraphs(topicId, {
          paragraphs: deduped,
        });
      } catch (err) {
        console.error(
          `Failed to sync paragraph topics for topic ${topicId}`,
          err,
        );
        failedTopicIds.push(topicId);
      }
    }

    return failedTopicIds;
  };

  const downloadSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchDropdowns();
    fetchBlog();

    return () => {
      isMounted.current = false;
      message.destroy("video-upload");
    };
  }, []);

  // TinyMCE's autocompleter popup renders in the host page's DOM (outside
  // the editor iframe), so content_style can't reach it — inject a
  // one-time stylesheet instead.
  useEffect(() => {
    const styleId = "mention-autocompleter-style";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      .tox .tox-autocompleter {
        z-index: 1400;
      }
      .tox .tox-autocompleter .tox-menu {
        border-radius: 14px !important;
        border: 1px solid #eef0f3 !important;
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.14) !important;
        padding: 6px !important;
        max-height: 280px !important;
        overflow-y: auto !important;
      }
      .tox .tox-autocompleter .tox-collection__group {
        padding: 0 !important;
      }
      .tox .tox-autocompleter .tox-collection__item {
        border-radius: 10px !important;
        padding: 8px 10px !important;
        margin: 2px 0 !important;
        display: flex !important;
        align-items: center !important;
      }
      .tox .tox-autocompleter .tox-collection__item--active {
        background: rgba(26, 154, 171, 0.12) !important;
      }
      .tox .tox-autocompleter .tox-collection__item-icon {
        margin-right: 4px !important;
        display: flex !important;
        align-items: center !important;
      }
      .tox .tox-autocompleter .tox-collection__item-icon img {
        width: 28px !important;
        height: 28px !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        display: block !important;
      }
      .tox .tox-autocompleter .tox-collection__item-label {
        font-family: Arial, sans-serif !important;
        font-size: 13.5px !important;
        color: #1a1f27 !important;
        font-weight: 500 !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const fetchDropdowns = async () => {
    try {
      const [
        authorRes,
        categoryRes,
        shopRes,
        cardRes,
        topicRes,
        faqRes,
        topicMappingRes,
        faqMappingRes,
      ] = await Promise.all([
        GetAllAuthors(),
        GetJournalCategory(),
        GetAllShop(localStorage.getItem("adminToken")),
        GetAllBusinessCards(),
        GetAllJournalTopics(),
        GetAllJournalFaqs(),
        GetJournalTopicMappings(id),
        GetJournalFaqMappings(id),
      ]);

      setAuthors(authorRes.data.rows || []);
      setCategories(categoryRes.data.rows || []);
      setShops(shopRes.data.rows || []);
      setBusinessCards(cardRes.data.data || []);

      // All available topics
      const topicList = Array.isArray(topicRes?.data?.data)
        ? topicRes.data.data
        : topicRes?.data?.data?.rows || topicRes?.data?.rows || [];

      setTopics(topicList);

      // All available FAQs
      const faqList = Array.isArray(faqRes?.data?.data)
        ? faqRes.data.data
        : faqRes?.data?.data?.rows || faqRes?.data?.rows || [];

      setFaqs(faqList);

      // Existing journal topic mappings
      const existingTopicIds =
        topicMappingRes?.data?.data?.map((item) =>
          Number(item.topic_id || item.topic?.id),
        ) || [];

      setSelectedTopicIds(existingTopicIds.filter(Boolean));

      // Existing journal FAQ mappings
      const existingFaqIds =
        faqMappingRes?.data?.data?.map((item) =>
          Number(item.faq_id || item.faq?.id),
        ) || [];

      setSelectedFaqIds(existingFaqIds.filter(Boolean));
    } catch (error) {
      console.error(error);
      message.error("Failed to load dropdown data");
    }
  };

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const result = await GetJournalById(id);
      const blog = result.data?.data;

      form.setFieldsValue({
        title: blog.title,
        short_description: blog.short_description,
        author_id: blog.author_id,
        category_id: blog.category_id,
        seo_title: blog.seo_title || "",
        meta_description: blog.meta_description || "",
        slug: blog.slug || "",
        shop_ids: (blog.shops || []).map((shop) => shop.id),
        status: blog.status || "draft",
        publish_date: blog.publish_date
          ? dayjs(
              blog.publish_date.replace("T", " ").replace(".000Z", ""),
              "YYYY-MM-DD HH:mm:ss",
            )
          : null,
      });

      // If this journal somehow has no slug yet, let it auto-follow the
      // Title until the user starts typing in it directly.
      setSlugManuallyEdited(!!blog.slug);

      setCurrentStatus(blog.status || "draft");
      setContent(blog.content || "");

      // blog.content already carries data-paragraph-id / data-topic-ids /
      // data-topic-names + the topic-tagged-paragraph class from previous
      // saves — TinyMCE renders the highlight+label automatically since
      // content_style below includes the matching CSS.
      initialParagraphTopicIdsRef.current = Object.keys(
        extractParagraphTopicMap(blog.content || ""),
      ).map(Number);

      if (blog.cover_image) {
        setFileList([
          {
            uid: "-1",
            name: "cover.png",
            status: "done",
            url: blog.cover_image,
          },
        ]);
      }

      // Existing downloads coming back from GetJournalById
      const existing = (blog.downloads || [])
        .slice()
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((d) => ({
          id: d.id,
          isExisting: true,
          title: d.title || "",
          description: d.description || "",
          button_text: d.button_text || "Download PDF",
          existingFileUrl: d.file_name,
          fileList: [],
        }));

      setDownloads(existing);
    } catch {
      message.error("Failed to load blog");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DOWNLOAD HELPERS ================= */

  const addDownload = () => {
    setDownloads((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        isExisting: false,
        title: "",
        description: "",
        button_text: "Download PDF",
        fileList: [],
      },
    ]);
  };

  const removeDownload = (item) => {
    if (item.isExisting) {
      setDeletedDownloadIds((prev) => [...prev, item.id]);
    }
    setDownloads((prev) => prev.filter((d) => d.id !== item.id));
  };

  const updateDownload = (id, key, value) => {
    setDownloads((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  };

  const handleDownloadDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setDownloads((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const getFileNameFromUrl = (url = "") => url.split("/").pop();

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      if (!content) {
        message.error("Content is required");
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("short_description", values.short_description);
      formData.append("author_id", values.author_id);
      formData.append("category_id", values.category_id);
      formData.append("content", content);
      formData.append("status", values.status);
      formData.append("shop_ids", JSON.stringify(values.shop_ids || []));

      formData.append("seo_title", values.seo_title || "");
      formData.append("meta_description", values.meta_description || "");
      formData.append("slug", values.slug || "");

      if (values.publish_date) {
        formData.append(
          "publish_date",
          values.publish_date.format("YYYY-MM-DD HH:mm:ss"),
        );
      }

      // Only append a new cover image if it was changed
      if (fileList[0]?.originFileObj) {
        formData.append("images", fileList[0].originFileObj);
      }

      // Existing downloads — title/description/button text updates, plus
      // sort_order taken from the current on-screen order (drag-and-drop)
      const existingDownloadsPayload = downloads
        .map((d, index) => ({ ...d, overallIndex: index }))
        .filter((d) => d.isExisting)
        .map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          button_text: d.button_text,
          sort_order: d.overallIndex + 1,
        }));

      formData.append(
        "existing_downloads",
        JSON.stringify(existingDownloadsPayload),
      );

      // Downloads removed by the user
      formData.append(
        "deleted_download_ids",
        JSON.stringify(deletedDownloadIds),
      );

      // Newly added downloads (require a file, per the upload API)
      downloads
        .filter((d) => !d.isExisting)
        .forEach((download) => {
          formData.append("download_titles[]", download.title);
          formData.append("download_descriptions[]", download.description);
          formData.append("download_button_text[]", download.button_text);

          if (download.fileList.length > 0) {
            formData.append("docs", download.fileList[0].originFileObj);
          }
        });

      await UpdateJournal(id, formData);

      // Sync paragraph-level topic tags picked up from the editor content.
      // This is a SEPARATE, non-atomic write from the content save above —
      // syncParagraphTopics never throws now (it catches per topic), so
      // check its return value instead of assuming everything landed.
      const paragraphTopicMap = extractParagraphTopicMap(content);
      const failedTopicIds = await syncParagraphTopics(
        id,
        paragraphTopicMap,
        initialParagraphTopicIdsRef.current,
      );

      // Keep failed topics in the "previous" set so the next Update journal
      // click retries reconciling them instead of silently forgetting —
      // otherwise a topic whose removal failed to sync would never get
      // cleared server-side again, since it's no longer in the content at
      // all for future comparisons to catch.
      initialParagraphTopicIdsRef.current = Array.from(
        new Set([...Object.keys(paragraphTopicMap).map(Number), ...failedTopicIds]),
      );

      // Update journal topic mappings
      await UpdateJournalTopicMappings(id, {
        topic_ids: selectedTopicIds,
      });

      // Update journal FAQ mappings
      await UpdateJournalFaqMappings(id, {
        faq_ids: selectedFaqIds,
      });

      if (failedTopicIds.length > 0) {
        const failedNames = topics
          .filter((t) => failedTopicIds.includes(t.id))
          .map((t) => t.name);

        message.warning(
          `Journal saved, but the paragraph tag for "${
            failedNames.join(", ") || failedTopicIds.join(", ")
          }" couldn't sync. Click "Update journal" again to retry — don't leave this page yet.`,
          6,
        );
        // Stay on this page rather than navigating away — leaving now would
        // drop the in-memory retry state and the mismatch could go
        // unnoticed until someone checks the topic's paragraph list later.
      } else {
        message.success("Journal updated successfully");
        navigate("/journals");
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to update journal");
    } finally {
      setSubmitting(false);
    }
  };

  const generateSlug = (value = "") => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  if (loading) {
    return (
      <Box className={styles.page}>
        <div className={styles.headerCard}>
          <Skeleton active title paragraph={{ rows: 1 }} />
        </div>
        <div className={styles.sectionCard}>
          <div className={styles.sectionBody}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        </div>
      </Box>
    );
  }

  return (
    <Box className={styles.page}>
      {/* HEADER */}
      <div className={styles.headerCard}>
        <div>
          <h3 className={styles.headerTitle}>
            Edit Journal{" "}
            <Tag color={statusColors[currentStatus] || "default"}>
              {currentStatus}
            </Tag>
          </h3>
          <p className={styles.headerSubtitle}>
            Update the details, content and downloads for this journal.
          </p>
        </div>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/journals")}
        >
          Return to Journals
        </Button>
      </div>

      <Form form={form} layout="vertical">
        {/* BASIC DETAILS */}
        <SectionCard
          icon={<FormOutlined />}
          title="Journal details"
          hint="Title, author, category, status and schedule"
        >
          <Row gutter={20}>
            <Col xs={24} md={16}>
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: "Title is required" }]}
              >
                <Input
                  placeholder="Enter journal title"
                  onChange={(e) => {
                    const title = e.target.value;

                    if (!slugManuallyEdited) {
                      form.setFieldValue("slug", generateSlug(title));
                    }
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Select status" }]}
              >
                <Select
                  placeholder="Select status"
                  onChange={(val) => setCurrentStatus(val)}
                >
                  <Select.Option value="draft">Draft</Select.Option>
                  <Select.Option value="published">Published</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="author_id"
                label="Author"
                rules={[{ required: true, message: "Select an author" }]}
              >
                <Select
                  placeholder="Select author"
                  showSearch
                  optionFilterProp="children"
                >
                  {authors.map((author) => (
                    <Select.Option key={author.id} value={author.id}>
                      {author.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="category_id"
                label="Category"
                rules={[{ required: true, message: "Select a category" }]}
              >
                <Select
                  placeholder="Select category"
                  showSearch
                  optionFilterProp="children"
                >
                  {categories.map((cat) => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="shop_ids"
                label="Shops"
                tooltip="Optional — select one or more shops for this journal"
              >
                <Select
                  mode="multiple"
                  placeholder="Select shops"
                  showSearch
                  optionFilterProp="children"
                  allowClear
                >
                  {shops.map((shop) => (
                    <Select.Option key={shop.id} value={shop.id}>
                      {shop.title || `Shop #${shop.id}`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="publish_date" label="Publish date & time">
                <DatePicker
                  showTime={{ use12Hours: true, format: "hh:mm A" }}
                  format="DD/MM/YYYY hh:mm A"
                  style={{ width: "100%" }}
                  placeholder="Select date & time"
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="short_description"
                label="Short description"
                rules={[
                  {
                    required: true,
                    message: "Short description is required",
                  },
                ]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="A brief summary shown in journal listings"
                />
              </Form.Item>
            </Col>
          </Row>
        </SectionCard>

        {/* CONTENT */}
        <SectionCard
          icon={<FileTextOutlined />}
          title="Content"
          hint="Full journal body, images and video — type @ to tag a business"
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              padding: "12px 16px",
              background: "#f0fbfc",
              border: "1px solid #bfe9ee",
              borderRadius: 10,
              color: "#0f6673",
              fontSize: 13,
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            <InfoCircleOutlined
              style={{ fontSize: 16, marginTop: 2, flexShrink: 0 }}
            />
            <div>
              <strong>Two ways to tag things in the content</strong>
              <div style={{ marginTop: 4 }}>
                Type <strong>@</strong> to mention a business — pick from the
                list that pops up.
              </div>
              <div style={{ marginTop: 4 }}>
                To tag a single paragraph with one or more <strong>Topics</strong>:
                click into that paragraph, click{" "}
                <strong>🏷 Topic</strong> in the toolbar (open the{" "}
                <strong>⋯</strong> menu first if it's hidden there), pick the
                topics, then click <strong>Save</strong>. The paragraph gets a
                purple label showing its topic(s) — this is saved with the
                content, so it's still there next time you open this journal,
                and you can click back in to change it. Click{" "}
                <strong>"Update journal"</strong> below to save your changes.
              </div>
            </div>
          </div>
          <Editor
            apiKey={TINYMCE_API_KEY}
            value={content}
            init={{
              height: 500,
              menubar: true,
              plugins:
                "table link image lists media charmap emoticons code fullscreen",

              toolbar:
                "undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | " +
                "alignleft aligncenter alignright alignjustify | bullist numlist blockquote | " +
                "link image insertvideo table | tagparagraphtopic | removeformat | code fullscreen",

              media_live_embeds: true,
              automatic_uploads: true,
              file_picker_types: "image",
              images_reuse_filename: true,

              content_style: `
                body {
                  font-family: Arial, sans-serif;
                  font-size: 14px;
                }
                blockquote {
                  font-family: Georgia, 'Times New Roman', serif;
                  font-style: italic;
                  font-size: 22px;
                  line-height: 1.7;
                  color: #1f2937;
                  border-left: 5px solid #d1d5db;
                  padding-left: 25px;
                  margin: 25px 0;
                }
                .mention-tag {
                  display: inline-flex;
                  align-items: center;
                  background: rgba(26, 154, 171, 0.1);
                  color: #1a9aab !important;
                  padding: 3px 10px;
                  border-radius: 999px;
                  font-family: Arial, sans-serif !important;
                  font-weight: 600 !important;
                  font-size: 14px !important;
                  line-height: 1.4 !important;
                  text-decoration: none;
                  vertical-align: middle;
                }
                .mention-tag:hover {
                  background: rgba(26, 154, 171, 0.18);
                }
                /* Renders inside TinyMCE's iframe — the same class in
                   AddJournal.module.scss can't reach content in here,
                   which is why it needs to be duplicated in this string. */
                .topic-tagged-paragraph {
                  position: relative;
                  border-left: 3px solid #4f5deb;
                  background: rgba(79, 93, 235, 0.06);
                  padding: 6px 10px 6px 12px !important;
                  margin-top: 22px !important;
                  border-radius: 0 6px 6px 0;
                }
                .topic-tagged-paragraph::before {
                  content: "🏷 " attr(data-topic-names);
                  position: absolute;
                  top: -20px;
                  left: 0;
                  font-size: 11px;
                  color: #4f5deb;
                  font-weight: 700;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  max-width: 100%;
                }
              `,

              images_upload_handler: (blobInfo, progress) => {
                return new Promise(async (resolve, reject) => {
                  const formData = new FormData();
                  formData.append(
                    "images",
                    blobInfo.blob(),
                    blobInfo.filename(),
                  );

                  try {
                    const res = await axios.post(
                      `${BASE_URL}journal/upload`,
                      formData,
                      {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            "adminToken",
                          )}`,
                        },
                        onUploadProgress: (event) => {
                          if (event.total) {
                            progress(
                              Math.round((event.loaded / event.total) * 100),
                            );
                          }
                        },
                      },
                    );

                    if (res.data.data?.location) {
                      resolve(res.data.data.location);
                    } else {
                      reject("Invalid response format from server");
                    }
                  } catch (error) {
                    console.error(error);
                    reject("Image upload failed");
                  }
                });
              },

              setup: (editor) => {
                // ---- @mention autocompleter (Instagram-style business tag) ----
                editor.ui.registry.addAutocompleter("mentions", {
                  trigger: "@",
                  minChars: 0,
                  columns: 1,
                  fetch: (pattern) =>
                    new Promise((resolve) => {
                      resolve(getMentionMatches(pattern));
                    }),
                  onAction: (autocompleteApi, rng, value) => {
                    const card = businessCardsRef.current.find(
                      (c) => String(c.id) === value,
                    );

                    if (!card) {
                      autocompleteApi.hide();
                      return;
                    }

                    const slug = getCardSlug(card);

                    editor.selection.setRng(rng);
                    editor.insertContent(
                      `<a href="${card.business_card_link}" target="_blank" rel="noopener noreferrer" class="mention-tag" data-card-id="${card.id}">@${slug}</a>&nbsp;`,
                    );

                    autocompleteApi.hide();
                  },
                });

                editor.ui.registry.addButton("insertvideo", {
                  text: "📹 Video",
                  tooltip: "Insert Video",

                  onAction: () => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "video/*";

                    input.onchange = async () => {
                      const file = input.files?.[0];
                      if (!file) return;

                      const fileSizeMB = file.size / (1024 * 1024);

                      if (fileSizeMB > 100) {
                        message.warning("Large file — upload may take a while");
                      }

                      const placeholderId = `video-placeholder-${Date.now()}`;

                      editor.insertContent(`
                        <p id="${placeholderId}"
                          style="
                            background:#f8fafc;
                            padding:18px;
                            text-align:center;
                            border:1px solid #dbeafe;
                            border-radius:10px;
                            color:#475569;
                            font-size:14px;
                            margin:16px 0;
                          "
                        >
                          ⏳ Uploading video:
                          <strong>${file.name}</strong>
                          (${fileSizeMB.toFixed(1)} MB)
                        </p>
                      `);

                      const controller = new AbortController();

                      const showUploadMessage = (percent = 0) => {
                        message.open({
                          key: "video-upload",
                          duration: 0,

                          content: (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 14,
                                minWidth: 320,
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>
                                  Uploading video...
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "#64748b",
                                    marginTop: 2,
                                  }}
                                >
                                  {percent}% completed
                                </div>
                              </div>

                              <Button
                                danger
                                size="small"
                                style={{ borderRadius: 8, fontWeight: 500 }}
                                onClick={() => {
                                  controller.abort();
                                  message.destroy("video-upload");

                                  const editorDoc = editor?.getDoc?.();
                                  if (editorDoc) {
                                    const el =
                                      editorDoc.getElementById(placeholderId);
                                    if (el) el.remove();
                                  }

                                  message.warning("Upload cancelled");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ),
                        });
                      };

                      showUploadMessage(0);

                      try {
                        const formData = new FormData();
                        formData.append("images", file);

                        const res = await axios.post(
                          `${BASE_URL}journal/upload`,
                          formData,
                          {
                            signal: controller.signal,
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem(
                                "adminToken",
                              )}`,
                            },
                            onUploadProgress: (event) => {
                              if (!isMounted.current) {
                                controller.abort();
                                return;
                              }
                              if (event.total) {
                                const percent = Math.round(
                                  (event.loaded / event.total) * 100,
                                );
                                showUploadMessage(percent);
                              }
                            },
                          },
                        );

                        if (!isMounted.current) {
                          controller.abort();
                          message.destroy("video-upload");
                          return;
                        }

                        const fileURL = res.data?.data?.location;

                        if (!fileURL) {
                          message.destroy("video-upload");
                          message.error("Invalid upload response");
                          return;
                        }

                        const editorDoc = editor?.getDoc?.();

                        if (!editorDoc) {
                          message.destroy("video-upload");
                          return;
                        }

                        const placeholder =
                          editorDoc.getElementById(placeholderId);

                        if (placeholder) {
                          placeholder.outerHTML = `
                            <video
                              controls
                              width="100%"
                              style="
                                width:100%;
                                border-radius:12px;
                                margin:14px 0;
                                background:#000;
                              "
                            >
                              <source src="${fileURL}" type="${file.type}" />
                            </video>
                          `;
                        }

                        message.destroy("video-upload");
                        message.success("Video uploaded successfully");
                      } catch (err) {
                        if (!isMounted.current) {
                          message.destroy("video-upload");
                          return;
                        }

                        if (err.name === "CanceledError") {
                          return;
                        }

                        console.error(err);
                        message.destroy("video-upload");
                        message.error("Video upload failed");

                        const editorDoc = editor?.getDoc?.();
                        if (editorDoc) {
                          const el = editorDoc.getElementById(placeholderId);
                          if (el) el.remove();
                        }
                      }
                    };

                    input.click();
                  },
                });

                // ---- Paragraph → Topic tagging ----
                editor.ui.registry.addButton("tagparagraphtopic", {
                  text: "🏷 Topic",
                  tooltip: "Tag this paragraph with one or more Topics",
                  onAction: () => {
                    // If this button was clicked from inside the toolbar's
                    // "⋯ More" overflow drawer, close that drawer now —
                    // opening the dialog below steals focus in a way that
                    // stops TinyMCE's own auto-close from firing, leaving
                    // it stuck open on screen otherwise.
                    if (editor.queryCommandState("ToggleToolbarDrawer")) {
                      editor.execCommand("ToggleToolbarDrawer");
                    }

                    const node = editor.selection.getNode();
                    const block = editor.dom.getParent(
                      node,
                      "p,li,h1,h2,h3,h4,h5,h6,blockquote",
                    );

                    if (!block) {
                      message.warning(
                        "Click inside a paragraph, heading, list item, or quote first",
                      );
                      return;
                    }

                    if (!topicsRef.current.length) {
                      message.warning(
                        "No topics available yet — create one first",
                      );
                      return;
                    }

                    const existingIds = (
                      block.getAttribute("data-topic-ids") || ""
                    )
                      .split(",")
                      .filter(Boolean)
                      .map(Number);

                    // Local selection state — kept alive across search
                    // filtering/redials so unchecking while filtered
                    // doesn't lose previous selections.
                    const selected = new Set(existingIds);
                    let searchTerm = "";

                    const buildBody = () => {
                      const filtered = topicsRef.current.filter((t) =>
                        t.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()),
                      );

                      return {
                        type: "panel",
                        items: [
                          {
                            type: "input",
                            name: "topic_search",
                            placeholder: "Search topics...",
                          },
                          {
                            type: "htmlpanel",
                            html: `<div style="font-size:12px;color:#8a94a3;margin:6px 0 4px;">${
                              selected.size
                                ? `${selected.size} topic${
                                    selected.size > 1 ? "s" : ""
                                  } selected`
                                : "No topics selected"
                            }</div>`,
                          },
                          filtered.length > 0
                            ? {
                                type: "panel",
                                items: filtered.map((t) => ({
                                  type: "checkbox",
                                  name: `topic_${t.id}`,
                                  label: t.name,
                                })),
                              }
                            : {
                                type: "htmlpanel",
                                html: `<div style="padding:20px 4px;text-align:center;color:#8a94a3;font-size:13px;">No topics match "${searchTerm}"</div>`,
                              },
                        ],
                      };
                    };

                    const initialData = topicsRef.current.reduce(
                      (acc, t) => {
                        acc[`topic_${t.id}`] = existingIds.includes(t.id);
                        return acc;
                      },
                      { topic_search: "" },
                    );

                    editor.windowManager.open({
                      title: "Tag paragraph with topics",
                      size: "medium",
                      body: buildBody(),
                      initialData,
                      buttons: [
                        { type: "cancel", text: "Cancel" },
                        { type: "submit", text: "Save", primary: true },
                      ],
                      onChange: (api, details) => {
                        const data = api.getData();

                        // Sync any checkbox toggles into our selection set
                        topicsRef.current.forEach((t) => {
                          const key = `topic_${t.id}`;
                          if (data[key] !== undefined) {
                            if (data[key]) selected.add(t.id);
                            else selected.delete(t.id);
                          }
                        });

                        if (details.name === "topic_search") {
                          searchTerm = data.topic_search || "";
                          api.redial(buildBody());

                          // Re-apply current selection + keep the typed
                          // search term after the dialog redraws
                          const restored = topicsRef.current.reduce(
                            (acc, t) => {
                              acc[`topic_${t.id}`] = selected.has(t.id);
                              return acc;
                            },
                            { topic_search: searchTerm },
                          );
                          api.setData(restored);
                        }
                      },
                      onSubmit: (api) => {
                        const data = api.getData();
                        topicsRef.current.forEach((t) => {
                          const key = `topic_${t.id}`;
                          if (data[key] !== undefined) {
                            if (data[key]) selected.add(t.id);
                            else selected.delete(t.id);
                          }
                        });

                        const selectedTopics = topicsRef.current.filter((t) =>
                          selected.has(t.id),
                        );

                        if (selectedTopics.length === 0) {
                          block.removeAttribute("data-topic-ids");
                          block.removeAttribute("data-topic-names");
                          block.removeAttribute("data-paragraph-id");
                          editor.dom.removeClass(
                            block,
                            "topic-tagged-paragraph",
                          );
                          message.info(
                            'Topic tags removed — click "Update journal" to save',
                          );
                        } else {
                          if (!block.getAttribute("data-paragraph-id")) {
                            block.setAttribute(
                              "data-paragraph-id",
                              generateUniqueParagraphId(editor),
                            );
                          }
                          const names = selectedTopics.map((t) => t.name);

                          block.setAttribute(
                            "data-topic-ids",
                            selectedTopics.map((t) => t.id).join(","),
                          );
                          block.setAttribute(
                            "data-topic-names",
                            names.join(", "),
                          );
                          editor.dom.addClass(block, "topic-tagged-paragraph");

                          message.success(
                            `Tagged with: ${names.join(
                              ", ",
                            )} — click "Update journal" to save`,
                          );
                        }

                        editor.fire("change");
                        setContent(editor.getContent());
                        api.close();
                      },
                    });
                  },
                });
              },
            }}
            onEditorChange={(val) => setContent(val)}
          />
        </SectionCard>

        {/* SEO */}
        <SectionCard
          icon={<SearchOutlined />}
          title="SEO"
          hint="Control how this journal appears in search results and shared links"
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              padding: "12px 16px",
              background: "#f0fbfc",
              border: "1px solid #bfe9ee",
              borderRadius: 10,
              color: "#0f6673",
              fontSize: 13,
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            <InfoCircleOutlined
              style={{ fontSize: 16, marginTop: 2, flexShrink: 0 }}
            />
            <div>
              <strong>How these fields work</strong>
              <div style={{ marginTop: 4 }}>
                Leave the SEO Title or Meta Description blank and Google will
                fall back to the main Title / Short description automatically.
                The <strong>URL Slug</strong> already reflects this journal's
                live web address, so editing the Title above won't change it
                automatically — that protects any links that are already shared
                or indexed. Use "Reset to title" only if you're sure you want to
                change the URL.
              </div>
            </div>
          </div>

          <Row gutter={20}>
            <Col xs={24}>
              <Form.Item
                name="seo_title"
                label="SEO Title / Title Tag"
                tooltip="Shown as the clickable headline in Google search results and in the browser tab. Defaults to the journal Title if left blank. Aim for under ~60 characters so it isn't cut off."
              >
                <Input
                  maxLength={255}
                  showCount
                  placeholder="Enter SEO title"
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="meta_description"
                label="Meta Description"
                tooltip="The short summary shown below the title in search results and in link previews (e.g. when shared on social media). Defaults to the Short description if left blank. Aim for ~150–160 characters."
              >
                <Input.TextArea
                  rows={4}
                  maxLength={500}
                  showCount
                  placeholder="Enter meta description"
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label={
                  <span>
                    URL Slug{" "}
                    <Tag
                      color={slugManuallyEdited ? "orange" : "blue"}
                      style={{ marginLeft: 6, fontWeight: 500 }}
                    >
                      {slugManuallyEdited ? "Custom" : "Auto from title"}
                    </Tag>
                  </span>
                }
                tooltip="The web-address-friendly version of this journal's title, e.g. glamlink.net/journals/your-slug-here. Changing it here changes the live URL, so update it carefully if this journal is already published and shared."
                style={{ marginBottom: 6 }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  <Form.Item name="slug" noStyle>
                    <Input
                      maxLength={255}
                      placeholder="example: facelift-recovery-guide"
                      onChange={() => setSlugManuallyEdited(true)}
                    />
                  </Form.Item>
                  <Button
                    onClick={() => {
                      const title = form.getFieldValue("title") || "";
                      form.setFieldValue("slug", generateSlug(title));
                      setSlugManuallyEdited(false);
                    }}
                  >
                    Reset to title
                  </Button>
                </div>
              </Form.Item>

              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  const slug = getFieldValue("slug");
                  return slug ? (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#8c8c8c",
                        marginTop: -4,
                        marginBottom: 8,
                      }}
                    >
                      Preview: glamlink.net/journals/<strong>{slug}</strong>
                    </div>
                  ) : null;
                }}
              </Form.Item>
            </Col>
          </Row>
        </SectionCard>

        {/* COVER IMAGE */}
        <SectionCard
          icon={<PictureOutlined />}
          title="Cover image"
          hint="Shown as the thumbnail in journal listings"
        >
          <div className={styles.coverUploadArea}>
            <div className={styles.coverPreview}>
              {fileList.length > 0 ? (
                <img
                  src={
                    fileList[0].originFileObj
                      ? URL.createObjectURL(fileList[0].originFileObj)
                      : fileList[0].url
                  }
                  alt="Cover preview"
                />
              ) : (
                <div className={styles.coverEmpty}>
                  <PictureOutlined style={{ fontSize: 22 }} />
                  <span>No image selected</span>
                </div>
              )}
            </div>

            <div className={styles.coverActions}>
              <ImgCrop
                aspect={16 / 9}
                quality={1}
                showGrid
                rotationSlider
                modalTitle="Crop cover image"
                modalOk="Apply crop"
                modalCancel="Cancel"
              >
                <Upload
                  beforeUpload={(file) => {
                    setFileList([
                      {
                        uid: file.uid,
                        name: file.name,
                        status: "done",
                        originFileObj: file,
                      },
                    ]);
                    return false;
                  }}
                  fileList={[]}
                  showUploadList={false}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>
                    {fileList.length > 0 ? "Replace image" : "Upload image"}
                  </Button>
                </Upload>
              </ImgCrop>

              {fileList.length > 0 && (
                <Button danger type="text" onClick={() => setFileList([])}>
                  Remove image
                </Button>
              )}

              <span className={styles.coverHelp}>
                Recommended ratio 16:9. JPG or PNG.
              </span>
            </div>
          </div>
        </SectionCard>

        {/* DOWNLOADS */}
        <SectionCard
          icon={<PaperClipOutlined />}
          title="Downloads"
          hint="Drag the handle to reorder — files readers can download from this journal"
        >
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addDownload}
            style={{ marginBottom: 16 }}
          >
            Add download
          </Button>

          {downloads.length === 0 ? (
            <div className={styles.downloadsEmpty}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No downloads added yet"
              />
            </div>
          ) : (
            <DndContext
              sensors={downloadSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDownloadDragEnd}
            >
              <SortableContext
                items={downloads.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                {downloads.map((download, index) => (
                  <SortableDownloadItem
                    key={download.id}
                    download={download}
                    index={index}
                  >
                    {{
                      removeButton: (
                        <Button
                          danger
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removeDownload(download)}
                        >
                          Remove
                        </Button>
                      ),
                      body: (
                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              label="Title"
                              style={{ marginBottom: 12 }}
                            >
                              <Input
                                placeholder="Download title"
                                value={download.title}
                                onChange={(e) =>
                                  updateDownload(
                                    download.id,
                                    "title",
                                    e.target.value,
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item
                              label="Button text"
                              style={{ marginBottom: 12 }}
                            >
                              <Input
                                placeholder="Download PDF"
                                value={download.button_text}
                                onChange={(e) =>
                                  updateDownload(
                                    download.id,
                                    "button_text",
                                    e.target.value,
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24}>
                            <Form.Item
                              label="Description"
                              style={{ marginBottom: 12 }}
                            >
                              <Input.TextArea
                                rows={2}
                                placeholder="Description"
                                value={download.description}
                                onChange={(e) =>
                                  updateDownload(
                                    download.id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24}>
                            {download.isExisting ? (
                              <a
                                className={styles.fileChip}
                                href={download.existingFileUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <LinkOutlined />
                                {getFileNameFromUrl(download.existingFileUrl)}
                              </a>
                            ) : (
                              <Form.Item
                                label="File"
                                style={{ marginBottom: 0 }}
                              >
                                <Upload
                                  beforeUpload={(file) => {
                                    updateDownload(download.id, "fileList", [
                                      {
                                        uid: file.uid,
                                        name: file.name,
                                        status: "done",
                                        originFileObj: file,
                                      },
                                    ]);
                                    return false;
                                  }}
                                  fileList={download.fileList}
                                  maxCount={1}
                                  onRemove={() =>
                                    updateDownload(download.id, "fileList", [])
                                  }
                                >
                                  <Button icon={<UploadOutlined />}>
                                    Upload PDF / DOC
                                  </Button>
                                </Upload>
                              </Form.Item>
                            )}
                          </Col>
                        </Row>
                      ),
                    }}
                  </SortableDownloadItem>
                ))}
              </SortableContext>
            </DndContext>
          )}
        </SectionCard>

        {/* TOPICS */}
        <SectionCard
          icon={<TagsOutlined />}
          title="Topics"
          hint="Select one or more reusable topics for this journal"
        >
          <Form.Item label="Journal Topics" style={{ marginBottom: 0 }}>
            <Select
              mode="multiple"
              value={selectedTopicIds}
              onChange={setSelectedTopicIds}
              placeholder="Select topics"
              showSearch
              optionFilterProp="label"
              allowClear
              options={topics.map((topic) => ({
                value: topic.id,
                label: topic.name,
              }))}
            />
          </Form.Item>
        </SectionCard>

        {/* FAQs */}
        <SectionCard
          icon={<InfoCircleOutlined />}
          title="Frequently Asked Questions"
          hint="Select the FAQs that should be displayed with this journal"
        >
          {faqs.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No FAQs available"
            />
          ) : (
            <Collapse
              bordered
              items={faqs.map((faq) => ({
                key: String(faq.id),

                label: (
                  <Checkbox
                    checked={selectedFaqIds.includes(Number(faq.id))}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const faqId = Number(faq.id);

                      setSelectedFaqIds((prev) => {
                        if (e.target.checked) {
                          return prev.includes(faqId) ? prev : [...prev, faqId];
                        }

                        return prev.filter((id) => id !== faqId);
                      });
                    }}
                  >
                    {faq.question}
                  </Checkbox>
                ),

                children: (
                  <div
                    style={{
                      padding: "4px 8px 8px 32px",
                      color: "#555",
                      lineHeight: 1.7,
                    }}
                  >
                    {faq.answer || "No answer available."}
                  </div>
                ),
              }))}
            />
          )}
        </SectionCard>

        {/* ACTIONS */}
        <div className={styles.sectionCard}>
          <div className={styles.footerBar}>
            <span className={styles.footerHint}>
              Changes are saved when you update the journal.
            </span>

            <Button onClick={() => navigate("/journals")}>Cancel</Button>

            <Button type="primary" onClick={handleSubmit} loading={submitting}>
              Update journal
            </Button>
          </div>
        </div>
      </Form>
    </Box>
  );
};

export default EditBlog;