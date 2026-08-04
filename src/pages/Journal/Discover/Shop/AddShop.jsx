/** @format */

import React, { useState } from "react";
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
import ImgCrop from "antd-img-crop";
import { CreateShop } from "../../../../services/Api/JournalApi";

const AddShop = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);

  const handleSubmit = async (status) => {
    try {
      const values = await form.validateFields();

      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("short_description", values.short_description);
      formData.append("brand", values.brand);
      formData.append("price", values.price);
      formData.append("link", values.link);
      formData.append("status", status);

      if (fileList.length) {
        formData.append("images", fileList[0].originFileObj);
      }

      await CreateShop(formData);

      message.success(
        status === "draft"
          ? "Draft saved successfully"
          : "Shop published successfully",
      );

      navigate("/shop");
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
          <h3>SHOP</h3>
          <p>Manage shop artices</p>
        </div>

        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/shop")}>
          Return to Shop Articles
        </Button>
      </Box>

      {/* CARD */}
      <Card title="Add Shop" bordered>
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
            name="brand"
            label="Brand"
            // rules={[
            //   {
            //     required: true,
            //     message: "Brand is required",
            //   },
            // ]}
          >
            <Input placeholder="Enter brand name" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            // rules={[
            //   {
            //     required: true,
            //     message: "Price is required",
            //   },
            // ]}
          >
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="Enter price"
            />
          </Form.Item>

          <Form.Item
            name="link"
            label="Link"
            rules={[
              {
                required: true,
                message: "Link is required",
              },
            ]}
          >
            <Input placeholder="https://..." />
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
              Publish Shop
            </Button>

            <Button onClick={() => navigate("/shop")}>Cancel</Button>
          </Space>
        </Form>
      </Card>
    </Box>
  );
};

export default AddShop;
