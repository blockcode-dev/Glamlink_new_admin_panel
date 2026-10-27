import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Skeleton,
  Switch,
  Tag,
  message,
} from "antd";
import { ExportOutlined, YoutubeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import PageHeader, { Panel } from "../../components/PageHeader";
import { GetAllSeries, GetVideo, UpdateVideo } from "../../services/Api/VideoApi";
import { GetAllJournalTopics } from "../../services/Api/JournalApi";
import { apiErrorMessage, apiErrorStatus } from "../../utils/apiError";
import { showFieldError } from "../../utils/formErrors";
import { useIdParam } from "../../utils/routing";
import { websiteUrl } from "../../utils/website";
import VideoPeopleForm from "./VideoPeopleForm";
import VideoTopicsForm from "./VideoTopicsForm";
import { SOURCES, STATUSES, formatDuration, seriesOptions, youtubeUrl } from "./youtube";
import styles from "./Watch.module.scss";
import type { JournalTopic } from "../../types/journal";
import type { Video, VideoFields, VideoSeries, VideoStatus } from "../../types/video";

interface DetailsValues {
  title: string;
  slug: string;
  description: string;
  /** "" for none. */
  series_id: number | "";
  status: VideoStatus;
  is_featured: boolean;
  featured_order: number | null;
}

const valuesOf = (video: Video): DetailsValues => ({
  title: video.title,
  slug: video.slug,
  description: video.description ?? "",
  series_id: video.series?.id ?? "",
  status: video.status,
  is_featured: video.is_featured,
  featured_order: video.featured_order,
});

interface DetailsProps {
  video: Video;
  series: VideoSeries[];
  onSaved: (video: Video) => void;
}

/** The video's own fields. Keyed by the video. */
const VideoDetails = ({ video, series, onSaved }: DetailsProps) => {
  const [form] = Form.useForm<DetailsValues>();
  const [saving, setSaving] = useState(false);

  const save = async (values: DetailsValues) => {
    const fields: VideoFields = {
      title: values.title.trim(),
      // Blank keeps the current slug: the API can't clear one.
      ...(values.slug?.trim() ? { slug: values.slug.trim() } : {}),
      description: values.description ?? "",
      series_id: values.series_id ?? "",
      status: values.status,
      is_featured: values.is_featured,
      // Blank keeps the current order.
      ...(values.featured_order != null ? { featured_order: values.featured_order } : {}),
    };
    try {
      setSaving(true);
      const res = await UpdateVideo(video.id, fields);
      form.setFieldsValue(valuesOf(res.data.data));
      message.success("Video saved");
      onSaved(res.data.data);
    } catch (err) {
      message.error(showFieldError(form, err) || apiErrorMessage(err) || "Couldn't save the video");
    } finally {
      setSaving(false);
    }
  };

  const seriesChoices = [{ value: "" as const, label: "No series" }, ...seriesOptions(series)];

  return (
    <Panel>
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Form form={form} layout="vertical" initialValues={valuesOf(video)} onFinish={save}>
            <Form.Item
              name="title"
              label="Title"
              rules={[
                { required: true, whitespace: true, message: "Give the video a title" },
                { max: 255, message: "At most 255 characters" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="slug"
              label="Slug"
              extra="The video's address: /watch/<slug>. Links to the old address stop working when it changes."
            >
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea autoSize={{ minRows: 4, maxRows: 14 }} />
            </Form.Item>
            <Form.Item name="series_id" label="Series" extra="The Watch page's row it shows in.">
              <Select<number | ""> options={seriesChoices} />
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
              extra="Draft takes it off the site. Videos aren't deleted: an imported one would come back with the next import."
            >
              <Radio.Group optionType="button" options={STATUSES} />
            </Form.Item>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="is_featured"
                  label="Featured"
                  valuePropName="checked"
                  extra="Featured videos lead the home page's Watch + Learn row and the Watch page's Featured row."
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="featured_order" label="Featured order" extra="Among featured videos, lowest first.">
                  <InputNumber precision={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <div className={styles.actions}>
              <Button type="primary" htmlType="submit" loading={saving}>
                Save video
              </Button>
            </div>
          </Form>
        </Col>
        <Col xs={24} lg={8}>
          <a href={youtubeUrl(video.youtube_id)} target="_blank" rel="noopener noreferrer" aria-label="Watch on YouTube">
            {video.thumbnail ? (
              <img src={video.thumbnail} alt="" className={styles.preview} />
            ) : (
              <div className={styles.preview} />
            )}
          </a>
          <dl className={styles.facts}>
            <dt>On YouTube</dt>
            <dd>{video.published_at ? dayjs(video.published_at).format("MMM D, YYYY") : "-"}</dd>
            <dt>Length</dt>
            <dd>{video.duration_seconds == null ? "-" : formatDuration(video.duration_seconds)}</dd>
            <dt>Came in</dt>
            <dd>
              <Tag color={video.source === "sync" ? "geekblue" : "purple"}>{SOURCES[video.source]?.label}</Tag>
            </dd>
          </dl>
        </Col>
      </Row>
    </Panel>
  );
};

type Load = "loading" | "ready" | "missing" | "failed";

/** One video (/watch/videos/:id): its fields, its people and its topics, each saved on its own. */
const EditVideo = () => {
  const id = useIdParam();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [load, setLoad] = useState<Load>("loading");
  const [attempt, setAttempt] = useState(0);
  const [series, setSeries] = useState<VideoSeries[]>([]);
  // undefined while loading; null when they couldn't be loaded.
  const [topics, setTopics] = useState<JournalTopic[] | null>();

  useEffect(() => {
    let current = true;
    setLoad("loading");
    GetVideo(id)
      .then((res) => {
        if (!current) return;
        setVideo(res.data.data);
        setLoad("ready");
      })
      .catch((err) => {
        if (!current) return;
        if (apiErrorStatus(err) === 404) {
          setLoad("missing");
          return;
        }
        console.error("Error loading the video:", err);
        message.error(apiErrorMessage(err) || "Couldn't load the video");
        setLoad("failed");
      });
    return () => {
      current = false;
    };
  }, [id, attempt]);

  useEffect(() => {
    GetAllSeries()
      .then((res) => setSeries(res.data.data))
      .catch((err) => console.error("Error loading the video series:", err));
    GetAllJournalTopics()
      .then((res) => {
        const list = res.data.data;
        setTopics((Array.isArray(list) ? list : list?.rows) ?? res.data.rows ?? []);
      })
      .catch((err) => {
        console.error("Error loading the journal topics:", err);
        setTopics(null);
      });
  }, []);

  const published = video?.status === "published";

  return (
    <div>
      <PageHeader
        title={video?.title ?? "Video"}
        subtitle={video ? `${video.series?.name ?? "No series"} · ${published ? "Published" : "Draft"}` : undefined}
        back="/watch/videos"
        extra={
          video && (
            <>
              <Button icon={<YoutubeOutlined />} href={youtubeUrl(video.youtube_id)} target="_blank" rel="noopener noreferrer">
                Watch on YouTube
              </Button>
              <Button
                icon={<ExportOutlined />}
                href={websiteUrl(`/watch/${video.slug}`)}
                target="_blank"
                rel="noopener noreferrer"
                disabled={!published}
                title={published ? undefined : "Drafts aren't on the site"}
              >
                View on site
              </Button>
            </>
          )
        }
      />
      {load === "loading" && (
        <Panel>
          <Skeleton active />
        </Panel>
      )}
      {load === "missing" && (
        <Panel>
          <Empty description="There's no such video.">
            <Button onClick={() => navigate("/watch/videos")}>Back to the videos</Button>
          </Empty>
        </Panel>
      )}
      {load === "failed" && (
        <Panel>
          <Empty description="Couldn't load the video.">
            <Button onClick={() => setAttempt((n) => n + 1)}>Try again</Button>
          </Empty>
        </Panel>
      )}
      {load === "ready" && video && (
        <>
          <VideoDetails key={`details-${video.id}`} video={video} series={series} onSaved={setVideo} />
          <VideoPeopleForm key={`people-${video.id}`} video={video} onSaved={setVideo} />
          {topics === undefined && (
            <Panel>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Panel>
          )}
          {topics === null && (
            <Panel>
              <Empty description="Couldn't load the journal topics, so the video's topics can't be changed now." />
            </Panel>
          )}
          {topics && <VideoTopicsForm key={`topics-${video.id}`} video={video} topics={topics} onSaved={setVideo} />}
        </>
      )}
    </div>
  );
};

export default EditVideo;
