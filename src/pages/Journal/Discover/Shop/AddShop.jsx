/** @format */

import React, { useState, useEffect } from "react";
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
import {
  UploadOutlined,
  ArrowLeftOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { Box } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import ImgCrop from "antd-img-crop";

import {
  CreateShop,
  GetAllJournalTopics,
  GetJournalTopicById,
  UpdateJournalTopicShops,
} from "../../../../services/Api/JournalApi";

const AddShop = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [fileList, setFileList] = useState([]);

  // ==========================
  // Topics
  // ==========================

  const [topics, setTopics] = useState([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);

  // ==========================
  // Fetch Topics
  // ==========================

  const fetchTopics = async () => {
    try {
      const result = await GetAllJournalTopics();

      const topicList = Array.isArray(result?.data?.data)
        ? result.data.data
        : result?.data?.data?.rows ||
          result?.data?.rows ||
          [];

      setTopics(topicList);
    } catch (error) {
      console.error(error);
      message.error("Failed to load topics");
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // ==========================
  // Submit
  // ==========================

  const handleSubmit = async (status) => {
    try {
      const values = await form.validateFields();

      const formData = new FormData();

      formData.append("title", values.title);
      formData.append(
        "short_description",
        values.short_description,
      );
      formData.append("brand", values.brand || "");
      if (values.price !== undefined && values.price !== null && values.price !== "") {
  formData.append("price", values.price);
}
      formData.append("link", values.link);
      formData.append("status", status);

      if (fileList.length) {
        formData.append(
          "images",
          fileList[0].originFileObj,
        );
      }

      // ==========================
      // Create Shop
      // ==========================

      const result = await CreateShop(formData);

      const shopId =
        result?.data?.data?.id ||
        result?.data?.id;

      if (!shopId) {
        throw new Error("Shop ID was not returned");
      }

      // ==========================
      // Assign Shop To Topics
      // ==========================

      for (const topicId of selectedTopicIds) {
        const topicResult = await GetJournalTopicById(
          topicId,
        );

        const topic = topicResult?.data?.data;

        if (!topic) {
          continue;
        }

        const topicShops = Array.isArray(topic.shops)
          ? topic.shops
          : [];

        // Preserve existing shops
        const shopIds = topicShops
          .map((shop) => Number(shop.id))
          .filter(Boolean);

        // Add newly created shop
        if (!shopIds.includes(Number(shopId))) {
          shopIds.push(Number(shopId));
        }

        await UpdateJournalTopicShops(topicId, {
          shop_ids: shopIds,
        });
      }

      message.success(
        status === "draft"
          ? "Draft saved successfully"
          : "Shop published successfully",
      );

      navigate("/shop");
    } catch (error) {
      console.error(error);

      message.error(
        error?.response?.data?.message ||
          "Failed to create Shop",
      );
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
          <p>Manage shop articles</p>
        </div>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/shop")}
        >
          Return to Shop Articles
        </Button>
      </Box>

      {/* CARD */}
      <Card title="Add Shop" bordered>
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
                message: "Title is required",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="short_description"
            label="Short Description"
            rules={[
              {
                required: true,
                message: "Short description is required",
              },
            ]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="brand"
            label="Brand"
          >
            <Input placeholder="Enter brand name" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
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

          <Form.Item
            name="status"
            label="Status"
          >
            <Select
              placeholder="Select Status"
              defaultValue="draft"
            >
              <Select.Option value="draft">
                Draft
              </Select.Option>

              <Select.Option value="published">
                Published
              </Select.Option>
            </Select>
          </Form.Item>

          {/* ==========================
              TOPICS
          ========================== */}

          <Card
            title={
              <Space>
                <TagsOutlined />
                <span>Topics</span>
              </Space>
            }
            size="small"
            style={{ marginBottom: 24 }}
          >
            <Form.Item
              label="Shop Topics"
              style={{ marginBottom: 0 }}
              extra="Select one or more reusable topics for this shop"
            >
              <Select
                mode="multiple"
                value={selectedTopicIds}
                onChange={setSelectedTopicIds}
                placeholder="Select topics"
                showSearch
                optionFilterProp="label"
                allowClear
                options={topics.map((topic) => ({
                  value: Number(topic.id),
                  label: topic.name,
                }))}
              />
            </Form.Item>
          </Card>

          {/* ==========================
              COVER IMAGE
          ========================== */}

          <Form.Item label="Cover Image">
            <ImgCrop
              aspect={5 / 5.5}
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
                <Button icon={<UploadOutlined />}>
                  Upload Image
                </Button>
              </Upload>
            </ImgCrop>
          </Form.Item>

          {/* ==========================
              ACTIONS
          ========================== */}

          <Space>
            <Button
              type="default"
              onClick={() => handleSubmit("draft")}
            >
              Save Draft
            </Button>

            <Button
              type="primary"
              onClick={() => handleSubmit("published")}
            >
              Publish Shop
            </Button>

            <Button
              onClick={() => navigate("/shop")}
            >
              Cancel
            </Button>
          </Space>
        </Form>
      </Card>
    </Box>
  );
};

export default AddShop;