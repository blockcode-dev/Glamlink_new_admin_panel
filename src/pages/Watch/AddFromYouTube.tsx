import React, { useState } from "react";
import { Alert, Button, Form, Input, Modal, Select, message } from "antd";
import { useNavigate } from "react-router";
import { ImportVideo } from "../../services/Api/VideoApi";
import { showFieldError } from "../../utils/formErrors";
import { seriesOptions, youtubeErrorMessage } from "./youtube";
import styles from "./Watch.module.scss";
import type { Video, VideoSeries } from "../../types/video";

interface Values {
  url: string;
  series_id?: number;
}

interface AddFromYouTubeProps {
  open: boolean;
  /** Every series, to put the video in one. */
  series: VideoSeries[];
  onClose: () => void;
}

/**
 * Adds one video from its YouTube link, then opens it; a video already here is offered instead. Mount it afresh for
 * each opening, so it starts blank.
 */
const AddFromYouTube = ({ open, series, onClose }: AddFromYouTubeProps) => {
  const navigate = useNavigate();
  const [form] = Form.useForm<Values>();
  const [adding, setAdding] = useState(false);
  // The video the link points at, when it was already here.
  const [existing, setExisting] = useState<Video | null>(null);

  const add = async ({ url, series_id }: Values) => {
    try {
      setAdding(true);
      setExisting(null);
      const res = await ImportVideo({ url: url.trim(), series_id });
      const { created, video } = res.data.data;
      if (created) {
        message.success(`"${video.title}" added. Set its people and topics here.`);
        navigate(`/watch/videos/${video.id}`);
      } else {
        setExisting(video);
      }
    } catch (err) {
      message.error(showFieldError(form, err) || youtubeErrorMessage(err, "Couldn't add the video"));
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal
      title="Add a video from YouTube"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Add video"
      confirmLoading={adding}
    >
      <p className={styles.hint}>
        A public video comes in published, with YouTube's title, description, thumbnail and length. Its people and
        topics are set on the next screen.
      </p>
      <Form form={form} layout="vertical" onFinish={add} onValuesChange={() => setExisting(null)}>
        <Form.Item
          name="url"
          label="YouTube link"
          rules={[{ required: true, whitespace: true, message: "Paste the video's YouTube link" }]}
        >
          <Input placeholder="https://www.youtube.com/watch?v=…" autoFocus />
        </Form.Item>
        <Form.Item name="series_id" label="Series" extra="Optional.">
          <Select allowClear placeholder="No series" options={seriesOptions(series)} />
        </Form.Item>
      </Form>
      {existing && (
        <Alert
          type="info"
          showIcon
          title={`"${existing.title}" is already here`}
          description="Adding its link again changes nothing, its series included."
          action={
            <Button size="small" type="primary" onClick={() => navigate(`/watch/videos/${existing.id}`)}>
              Open it
            </Button>
          }
        />
      )}
    </Modal>
  );
};

export default AddFromYouTube;
