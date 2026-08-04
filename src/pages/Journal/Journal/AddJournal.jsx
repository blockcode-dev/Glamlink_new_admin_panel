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
} from "@ant-design/icons";
import { Box } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import ImgCrop from "antd-img-crop";
import axios from "axios";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
  CreateJournal,
  GetAllAuthors,
  GetJournalCategory,
} from "../../../services/Api/JournalApi";
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

const AddBlog = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  const [fileList, setFileList] = useState([]);
  const [content, setContent] = useState("");
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDropdowns();

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

  const removeDownload = (id) => {
    setDownloads((prev) => prev.filter((item) => item.id !== id));
  };

  const updateDownload = (id, key, value) => {
    setDownloads((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  };

  const handleSubmit = async (status) => {
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
      formData.append("status", status);

      if (values.publish_date) {
        formData.append(
          "publish_date",
          dayjs(values.publish_date).format("YYYY-MM-DD HH:mm:ss"),
        );
      }

      if (fileList.length > 0) {
        formData.append("images", fileList[0].originFileObj);
      }

      // Downloads
      downloads.forEach((download) => {
        formData.append("download_titles[]", download.title);
        formData.append("download_descriptions[]", download.description);
        formData.append("download_button_text[]", download.button_text);

        if (download.fileList.length > 0) {
          formData.append("docs", download.fileList[0].originFileObj);
        }
      });

      await CreateJournal(formData);

      message.success(
        status === "draft"
          ? "Draft saved successfully"
          : "Journal published successfully",
      );

      navigate("/journals");
    } catch (err) {
      console.error(err);
      message.error("Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className={styles.page}>
      {/* HEADER */}
      <div className={styles.headerCard}>
        <div>
          <h3 className={styles.headerTitle}>Add Journal</h3>
          <p className={styles.headerSubtitle}>
            Write a new journal entry, attach downloads, and publish or save
            it as a draft.
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
                <Input placeholder="Enter journal title" />
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
                <Select placeholder="Select author" showSearch optionFilterProp="children">
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
                <Select placeholder="Select category" showSearch optionFilterProp="children">
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

              font_family_formats: `
                Arial=arial,helvetica,sans-serif;
                Calibri=calibri,arial,helvetica,sans-serif;
                Times New Roman=times new roman,times,serif;
                Georgia=georgia,palatino,serif;
                Verdana=verdana,geneva,sans-serif;
                Courier New=courier new,courier,monospace;
              `,

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
              `,

              automatic_uploads: true,
              file_picker_types: "image",
              images_reuse_filename: true,

              images_upload_handler: (blobInfo, progress) => {
                return new Promise(async (resolve, reject) => {
                  const formData = new FormData();
                  formData.append("images", blobInfo.blob(), blobInfo.filename());
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
                    console.error("Image upload failed:", error);
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
                              if (!isMounted.current) return;
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
                  src={URL.createObjectURL(fileList[0].originFileObj)}
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

        {/* ACTIONS */}
        <div className={styles.sectionCard}>
          <div className={styles.footerBar}>
            <span className={styles.footerHint}>
              Save as a draft to keep editing later, or publish now.
            </span>

            <Button onClick={() => navigate("/journals")}>Cancel</Button>

            <Button
              onClick={() => handleSubmit("draft")}
              loading={submitting}
            >
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
    </Box>
  );
};

export default AddBlog;