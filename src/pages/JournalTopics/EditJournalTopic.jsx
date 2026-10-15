/** @format */

import React, { useEffect, useRef, useState } from "react";
import { Form, Input, Button, message, Upload, Spin } from "antd";
import {
  ArrowLeftOutlined,
  TagsOutlined,
  PictureOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Box } from "@material-ui/core";
import { useNavigate, useParams } from "react-router-dom";
import ImgCrop from "antd-img-crop";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";

import {
  GetJournalTopicById,
  UpdateJournalTopic,
} from "../../services/Api/JournalApi";

import styles from "./JournalTopics.module.scss";

const EditJournalTopic = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isMounted = useRef(true);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [fileList, setFileList] = useState([]);
  const [existingImage, setExistingImage] = useState("");
  const [description, setDescription] = useState("");

  const getTopic = async () => {
    try {
      setLoading(true);

      const response = await GetJournalTopicById(id);

      const topic =
        response?.data?.data || response?.data || null;

      if (!topic) {
        message.error("Topic not found");
        navigate("/journal-topics");
        return;
      }

      form.setFieldsValue({
        name: topic.name || "",
      });

      setDescription(topic.description || "");
      setExistingImage(topic.cover_image || "");
    } catch (error) {
      console.error(error);

      message.error(
        error?.response?.data?.message || "Failed to load topic",
      );

      navigate("/journal-topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTopic();

    return () => {
      isMounted.current = false;
      message.destroy("video-upload");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setSubmitting(true);

      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("description", description || "");

      if (fileList.length > 0) {
        formData.append("images", fileList[0].originFileObj);
      }

      await UpdateJournalTopic(id, formData);

      message.success("Topic updated successfully");

      navigate("/journal-topics");
    } catch (error) {
      console.error(error);

      if (error?.errorFields) {
        return;
      }

      message.error(
        error?.response?.data?.message || "Failed to update topic",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box className={styles.page}>
        <div
          className={styles.tableCard}
          style={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin size="large" />
        </div>
      </Box>
    );
  }

  return (
    <Box className={styles.page}>
      {/* HEADER */}
      <div className={styles.headerCard}>
        <div>
          <h3 className={styles.headerTitle}>Edit Topic</h3>

          <p className={styles.headerSubtitle}>
            Update the topic information.
          </p>
        </div>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/journal-topics")}
        >
          Return to Topics
        </Button>
      </div>

      <div className={styles.tableCard}>
        <Form form={form} layout="vertical">
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <TagsOutlined />
              </div>

              <div className={styles.sectionHeaderText}>
                <span className={styles.sectionTitle}>Topic details</span>

                <span className={styles.sectionHint}>
                  Update the basic information for this topic.
                </span>
              </div>
            </div>

            <div className={styles.sectionBody}>
              <Form.Item
                name="name"
                label="Topic Name"
                rules={[
                  {
                    required: true,
                    message: "Topic name is required",
                  },
                ]}
              >
                <Input
                  maxLength={255}
                  showCount
                  placeholder="e.g. Facelift"
                />
              </Form.Item>

              <Form.Item label="Description">
                <Editor
                  apiKey="0w662c96u34p1ur1y0abs6rw1cnlf5heqps96wvj4806wsdo"
                  value={description}
                  onEditorChange={(val) => setDescription(val)}
                  init={{
                    height: 420,
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
                        font-size: 20px;
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
                        const uploadData = new FormData();
                        uploadData.append(
                          "images",
                          blobInfo.blob(),
                          blobInfo.filename(),
                        );
                        try {
                          const res = await axios.post(
                            "https://node.glamlink.net/api/v1/journal/upload",
                            uploadData,
                            {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                  "adminToken",
                                )}`,
                              },
                              onUploadProgress: (event) => {
                                if (event.total) {
                                  progress(
                                    Math.round(
                                      (event.loaded / event.total) * 100,
                                    ),
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
                              message.warning(
                                "Large file — upload may take a while",
                              );
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
                                      <div
                                        style={{ fontWeight: 600, fontSize: 14 }}
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
                                      style={{ borderRadius: 8, fontWeight: 500 }}
                                      onClick={() => {
                                        controller.abort();
                                        message.destroy("video-upload");

                                        const editorDoc = editor?.getDoc?.();
                                        if (editorDoc) {
                                          const el =
                                            editorDoc.getElementById(
                                              placeholderId,
                                            );
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
                              const uploadData = new FormData();
                              uploadData.append("images", file);

                              const res = await axios.post(
                                "https://node.glamlink.net/api/v1/journal/upload",
                                uploadData,
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
                                const el =
                                  editorDoc.getElementById(placeholderId);
                                if (el) el.remove();
                              }
                            }
                          };

                          input.click();
                        },
                      });
                    },
                  }}
                />
              </Form.Item>

              <Form.Item label="Topic Image">
                <div className={styles.coverUploadArea}>
                  <div className={styles.coverPreview}>
                    {fileList.length > 0 ? (
                      <img
                        src={URL.createObjectURL(
                          fileList[0].originFileObj,
                        )}
                        alt="Topic preview"
                      />
                    ) : existingImage ? (
                      <img src={existingImage} alt="Topic" />
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
                      modalTitle="Crop topic image"
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
                          {fileList.length > 0 || existingImage
                            ? "Replace image"
                            : "Upload image"}
                        </Button>
                      </Upload>
                    </ImgCrop>

                    {fileList.length > 0 && (
                      <Button
                        danger
                        type="text"
                        onClick={() => setFileList([])}
                      >
                        Remove new image
                      </Button>
                    )}

                    <span className={styles.coverHelp}>
                      Recommended ratio 16:9. JPG or PNG.
                    </span>
                  </div>
                </div>
              </Form.Item>
            </div>
          </div>

          {/* ACTIONS */}
          <div className={styles.sectionCard}>
            <div className={styles.footerBar}>
              <span className={styles.footerHint}>
                Save your changes when you're finished.
              </span>

              <Button onClick={() => navigate("/journal-topics")}>
                Cancel
              </Button>

              <Button
                type="primary"
                onClick={handleSubmit}
                loading={submitting}
              >
                Update Topic
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </Box>
  );
};

export default EditJournalTopic;