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

import {
  CreatePodcastSchedule,
} from "../../services/Api/PodcastScheduleApi";

import {
  GetAllJournalTopics,
  GetJournalTopicById,
  UpdateJournalTopicPodcasts,
} from "../../services/Api/JournalApi";
import { apiErrorMessage, errorMessage } from "../../utils/apiError";
import type { JournalTopic } from "../../types/journal";
import type { Dayjs } from "dayjs";

interface PodcastFormValues {
  name: string;
  short_description?: string | null;
  schedule_date: Dayjs;
}

const { TextArea } = Input;

const AddPodcastSchedule = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ==========================
  // Topics
  // ==========================

  const [topics, setTopics] = useState<JournalTopic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] =
    useState<number[]>([]);

  // ==========================
  // Fetch Topics
  // ==========================

  const fetchTopics = async () => {
    try {
      const result = await GetAllJournalTopics();

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

      message.error("Failed to load topics");
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // ==========================
  // Add Podcast To Topics
  // ==========================

  const syncPodcastTopics = async (podcastId: number) => {
    for (const topicId of selectedTopicIds) {
      try {
        /*
         * Get the topic so we preserve
         * podcasts already assigned to it.
         */
        const topicResult =
          await GetJournalTopicById(topicId);

        const topic =
          topicResult?.data?.data;

        if (!topic) {
          continue;
        }

        const existingPodcasts =
          Array.isArray(topic.podcasts)
            ? topic.podcasts
            : [];

        let podcastIds =
          existingPodcasts
            .map((podcast) =>
              Number(podcast.id),
            )
            .filter(Boolean);

        // Add newly created podcast
        if (
          !podcastIds.includes(
            Number(podcastId),
          )
        ) {
          podcastIds.push(
            Number(podcastId),
          );
        }

        await UpdateJournalTopicPodcasts(
          topicId,
          {
            podcast_ids: podcastIds,
          },
        );
      } catch (error) {
        console.error(
          `Failed to assign podcast to topic ${topicId}`,
          error,
        );

        throw error;
      }
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
      // Create Podcast
      // ==========================

      const result =
        await CreatePodcastSchedule(payload);

      /*
       * Adjust this if your create API returns
       * the ID under a different property.
       */
      const podcast =
        result?.data?.data;

      const podcastId =
        podcast?.id ||
        result?.data?.id;

      if (!podcastId) {
        throw new Error(
          "Podcast created but podcast ID was not returned",
        );
      }

      // ==========================
      // Update Topic Mappings
      // ==========================

      if (selectedTopicIds.length) {
        await syncPodcastTopics(
          podcastId,
        );
      }

      message.success(
        "Podcast schedule created successfully",
      );

      navigate("/podcast-schedule");
    } catch (err) {
      console.error(err);

      message.error(
        apiErrorMessage(err) ||
          errorMessage(err) ||
          "Failed to create schedule",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card
        title="Add Podcast Schedule"
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
              Create Schedule
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

export default AddPodcastSchedule;