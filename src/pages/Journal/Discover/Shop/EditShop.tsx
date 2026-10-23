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
  type UploadFile,
} from "antd";
import {
  UploadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import ImgCrop from "antd-img-crop";

import {
  GetShopById,
  UpdateShop,
  GetAllJournalTopics,
  GetJournalTopicById,
  UpdateJournalTopicShops,
} from "../../../../services/Api/JournalApi";
import { apiErrorMessage } from "../../../../utils/apiError";
import { useIdParam } from "../../../../utils/routing";
import type { JournalTopic } from "../../../../types/journal";

const EditShop = () => {
  const id = useIdParam();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // ==========================
  // Topics
  // ==========================

  const [topics, setTopics] = useState<JournalTopic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [initialTopicIds, setInitialTopicIds] = useState<number[]>([]);

  // ==========================
  // Fetch Shop
  // ==========================

  const fetchShop = async () => {
    try {
      const result = await GetShopById(id);
      const shop = result.data?.data;

      if (!shop) {
        message.error("Shop not found");
        return;
      }

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

      // ==========================
      // Topics directly from Shop API
      // ==========================

      const assignedTopicIds = Array.isArray(
        shop.journal_topics,
      )
        ? shop.journal_topics.map((topic) =>
            Number(topic.id),
          )
        : [];

      setSelectedTopicIds(assignedTopicIds);
      setInitialTopicIds(assignedTopicIds);
    } catch (error) {
      console.error(error);
      message.error("Failed to load shop");
    }
  };

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
    fetchShop();
    fetchTopics();
  }, [id]);

  // ==========================
  // Submit
  // ==========================

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // ==========================
      // Update Shop
      // ==========================

      const formData = new FormData();

      formData.append("title", values.title);
      formData.append(
        "short_description",
        values.short_description,
      );
      formData.append("brand", values.brand || "");

      if (
        values.price !== undefined &&
        values.price !== null &&
        values.price !== ""
      ) {
        formData.append("price", values.price);
      }

      formData.append("link", values.link);
      formData.append("status", values.status);

      if (fileList[0]?.originFileObj) {
        formData.append(
          "images",
          fileList[0].originFileObj,
        );
      }

      await UpdateShop(id, formData);

      // ==========================
      // Update Topic Mappings
      // ==========================

      const currentTopicIds =
        selectedTopicIds.map(Number);

      const previousTopicIds =
        initialTopicIds.map(Number);

      const affectedTopicIds = [
        ...new Set([
          ...currentTopicIds,
          ...previousTopicIds,
        ]),
      ];

      for (const topicId of affectedTopicIds) {
        /*
         * UpdateJournalTopicShops replaces all shops
         * for the topic, so first get the current
         * shops to preserve the other shops.
         */
        const topicResult =
          await GetJournalTopicById(topicId);

        const topic = topicResult?.data?.data;

        if (!topic) {
          continue;
        }

        const topicShops = Array.isArray(
          topic.shops,
        )
          ? topic.shops
          : [];

        const isSelected =
          currentTopicIds.includes(
            Number(topicId),
          );

        let shopIds = topicShops
          .map((shop) => Number(shop.id))
          .filter(Boolean);

        if (isSelected) {
          if (!shopIds.includes(Number(id))) {
            shopIds.push(Number(id));
          }
        } else {
          shopIds = shopIds.filter(
            (shopId) =>
              shopId !== Number(id),
          );
        }

        await UpdateJournalTopicShops(
          topicId,
          {
            shop_ids: shopIds,
          },
        );
      }

      message.success(
        "Shop updated successfully",
      );

      navigate("/shop");
    } catch (error) {
      console.error(error);

      message.error(
        apiErrorMessage(error) ||
          "Failed to update Shop",
      );
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
          <h3>Shop</h3>
          <p>Manage Shop</p>
        </div>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/shop")}
        >
          Return to Shop Articles
        </Button>
      </div>

      {/* CARD */}
      <Card title="Edit Shop">
        <Form
          form={form}
          layout="vertical"
        >
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
                message:
                  "Short description required",
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

          {/* ==========================
              TOPICS
          ========================== */}

          <Card
            title="Topics"
            size="small"
            style={{
              marginBottom: 24,
            }}
          >
            <Form.Item
              label="Shop Topics"
              style={{
                marginBottom: 0,
              }}
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
                options={topics.map(
                  (topic) => ({
                    value: Number(topic.id),
                    label: topic.name,
                  }),
                )}
              />
            </Form.Item>
          </Card>

          {/* COVER IMAGE */}

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
                      url: URL.createObjectURL(
                        file,
                      ),
                    },
                  ]);

                  return false;
                }}
                fileList={fileList}
                onRemove={() =>
                  setFileList([])
                }
                maxCount={1}
                listType="picture"
              >
                <Button
                  icon={<UploadOutlined />}
                >
                  Update Cover Image
                </Button>
              </Upload>
            </ImgCrop>
          </Form.Item>

          <Space>
            <Button
              type="primary"
              onClick={handleSubmit}
            >
              Update Shop
            </Button>

            <Button
              onClick={() =>
                navigate("/shop")
              }
            >
              Cancel
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default EditShop;