/** @format */

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  message,
  Select,
  Space,
} from "antd";
import { TagsOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import dayjs from "dayjs";

import {
  GetPodcastScheduleById,
  UpdatePodcastSchedule,
} from "../../services/Api/PodcastScheduleApi";

import {
  GetAllJournalTopics,
  GetJournalTopicById,
  UpdateJournalTopicPodcasts,
} from "../../services/Api/JournalApi";
import { apiErrorMessage } from "../../utils/apiError";
import { useIdParam } from "../../utils/routing";
import type { JournalTopic } from "../../types/journal";
import type { Dayjs } from "dayjs";

interface PodcastFormValues {
  name: string;
  short_description?: string | null;
  schedule_date: Dayjs;
}

const { TextArea } = Input;

const EditPodcastSchedule = () => {
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const navigate = useNavigate();
  const id = useIdParam();

  // ==========================
  // Topics
  // ==========================

  const [topics, setTopics] = useState<JournalTopic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] =
    useState<number[]>([]);
  const [initialTopicIds, setInitialTopicIds] =
    useState<number[]>([]);

  // ==========================
  // Fetch Podcast
  // ==========================

  const getDetails = async () => {
    try {
      const result = await GetPodcastScheduleById(
        id,
        localStorage.getItem("adminToken"),
      );

      const data = result?.data?.data;

      if (!data) {
        message.error(
          "Podcast schedule not found",
        );
        return;
      }

      form.setFieldsValue({
        name: data.name,
        short_description:
          data.short_description,
        schedule_date: data.schedule_date
          ? dayjs(data.schedule_date)
          : null,
      });

      // ==========================
      // Topics directly from
      // Podcast API
      // ==========================

      const assignedTopicIds =
        Array.isArray(data.journal_topics)
          ? data.journal_topics.map(
              (topic) => Number(topic.id),
            )
          : [];

      setSelectedTopicIds(
        assignedTopicIds,
      );

      setInitialTopicIds(
        assignedTopicIds,
      );
    } catch (error) {
      console.error(error);

      message.error(
        "Failed to load schedule",
      );
    }
  };

  // ==========================
  // Fetch All Topics
  // ==========================

  const fetchTopics = async () => {
    try {
      const result =
        await GetAllJournalTopics();

      const topicList = Array.isArray(
        result?.data?.data,
      )
        ? result.data.data
        : result?.data?.data?.rows ||
          result?.data?.rows ||
          [];

      setTopics(topicList);
    } catch (error) {
      console.error(error);

      message.error(
        "Failed to load topics",
      );
    }
  };

  useEffect(() => {
    getDetails();
    fetchTopics();
  }, [id]);

  // ==========================
  // Sync Podcast -> Topics
  // ==========================

  const syncPodcastTopics = async () => {
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
       * UpdateJournalTopicPodcasts replaces
       * all podcasts for the topic.
       *
       * Therefore we first get the current
       * podcasts so we don't remove other
       * podcasts assigned to the same topic.
       */
      const topicResult =
        await GetJournalTopicById(topicId);

      const topic =
        topicResult?.data?.data;

      if (!topic) {
        continue;
      }

      const topicPodcasts =
        Array.isArray(topic.podcasts)
          ? topic.podcasts
          : [];

      const isSelected =
        currentTopicIds.includes(
          Number(topicId),
        );

      let podcastIds =
        topicPodcasts
          .map((podcast) =>
            Number(podcast.id),
          )
          .filter(Boolean);

      if (isSelected) {
        // Add current podcast
        if (
          !podcastIds.includes(
            Number(id),
          )
        ) {
          podcastIds.push(
            Number(id),
          );
        }
      } else {
        // Remove current podcast
        podcastIds =
          podcastIds.filter(
            (podcastId) =>
              podcastId !==
              Number(id),
          );
      }

      await UpdateJournalTopicPodcasts(
        topicId,
        {
          podcast_ids: podcastIds,
        },
      );
    }
  };

  // ==========================
  // Submit
  // ==========================

  const onFinish = async (values: PodcastFormValues) => {
    try {
      setLoading(true);

      const payload = {
        name: values.name,
        short_description:
          values.short_description,
        schedule_date:
          values.schedule_date.format(
            "YYYY-MM-DD",
          ),
      };

      // ==========================
      // Update Podcast
      // ==========================

      await UpdatePodcastSchedule(
        id,
        payload,
        localStorage.getItem(
          "adminToken",
        ),
      );

      // ==========================
      // Update Topic Mapping
      // ==========================

      await syncPodcastTopics();

      message.success(
        "Podcast schedule updated successfully",
      );

      navigate(
        "/podcast-schedule",
      );
    } catch (error) {
      console.error(error);

      message.error(
        apiErrorMessage(error) ||
          "Failed to update schedule",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card
        title="Edit Podcast Schedule"
        extra={
          <Button
            onClick={() =>
              navigate(
                "/podcast-schedule",
              )
            }
          >
            ← Back to Podcast Schedule
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Guest Name"
            name="name"
            rules={[
              {
                required: true,
                message:
                  "Please enter guest name",
              },
            ]}
          >
            <Input placeholder="Enter guest name" />
          </Form.Item>

          <Form.Item
            label="Short Description"
            name="short_description"
          >
            <TextArea
              rows={4}
              placeholder="Enter description"
            />
          </Form.Item>

          <Form.Item
            label="Schedule Date"
            name="schedule_date"
            rules={[
              {
                required: true,
                message:
                  "Please select schedule date",
              },
            ]}
          >
            <DatePicker
              style={{
                width: "100%",
              }}
            />
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
            style={{
              marginBottom: 24,
            }}
          >
            <Form.Item
              label="Podcast Topics"
              style={{
                marginBottom: 0,
              }}
              extra="Select one or more reusable topics for this podcast"
            >
              <Select
                mode="multiple"
                value={selectedTopicIds}
                onChange={
                  setSelectedTopicIds
                }
                placeholder="Select topics"
                showSearch
                optionFilterProp="label"
                allowClear
                options={topics.map(
                  (topic) => ({
                    value: Number(
                      topic.id,
                    ),
                    label: topic.name,
                  }),
                )}
              />
            </Form.Item>
          </Card>

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Update Schedule
            </Button>

            <Button
              onClick={() =>
                navigate(
                  "/podcast-schedule",
                )
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

export default EditPodcastSchedule;