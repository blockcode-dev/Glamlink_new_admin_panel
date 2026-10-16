/** @format */

import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Upload, Spin, type UploadFile } from "antd";
import {
  ArrowLeftOutlined,
  TagsOutlined,
  PictureOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import ImgCrop from "antd-img-crop";
import RichTextEditor from "../../components/RichTextEditor";

import { GetJournalTopicById, UpdateJournalTopic, UploadJournalMedia } from "../../services/Api/JournalApi";

import styles from "./JournalTopics.module.scss";
import { apiErrorMessage, isFormValidationError } from "../../utils/apiError";
import { useIdParam } from "../../utils/routing";

const EditJournalTopic = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const id = useIdParam();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
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
        apiErrorMessage(error) || "Failed to load topic",
      );

      navigate("/journal-topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTopic();

    return () => {
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
        formData.append("images", fileList[0].originFileObj!);
      }

      await UpdateJournalTopic(id, formData);

      message.success("Topic updated successfully");

      navigate("/journal-topics");
    } catch (error) {
      console.error(error);

      if (isFormValidationError(error)) {
        return;
      }

      message.error(
        apiErrorMessage(error) || "Failed to update topic",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
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
      </div>
    );
  }

  return (
    <div className={styles.page}>
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
                <RichTextEditor
                  full
                  height={420}
                  value={description}
                  onChange={(val) => setDescription(val)}
                  uploadMedia={UploadJournalMedia} />
              </Form.Item>

              <Form.Item label="Topic Image">
                <div className={styles.coverUploadArea}>
                  <div className={styles.coverPreview}>
                    {fileList.length > 0 ? (
                      <img
                        src={URL.createObjectURL(
                          fileList[0].originFileObj!,
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
    </div>
  );
};

export default EditJournalTopic;