/** @format */

import React, { useEffect, useRef, useState } from "react";
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
} from "../../../services/Api/JournalApi";
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: download.id });

  const style = {
    transform: CSS.Transform.toString(
      transform && { ...transform, scaleY: 1 },
    ),
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
          {download.isExisting && (
            <Tag style={{ marginLeft: 4 }}>Existing</Tag>
          )}
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
  const [downloads, setDownloads] = useState([]);
  const [deletedDownloadIds, setDeletedDownloadIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("draft");

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

  const fetchDropdowns = async () => {
    try {
      const authorRes = await GetAllAuthors();
      const categoryRes = await GetJournalCategory();

      setAuthors(authorRes.data.rows || []);
      setCategories(categoryRes.data.rows || []);
    } catch {
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
        status: blog.status || "draft",
        publish_date: blog.publish_date
          ? dayjs(
              blog.publish_date.replace("T", " ").replace(".000Z", ""),
              "YYYY-MM-DD HH:mm:ss",
            )
          : null,
      });

      setCurrentStatus(blog.status || "draft");
      setContent(blog.content || "");

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

        console.log(existingDownloadsPayload,"test");
      await UpdateJournal(id, formData);

      message.success("Journal updated successfully");
      navigate("/journals");
    } catch (err) {
      console.error(err);
      message.error("Failed to update journal");
    } finally {
      setSubmitting(false);
    }
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
                <Input placeholder="Enter journal title" />
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
          hint="Full journal body, images and video"
        >
          <Editor
            apiKey="984sn99khgad1wgf4btfw7jil4n458arpqkfgqgxc550lb9m"
            value={content}
            init={{
              height: 500,
              menubar: true,
              plugins:
                "table link image lists media charmap emoticons code fullscreen",

              toolbar:
                "undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | " +
                "alignleft aligncenter alignright alignjustify | bullist numlist blockquote | " +
                "link image insertvideo table | removeformat | code fullscreen",

              media_live_embeds: true,
              automatic_uploads: true,
              file_picker_types: "image",
              images_reuse_filename: true,

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
                      "https://node.glamlink.net/api/v1/journal/upload",
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
                          "https://node.glamlink.net/api/v1/journal/upload",
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
              },
            }}
            onEditorChange={(val) => setContent(val)}
          />
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