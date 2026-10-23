/** @format */

import React, { useEffect, useState } from "react";
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
  Collapse,
  Checkbox,
  type UploadFile,
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
  SearchOutlined,
  InfoCircleOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import RichTextEditor from "../../../components/RichTextEditor";
import ImgCrop from "antd-img-crop";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
  CreateJournal,
  GetAllAuthors,
  GetJournalCategory,
  GetAllShop,
  GetAllJournalTopics,
  GetAllJournalFaqs,
  UpdateJournalTopicMappings,
  UpdateJournalFaqMappings,
  GetJournalTopicParagraphs,
  UpdateJournalTopicParagraphs,
  UploadJournalMedia,
} from "../../../services/Api/JournalApi";
import { GetAllBusinessCards } from "../../../services/Api/BusinessCardApi";
import styles from "./AddJournal.module.scss";
import { apiErrorMessage, errorMessage } from "../../../utils/apiError";
import type { MentionSource } from "../../../components/richText/extensions";
import type {
  Author,
  DownloadDraft,
  JournalCategory,
  JournalFaq,
  JournalFormValues,
  JournalTopic,
  ParagraphRow,
  ParagraphTopicMap,
  Shop,
} from "../../../types/journal";
import type { BusinessCard } from "../../../types/businessCard";

const SectionCard = ({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) => (
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

// Same slugify rule used on Edit — keeps URLs lowercase, hyphenated, and safe.
const generateSlug = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const AddBlog = () => {
  const [form] = Form.useForm<JournalFormValues>();
  const navigate = useNavigate();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [content, setContent] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<JournalCategory[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [downloads, setDownloads] = useState<DownloadDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [topics, setTopics] = useState<JournalTopic[]>([]);
  const [faqs, setFaqs] = useState<JournalFaq[]>([]);

  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [selectedFaqIds, setSelectedFaqIds] = useState<number[]>([]);

  // Tracks whether the user has hand-edited the slug. Until then, the slug
  // auto-follows the Title field so they get a clean URL for free.
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // ---- @mention (business cards / Access Cards) ----
  const [businessCards, setBusinessCards] = useState<BusinessCard[]>([]);

  // Slug used in /access-card/<slug> — falls back gracefully if the link is missing
  const getCardSlug = (card: BusinessCard) =>
    card.business_card_link?.split("/").filter(Boolean).pop() ||
    card.custom_handle?.replace("@", "") ||
    String(card.id);


  // "@" mentions in the editor: Instagram-style search over active business cards
  // (name, handle or business name); a pick inserts a link to the card.
  const mentionSource: MentionSource = {
    search: (query) => {
      const q = query.toLowerCase();
      return businessCards
        .filter((c) => c.is_active)
        .filter((c) =>
          `${c.name || ""} ${c.custom_handle || ""} ${c.business_name || ""}`
            .toLowerCase()
            .includes(q),
        )
        .slice(0, 50)
        .map((c) => ({
          id: String(c.id),
          label: c.name,
          hint: c.custom_handle ?? undefined,
          avatar: c.profile_image ?? undefined,
        }));
    },
    toLink: (id) => {
      const card = businessCards.find((c) => String(c.id) === id);
      return card
        ? { text: `@${getCardSlug(card)}`, href: card.business_card_link, cardId: card.id }
        : null;
    },
  };

  // Reads every block in the editor that's been tagged with topics and
  // groups their paragraph_ids by topic_id — this is the "current state"
  // as written into the HTML itself (data-paragraph-id / data-topic-ids).
  const extractParagraphTopicMap = (html: string): ParagraphTopicMap => {
    if (!html) return {};

    const doc = new DOMParser().parseFromString(html, "text/html");
    const tagged = doc.querySelectorAll("[data-paragraph-id][data-topic-ids]");

    const map: ParagraphTopicMap = {}; // topicId -> [{ paragraph_id, sort_order }]

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
  // Also de-duplicates by (journal_id, paragraph_id) before sending, and
  // isolates each topic in its own try/catch so one failing topic can't
  // block the others from syncing correctly. Returns the list of topic ids
  // that failed so the caller can warn the admin.
  const syncParagraphTopics = async (
    journalId: number | string,
    currentMap: ParagraphTopicMap,
    previousTopicIds: number[] = [],
  ): Promise<number[]> => {
    const topicIdsToProcess = new Set([
      ...Object.keys(currentMap).map(Number),
      ...previousTopicIds.map(Number),
    ]);

    const failedTopicIds: number[] = [];

    for (const topicId of topicIdsToProcess) {
      try {
        const res = await GetJournalTopicParagraphs(topicId);
        const existing = res?.data?.data || [];

        // Rows belonging to OTHER journals stay untouched
        const others = existing
          .filter((m) => Number(m.journal_id) !== Number(journalId))
          .map((m) => ({
            journal_id: m.journal_id,
            paragraph_id: m.paragraph_id,
            sort_order: m.sort_order,
          }));

        // This journal's current rows for this topic (may be empty)
        const mine = (currentMap[topicId] || []).map((item) => ({
          journal_id: journalId,
          paragraph_id: item.paragraph_id,
          sort_order: item.sort_order,
        }));

        // Keep only one row per (journal_id, paragraph_id)
        const deduped = Array.from(
          [...others, ...mine]
            .reduce((map, row) => {
              map.set(`${row.journal_id}::${row.paragraph_id}`, row);
              return map;
            }, new Map<string, ParagraphRow>())
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

  useEffect(() => {
    fetchDropdowns();

    return () => {
      message.destroy("video-upload");
    };
  }, []);

  const fetchDropdowns = async () => {
    try {
      const [authorRes, categoryRes, shopRes, cardRes, topicRes, faqRes] =
        await Promise.all([
          GetAllAuthors(),
          GetJournalCategory(),
          GetAllShop(),
          GetAllBusinessCards(),
          GetAllJournalTopics(),
          GetAllJournalFaqs(),
        ]);

      setAuthors(authorRes.data.rows || []);
      setCategories(categoryRes.data.rows || []);
      setShops(shopRes.data.rows || []);
      setBusinessCards(cardRes.data.data || []);

      const topicList = Array.isArray(topicRes?.data?.data)
        ? topicRes.data.data
        : topicRes?.data?.data?.rows || topicRes?.data?.rows || [];

      setTopics(topicList);

      const faqList = Array.isArray(faqRes?.data?.data)
        ? faqRes.data.data
        : faqRes?.data?.data?.rows || faqRes?.data?.rows || [];

      setFaqs(faqList);
    } catch (error) {
      console.error(error);
      message.error("Failed to load dropdown data");
    }
  };

  const addDownload = () => {
    setDownloads((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: "",
        description: "",
        button_text: "Download PDF",
        fileList: [],
      },
    ]);
  };

  const removeDownload = (id: DownloadDraft["id"]) => {
    setDownloads((prev) => prev.filter((item) => item.id !== id));
  };

  const updateDownload = <K extends keyof DownloadDraft>(id: DownloadDraft["id"], key: K, value: DownloadDraft[K]) => {
    setDownloads((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  };

  const handleSubmit = async (status: string) => {
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
      formData.append("short_description", String(values.short_description));
      formData.append("author_id", String(values.author_id));
      formData.append("category_id", String(values.category_id));
      formData.append("content", content);
      formData.append("status", status);

      formData.append("seo_title", values.seo_title || "");
      formData.append("meta_description", values.meta_description || "");
      formData.append("slug", values.slug || "");

      if (values.shop_ids?.length) {
        formData.append("shop_ids", JSON.stringify(values.shop_ids));
      } else {
        formData.append("shop_ids", JSON.stringify([]));
      }

      if (values.publish_date) {
        formData.append(
          "publish_date",
          dayjs(values.publish_date).format("YYYY-MM-DD HH:mm:ss"),
        );
      }

      if (fileList.length > 0) {
        formData.append("images", fileList[0].originFileObj!);
      }

      // Downloads
      downloads.forEach((download) => {
        formData.append("download_titles[]", download.title);

        formData.append("download_descriptions[]", download.description);

        formData.append("download_button_text[]", download.button_text);

        if (download.fileList.length > 0) {
          formData.append("docs", download.fileList[0].originFileObj!);
        }
      });

      // Create journal first
      const createResponse = await CreateJournal(formData);

      const journalId = createResponse?.data?.data?.id;

      if (!journalId) {
        throw new Error("Journal created but journal ID was not returned");
      }

      // Sync paragraph-level topic tags picked up from the editor content.
      // A brand-new journal has no "previous" tagged state to reconcile
      // against, so previousTopicIds is always empty here.
      const paragraphTopicMap = extractParagraphTopicMap(content);
      const failedTopicIds =
        Object.keys(paragraphTopicMap).length > 0
          ? await syncParagraphTopics(journalId, paragraphTopicMap, [])
          : [];

      // Attach topics
      if (selectedTopicIds.length > 0) {
        await UpdateJournalTopicMappings(journalId, {
          topic_ids: selectedTopicIds,
        });
      }

      // Attach FAQs
      if (selectedFaqIds.length > 0) {
        await UpdateJournalFaqMappings(journalId, {
          faq_ids: selectedFaqIds,
        });
      }

      if (failedTopicIds.length > 0) {
        // The journal itself is already created and saved — only the
        // per-paragraph topic tags failed to sync. Re-clicking Publish/Save
        // here would create a SECOND journal, so instead of retrying on
        // this page, send the admin straight to the Edit page for the
        // journal that was just created — its "Update journal" button
        // safely retries the tag sync without duplicating anything.
        const failedNames = topics
          .filter((t) => failedTopicIds.includes(t.id))
          .map((t) => t.name);

        message.warning(
          `Journal saved, but the paragraph tag for "${
            failedNames.join(", ") || failedTopicIds.join(", ")
          }" couldn't sync. Opening the journal in Edit — click "Update journal" there to retry.`,
          6,
        );
        navigate(`/edit-journal/${journalId}`);
      } else {
        message.success(
          status === "draft"
            ? "Draft saved successfully"
            : "Journal published successfully",
        );
        navigate("/journals");
      }
    } catch (err) {
      console.error(err);

      message.error(
        apiErrorMessage(err) ||
          errorMessage(err) ||
          "Failed to create journal",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.headerCard}>
        <div>
          <h3 className={styles.headerTitle}>Add Journal</h3>
          <p className={styles.headerSubtitle}>
            Write a new journal entry, attach downloads, and publish or save it
            as a draft.
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
          hint="Title, author, category and schedule"
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
                    if (!slugManuallyEdited) {
                      form.setFieldValue("slug", generateSlug(e.target.value));
                    }
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="publish_date"
                label="Publish date & time"
                tooltip="Optional — leave blank to publish immediately"
              >
                <DatePicker
                  showTime={{ use12Hours: true, format: "hh:mm A" }}
                  format="DD/MM/YYYY hh:mm A"
                  style={{ width: "100%" }}
                  placeholder="Select date & time"
                />
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

            <Col xs={24}>
              <Form.Item
                name="shop_ids"
                label="Shops"
                tooltip="Optional — you can select multiple shops for this journal"
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

            <Col xs={24}>
              <Form.Item
                name="short_description"
                label="Short description"
                rules={[
                  { required: true, message: "Short description is required" },
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
              background: "var(--color-primary-soft)",
              border: "1px solid var(--color-primary-border)",
              borderRadius: 10,
              color: "var(--color-primary)",
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
                <strong>Topic</strong> in the toolbar, pick the
                topics, then click <strong>Save</strong>. The paragraph gets a
                purple label showing its topic(s). This is separate from the
                "Topics" section further down the page, which applies to the
                entire journal.
              </div>
            </div>
          </div>
          <RichTextEditor
            full
            height={500}
            value={content}
            onChange={(val) => setContent(val)}
            uploadMedia={UploadJournalMedia}
            mentions={mentionSource}
            topics={topics} />
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
              background: "var(--color-primary-soft)",
              border: "1px solid var(--color-primary-border)",
              borderRadius: 10,
              color: "var(--color-primary)",
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
                fall back to the main Title / Short description automatically —
                these are only needed if you want something different for search
                engines. The <strong>URL Slug</strong> auto-fills from your
                Title as you type, so you get a clean, working link with zero
                extra effort. Edit it yourself if you want full control over the
                URL.
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
                tooltip="The web-address-friendly version of the journal's title, e.g. glamlink.net/journals/your-slug-here. It fills in automatically as you type the Title — edit it directly any time to set a custom URL instead."
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
                        color: "var(--color-text-tertiary)",
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
                  src={URL.createObjectURL(fileList[0].originFileObj!)}
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
          hint="Optional files readers can download from this journal"
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
            downloads.map((download, index) => (
              <div key={download.id} className={styles.downloadItem}>
                <div className={styles.downloadItemHeader}>
                  <span className={styles.downloadItemLabel}>
                    <span className={styles.downloadIndex}>{index + 1}</span>
                    {download.title || `Download ${index + 1}`}
                  </span>

                  <Button
                    danger
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeDownload(download.id)}
                  >
                    Remove
                  </Button>
                </div>

                <div className={styles.downloadItemBody}>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item label="Title" style={{ marginBottom: 12 }}>
                        <Input
                          placeholder="Download title"
                          value={download.title}
                          onChange={(e) =>
                            updateDownload(download.id, "title", e.target.value)
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
                      <Form.Item label="File" style={{ marginBottom: 0 }}>
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
                    </Col>
                  </Row>
                </div>
              </div>
            ))
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
                      color: "var(--color-text-secondary)",
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
              Save as a draft to keep editing later, or publish now.
            </span>

            <Button onClick={() => navigate("/journals")}>Cancel</Button>

            <Button onClick={() => handleSubmit("draft")} loading={submitting}>
              Save draft
            </Button>

            <Button
              type="primary"
              onClick={() => handleSubmit("published")}
              loading={submitting}
            >
              Publish journal
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default AddBlog;