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
import { GetShopById, UpdateShop } from "../../../../services/Api/JournalApi";

const EditShop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const fetchShop = async () => {
    try {
      const result = await GetShopById(id);
      const shop = result.data?.data;

      form.setFieldsValue({
        title: shop.title,
        short_description: shop.short_description,
        brand: shop.brand,
        price: shop.price,
        link: shop.link,
        status: shop.status || "draft",
      });

      if (shop.cover_image) {
        setFileList([
          {
            uid: "-1",
            name: "cover-image",
            status: "done",
            url: shop.cover_image,
          },
        ]);
      }
    } catch {
      message.error("Failed to load shop");
    }
  };

  useEffect(() => {
    fetchShop();
  }, []);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("short_description", values.short_description);
      formData.append("brand", values.brand);
      formData.append("price", values.price);
      formData.append("link", values.link);
      formData.append("status", values.status);

      // Only append new image if changed
      if (fileList[0]?.originFileObj) {
        formData.append("images", fileList[0].originFileObj);
      }

      await UpdateShop(id, formData);

      message.success("Shop updated successfully");
      navigate("/shop");
    } catch {
      message.error("Failed to update Shop");
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
          <h3>Shop</h3>
          <p>Manage Shop</p>
        </div>

        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/shop")}>
          Return to Shop Articles
        </Button>
      </Box>

      {/* CARD */}
      <Card title="Edit Shop" bordered>
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
              Update Shop
            </Button>

            <Button onClick={() => navigate("/shop")}>Cancel</Button>
          </Space>
        </Form>
      </Card>
    </Box>
  );
};

export default EditShop;
