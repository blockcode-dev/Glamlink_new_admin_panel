/** @format */

import React, { useEffect, useRef, useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Select,
  Card,
  Space,
} from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Box } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import ImgCrop from "antd-img-crop";
import axios from "axios";
import {
  CreateJournal,
  GetAllAuthors,
  GetJournalCategory,
} from "../../../services/Api/JournalApi";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const AddBlog = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  const [fileList, setFileList] = useState([]);
  const [content, setContent] = useState("");
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);

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

  const handleSubmit = async (status) => {
    try {
      const values = await form.validateFields();

      if (!content) {
        message.error("Content is required");
        return;
      }

      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("short_description", values.short_description);
      formData.append("author_id", values.author_id);
      formData.append("category_id", values.category_id);
      formData.append("content", content);
      if (values.publish_date) {
        formData.append(
          "publish_date",
          dayjs(values.publish_date).format("YYYY-MM-DD HH:mm:ss"),
        );
      }

      // NEW
      formData.append("status", status);

      if (fileList.length > 0) {
        formData.append("images", fileList[0].originFileObj);
      }

      await CreateJournal(formData);

      message.success(
        status === "draft"
          ? "Draft saved successfully"
          : "Journal published successfully",
      );

      navigate("/journals");
    } catch {
      message.error("Failed");
    }
  };

  return (
    <Box>
      {/* HEADER */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="20px"
      >
        <div>
          <h3>JOURNALS</h3>
          <p>Manage all journals</p>
        </div>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/journals")}
        >
          Return to Journals
        </Button>
      </Box>

      {/* CARD */}
      <Card title="Add Journal" bordered>
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="short_description"
            label="Short Description"
            rules={[
              { required: true, message: "Short description is required" },
            ]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="author_id"
            label="Author"
            rules={[{ required: true, message: "Select author" }]}
          >
            <Select placeholder="Select Author">
              {authors.map((author) => (
                <Select.Option key={author.id} value={author.id}>
                  {author.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Category"
            rules={[{ required: true, message: "Select category" }]}
          >
            <Select placeholder="Select Category">
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="publish_date"
            label="Publish Date & Time"
            rules={[
              {
                required: false,
              },
            ]}
          >
            <DatePicker
              showTime={{
                use12Hours: true,
                format: "hh:mm A",
              }}
              format="DD/MM/YYYY hh:mm A"
              style={{ width: "100%" }}
              placeholder="Select publish date & time"
            />
          </Form.Item>

          <Form.Item label="Content">
            <Editor
              apiKey="984sn99khgad1wgf4btfw7jil4n458arpqkfgqgxc550lb9m"
              value={content}
              init={{
                height: 500,
                menubar: true,
                plugins:
                  "table link image lists media charmap emoticons code fullscreen",

                // ✅ "insertvideo" replaces "media" in toolbar
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

                // ✅ Image upload handler (unchanged)
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
                        "https://node.glamlink.net:5000/api/v1/journal/upload",
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

                      console.log("Upload response:", res.data);

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

                // ✅ Custom video upload button
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

        const fileSizeMB =
          file.size / (1024 * 1024);

        if (fileSizeMB > 100) {
          message.warning(
            "Large file — upload may take a while",
          );
        }

        // =========================
        // PLACEHOLDER
        // =========================

        const placeholderId =
          `video-placeholder-${Date.now()}`;

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

        // =========================
        // ABORT CONTROLLER
        // =========================

        const controller =
          new AbortController();

        // =========================
        // UPLOAD TOAST UI
        // =========================

        const showUploadMessage = (
          percent = 0,
        ) => {

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
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
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
                  style={{
                    borderRadius: 8,
                    fontWeight: 500,
                  }}
                  onClick={() => {

                    controller.abort();

                    message.destroy(
                      "video-upload",
                    );

                    const editorDoc =
                      editor?.getDoc?.();

                    if (editorDoc) {

                      const el =
                        editorDoc.getElementById(
                          placeholderId,
                        );

                      if (el) el.remove();
                    }

                    message.warning(
                      "Upload cancelled",
                    );
                  }}
                >
                  Cancel
                </Button>

              </div>
            ),
          });
        };

        // INITIAL UI
        showUploadMessage(0);

        try {

          const formData =
            new FormData();

          formData.append(
            "images",
            file,
          );

          const res = await axios.post(
            "https://node.glamlink.net:5000/api/v1/journal/upload",

            formData,

            {
              signal: controller.signal,

              headers: {
                Authorization: `Bearer ${localStorage.getItem(
                  "adminToken",
                )}`,
              },

              onUploadProgress: (event) => {

                if (!isMounted.current)
                  return;

                if (event.total) {

                  const percent =
                    Math.round(
                      (
                        event.loaded /
                        event.total
                      ) * 100,
                    );

                  showUploadMessage(
                    percent,
                  );
                }
              },
            },
          );

          // =========================
          // PAGE CHANGED
          // =========================

          if (!isMounted.current) {

            message.destroy(
              "video-upload",
            );

            return;
          }

          const fileURL =
            res.data?.data?.location;

          if (!fileURL) {

            message.destroy(
              "video-upload",
            );

            message.error(
              "Invalid upload response",
            );

            return;
          }

          // =========================
          // EDITOR DESTROYED
          // =========================

          const editorDoc =
            editor?.getDoc?.();

          if (!editorDoc) {

            message.destroy(
              "video-upload",
            );

            return;
          }

          // =========================
          // REPLACE PLACEHOLDER
          // =========================

          const placeholder =
            editorDoc.getElementById(
              placeholderId,
            );

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
                <source
                  src="${fileURL}"
                  type="${file.type}"
                />
              </video>
            `;
          }

          message.destroy(
            "video-upload",
          );

          message.success(
            "✅ Video uploaded successfully!",
          );

        } catch (err) {

          // =========================
          // PAGE LEFT
          // =========================

          if (!isMounted.current) {

            message.destroy(
              "video-upload",
            );

            return;
          }

          // =========================
          // CANCELLED
          // =========================

          if (
            err.name === "CanceledError"
          ) {
            return;
          }

          console.error(err);

          message.destroy(
            "video-upload",
          );

          message.error(
            "❌ Video upload failed",
          );

          const editorDoc =
            editor?.getDoc?.();

          if (editorDoc) {

            const el =
              editorDoc.getElementById(
                placeholderId,
              );

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
          </Form.Item>

          <Form.Item label="Cover Image">
            <ImgCrop
              aspect={16 / 9}
              quality={1}
              showGrid
              rotationSlider
              modalTitle="Crop Cover Image"
              modalOk="Apply Crop"
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
                fileList={fileList}
                onRemove={() => setFileList([])}
                maxCount={1}
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </ImgCrop>
          </Form.Item>

          <Space>
            <Button type="default" onClick={() => handleSubmit("draft")}>
              Save Draft
            </Button>

            <Button type="primary" onClick={() => handleSubmit("published")}>
              Publish Journal
            </Button>

            <Button onClick={() => navigate("/journals")}>Cancel</Button>
          </Space>
        </Form>
      </Card>
    </Box>
  );
};

export default AddBlog;
