/** @format */

import React, { useEffect, useState } from "react";
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
import { useParams, useNavigate } from "react-router-dom";

import ImgCrop from "antd-img-crop";
import {
  GetEducationById,
  UpdateEducation,
} from "../../../../services/Api/JournalApi";

const EditEducation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const fetchEducation = async () => {
    try {
      const result = await GetEducationById(id);
      const education = result.data?.data;

      form.setFieldsValue({
        title: education.title,
        short_description: education.short_description,
        category: education.category,
        link: education.link,
        status: education.status || "draft",
      });

      if (education.cover_image) {
        setFileList([
          {
            uid: "-1",
            name: "cover-image",
            status: "done",
            url: education.cover_image,
          },
        ]);
      }
    } catch {
      message.error("Failed to load education");
    }
  };

  useEffect(() => {
    fetchEducation();
  }, []);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("short_description", values.short_description);
      formData.append("category", values.category);
      formData.append("link", values.link);
      formData.append("status", values.status);

      // Only append new image if changed
      if (fileList[0]?.originFileObj) {
        formData.append("images", fileList[0].originFileObj);
      }

      await UpdateEducation(id, formData);

      message.success("Education updated successfully");
      navigate("/education");
    } catch {
      message.error("Failed to update Education");
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
          <h3>EDUCATION</h3>
          <p>Manage education articles</p>
        </div>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/education")}
        >
          Return to Education Articles
        </Button>
      </Box>

      {/* CARD */}
      <Card title="Edit Education" bordered>
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
            name="category"
            label="Category"
            // rules={[
            //   {
            //     required: true,
            //     message: "Category is required",
            //   },
            // ]}
          >
            <Input placeholder="Enter category" />
          </Form.Item>

          <Form.Item
            name="link"
            label="Link"
            rules={[{ required: true, message: "Link is required" }]}
          >
            <Input placeholder="https://..." />
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
              <Select.Option value="draft">Draft</Select.Option>

              <Select.Option value="published">Published</Select.Option>
            </Select>
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
                  // ✅ store cropped file
                  setFileList([
                    {
                      uid: file.uid,
                      name: file.name,
                      status: "done",
                      originFileObj: file, // 🔥 cropped file
                      url: URL.createObjectURL(file), // preview
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
              Update Education
            </Button>

            <Button onClick={() => navigate("/education")}>Cancel</Button>
          </Space>
        </Form>
      </Card>
    </Box>
  );
};

export default EditEducation;
