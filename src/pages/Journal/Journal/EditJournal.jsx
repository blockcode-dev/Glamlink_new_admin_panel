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
  DatePicker,
} from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Box } from "@material-ui/core";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import dayjs from "dayjs";
import moment from "moment";
import { useParams, useNavigate } from "react-router-dom";

import {
  GetJournalById,
  UpdateJournal,
  GetJournalCategory,
  GetAllAuthors,
} from "../../../services/Api/JournalApi";
import ImgCrop from "antd-img-crop";

const EditBlog = () => {
  const { id } = useParams();
  const isMounted = useRef(true);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState([]);
  const [content, setContent] = useState("");
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);

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
    } catch {
      message.error("Failed to load blog");
    }
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
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
      formData.append("status", values.status);

      if (values.publish_date) {
        formData.append(
          "publish_date",
          values.publish_date.format("YYYY-MM-DD HH:mm:ss"),
        );
      }

      // Only append new image if changed
      if (fileList[0]?.originFileObj) {
        formData.append("images", fileList[0].originFileObj);
      }

      await UpdateJournal(id, formData);

      message.success("Journal updated successfully");
      navigate("/journals");
    } catch {
      message.error("Failed to update journal");
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
      <Card title="Edit Journal" bordered>
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
            rules={[{ required: true, message: "Short description required" }]}
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
  name="status"
  label="Status"
  rules={[
    {
      required: true,
      message: "Select status",
    },
  ]}
>
  <Select placeholder="Select Status">

    <Select.Option value="draft">
      Draft
    </Select.Option>

    <Select.Option value="published">
      Published
    </Select.Option>

  </Select>
</Form.Item>

          <Form.Item name="publish_date" label="Publish Date">
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

                toolbar:
                  "undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | " +
                  "alignleft aligncenter alignright alignjustify | bullist numlist blockquote | " +
                  "link image insertvideo table | removeformat | code fullscreen", // ✅ insertvideo replaces media

                // ✅ Custom video upload button
              setup: (editor) => {

  editor.ui.registry.addButton("insertvideo", {

    text: "📹 Video",
    tooltip: "Insert Video",

    onAction: () => {

      const input =
        document.createElement("input");

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
        // TOAST UI
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
                  justifyContent:
                    "space-between",
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

        // INITIAL MESSAGE
        showUploadMessage(0);

        try {

          const formData =
            new FormData();

          formData.append(
            "images",
            file,
          );

          const res =
            await axios.post(

              "https://node.glamlink.net:5000/api/v1/journal/upload",

              formData,

              {

                signal:
                  controller.signal,

                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "adminToken",
                  )}`,
                },

                onUploadProgress:
                  (event) => {

                    if (
                      !isMounted.current
                    ) {
                      controller.abort();
                      return;
                    }

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
          // PAGE LEFT
          // =========================

          if (!isMounted.current) {

            controller.abort();

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
            err.name ===
            "CanceledError"
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

                media_live_embeds: true,
                automatic_uploads: true,
                file_picker_types: "image", // ✅ Only image uses file picker now
                images_reuse_filename: true,
                images_upload_handler: (blobInfo, progress) => {
                  /* ...your existing image handler... */
                },
                file_picker_callback: (callback, value, meta) => {
                  // ✅ Only handle image now
                  if (meta.filetype === "image") {
                    /* ...your existing image picker code... */
                  }
                },
              }}
              onEditorChange={(val) => setContent(val)}
            />
          </Form.Item>

          {/* <Form.Item label="Content">
            <Editor
              apiKey="984sn99khgad1wgf4btfw7jil4n458arpqkfgqgxc550lb9m"
              value={content}
              init={{
                height: 500,
                menubar: true,
                plugins:
                  "table link image lists media charmap emoticons code fullscreen",

                toolbar:
                  "undo redo | bold italic | " +
                  "alignleft aligncenter alignright | " +
                  "bullist numlist | image media | code",

                file_picker_types: "media",

                file_picker_callback: (callback, value, meta) => {
                  if (meta.filetype === "media") {
                    const input = document.createElement("input");

                    input.type = "file";
                    input.accept = "video/*";

                    input.onchange = () => {
                      const file = input.files?.[0];

                      if (!file) return;

                      // Local preview URL
                      const fileURL = URL.createObjectURL(file);

                      callback(fileURL, {
                        source2: fileURL,
                        poster: "",
                      });
                    };

                    input.click();
                  }
                },

                media_live_embeds: true,
                //   }}
                // toolbar:
                //   "undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | " +
                //   "alignleft aligncenter alignright alignjustify | bullist numlist blockquote | " +
                //   "link image media table | removeformat | code fullscreen",

                // automatic_uploads: true,
                // file_picker_types: "image media",
                // images_reuse_filename: true,

                // // ✅ FILE PICKER
                // file_picker_callback: (callback, value, meta) => {
                //   const input = document.createElement("input");
                //   input.setAttribute("type", "file");

                //   if (meta.filetype === "image") {
                //     input.setAttribute("accept", "image/*");
                //   }

                //   if (meta.filetype === "media") {
                //     input.setAttribute("accept", "video/*");
                //   }

                //   input.onchange = async () => {
                //     const file = input.files?.[0];
                //     if (!file) return;

                //     const formData = new FormData();
                //     formData.append("images", file);

                //     try {
                //       const res = await axios.post(
                //         "https://node.glamlink.net:5000/api/v1/journal/upload",
                //         formData,
                //         {
                //           headers: {
                //             Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                //           },
                //         },
                //       );

                //       const fileUrl = res.data?.data?.location;
                //       if (!fileUrl) throw new Error("Invalid response");

                //       callback(fileUrl, { title: file.name });
                //     } catch (err) {
                //       console.error(err);
                //     }
                //   };

                //   input.click();
                // },

                // // ✅ IMAGE UPLOAD HANDLER (separate, not nested)
                // images_upload_handler: (blobInfo, progress) => {
                //   return new Promise(async (resolve, reject) => {
                //     const formData = new FormData();
                //     formData.append(
                //       "images",
                //       blobInfo.blob(),
                //       blobInfo.filename(),
                //     );

                //     try {
                //       const res = await axios.post(
                //         "https://node.glamlink.net:5000/api/v1/journal/upload",
                //         formData,
                //         {
                //           headers: {
                //             Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                //           },
                //           onUploadProgress: (event) => {
                //             if (event.total) {
                //               progress(
                //                 Math.round((event.loaded / event.total) * 100),
                //               );
                //             }
                //           },
                //         },
                //       );

                //       const imageUrl = res.data?.data?.location;
                //       if (!imageUrl) {
                //         return reject("Invalid response format from server");
                //       }

                //       resolve(imageUrl);
                //     } catch (error) {
                //       console.error("Upload failed:", error);
                //       reject("Image upload failed");
                //     }
                //   });
                // },
              }}
              onEditorChange={(val) => setContent(val)}
            />
          </Form.Item> */}
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
                  // ✅ store cropped file
                  setFileList([
                    {
                      uid: file.uid,
                      name: file.name,
                      status: "done",
                      originFileObj: file, // 🔥 cropped file
                      thumbUrl: URL.createObjectURL(file), // preview
                    },
                  ]);

                  return false;
                }}
                fileList={fileList}
                onRemove={() => setFileList([])}
                maxCount={1}
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Update Cover Image</Button>
              </Upload>
            </ImgCrop>
          </Form.Item>

          <Space>
            <Button type="primary" onClick={handleSubmit}>
              Update Journal
            </Button>

            <Button onClick={() => navigate("/journals")}>Cancel</Button>
          </Space>
        </Form>
      </Card>
    </Box>
  );
};

export default EditBlog;
