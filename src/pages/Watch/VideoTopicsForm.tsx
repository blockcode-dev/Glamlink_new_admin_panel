import React, { useState } from "react";
import { Button, Form, Select, message } from "antd";
import { Panel } from "../../components/PageHeader";
import { SetVideoTopics } from "../../services/Api/VideoApi";
import { apiErrorMessage } from "../../utils/apiError";
import { showFieldError } from "../../utils/formErrors";
import styles from "./Watch.module.scss";
import type { JournalTopic } from "../../types/journal";
import type { Video } from "../../types/video";

interface Values {
  topic_ids: number[];
}

interface VideoTopicsFormProps {
  video: Video;
  /** The active journal topics, the only ones a video can have. */
  topics: JournalTopic[];
  onSaved: (video: Video) => void;
}

/** A video's journal topics, in order, saved all at once. Keyed by the video. */
const VideoTopicsForm = ({ video, topics, onSaved }: VideoTopicsFormProps) => {
  const [form] = Form.useForm<Values>();
  const [saving, setSaving] = useState(false);

  // A topic made inactive since doesn't show on the site, and the API refuses it on save: it's left out.
  const active = (ids: number[]) => ids.filter((id) => topics.some((topic) => topic.id === id));

  const save = async ({ topic_ids = [] }: Values) => {
    try {
      setSaving(true);
      const res = await SetVideoTopics(video.id, topic_ids);
      form.setFieldsValue({ topic_ids: active(res.data.data.topic_ids) });
      message.success("Topics saved");
      onSaved(res.data.data);
    } catch (err) {
      message.error(showFieldError(form, err) || apiErrorMessage(err) || "Couldn't save the topics");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel>
      <h4 className={styles.sectionTitle}>Topics</h4>
      <p className={styles.hint}>
        The video's page lists its topics in this order (the order they're picked in), and each topic's page lists the
        video.
      </p>
      <Form form={form} initialValues={{ topic_ids: active(video.topic_ids) }} onFinish={save}>
        <Form.Item name="topic_ids">
          <Select
            mode="multiple"
            allowClear
            placeholder="Pick topics"
            aria-label="Topics"
            showSearch={{ optionFilterProp: "label" }}
            options={topics.map((topic) => ({ value: topic.id, label: topic.name }))}
          />
        </Form.Item>
        <div className={styles.actions}>
          <Button type="primary" htmlType="submit" loading={saving}>
            Save topics
          </Button>
        </div>
      </Form>
    </Panel>
  );
};

export default VideoTopicsForm;
