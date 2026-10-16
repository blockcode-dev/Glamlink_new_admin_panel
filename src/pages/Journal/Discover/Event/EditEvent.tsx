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
  DatePicker,
  type UploadFile,
} from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import dayjs from "dayjs";

import ImgCrop from "antd-img-crop";
import { GetEventById, UpdateEvent } from "../../../../services/Api/JournalApi";
import { useIdParam } from "../../../../utils/routing";

const EditEvent = () => {
  const id = useIdParam();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const fetchEvent = async () => {
    try {
      const result = await GetEventById(id);
      const event = result.data?.data;

      form.setFieldsValue({
        title: event.title,
        short_description: event.short_description,
        event_date: event.event_date ? dayjs(event.event_date) : null,
        location: event.location,
        link: event.link,
        status: event.status || "draft",
      });

      if (event.cover_image) {
        setFileList([
          {
            uid: "-1",
            name: "cover-image",
            status: "done",
            url: event.cover_image,
          },
        ]);
      }
    } catch {
      message.error("Failed to load education");
    }
  };

  useEffect(() => {
    fetchEvent();
  }, []);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("short_description", values.short_description);
      formData.append(
        "event_date",
        values.event_date.format("YYYY-MM-DD HH:mm:ss"),
      );
      formData.append("location", values.location);
      formData.append("link", values.link);
      formData.append("status", values.status);

      // Only append new image if changed
      if (fileList[0]?.originFileObj) {
        formData.append("images", fileList[0].originFileObj);
      }

      await UpdateEvent(id, formData);

      message.success("Event updated successfully");
      navigate("/events");
    } catch {
      message.error("Failed to update Event");
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
        <div>
          <h3>EVENTS</h3>
          <p>Manage events</p>
        </div>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/events")}
        >
          Return to Event Articles
        </Button>
      </div>

      {/* CARD */}
      <Card title="Edit Event">
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
            name="event_date"
            label="Event Date & Time"
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
          >
            <Input placeholder="Enter event location" />
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
              Update Event
            </Button>

            <Button onClick={() => navigate("/events")}>Cancel</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default EditEvent;
