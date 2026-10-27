import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  message,
  type TableColumnsType,
} from "antd";
import { EditOutlined, PlaySquareOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import PageHeader, { Panel } from "../../components/PageHeader";
import { CreateSeries, GetAllSeries, UpdateSeries } from "../../services/Api/VideoApi";
import { apiErrorMessage } from "../../utils/apiError";
import { showFieldError } from "../../utils/formErrors";
import { playlistUrl } from "./youtube";
import styles from "./Watch.module.scss";
import type { SeriesFields, VideoSeries } from "../../types/video";

interface SeriesValues {
  name: string;
  slug: string;
  /** An id or a playlist link. */
  playlist_id: string;
  sort_order: number | null;
  is_active: boolean;
}

const NEW_SERIES: SeriesValues = { name: "", slug: "", playlist_id: "", sort_order: 0, is_active: true };

const valuesOf = (series: VideoSeries): SeriesValues => ({
  name: series.name,
  slug: series.slug,
  playlist_id: series.playlist_id ?? "",
  sort_order: series.sort_order,
  is_active: Boolean(series.is_active),
});

interface SeriesModalProps {
  open: boolean;
  /** null to add one. */
  series: VideoSeries | null;
  onClose: () => void;
  onSaved: () => void;
}

/** Adds or edits a series. Mounted afresh for each opening, so its form starts from that series. */
const SeriesModal = ({ open, series, onClose, onSaved }: SeriesModalProps) => {
  const [form] = Form.useForm<SeriesValues>();
  const [saving, setSaving] = useState(false);

  const save = async (values: SeriesValues) => {
    const fields: SeriesFields & { name: string } = {
      name: values.name.trim(),
      // Blank: made from the name on a new series, kept on one being edited (a slug can't be cleared).
      ...(values.slug?.trim() ? { slug: values.slug.trim() } : {}),
      playlist_id: values.playlist_id?.trim() ?? "",
      // Blank keeps the order (0 for a new series).
      ...(values.sort_order != null ? { sort_order: values.sort_order } : {}),
      is_active: values.is_active,
    };
    try {
      setSaving(true);
      if (series) await UpdateSeries(series.id, fields);
      else await CreateSeries(fields);
      message.success(series ? "Series saved" : "Series added");
      onSaved();
    } catch (err) {
      message.error(showFieldError(form, err) || apiErrorMessage(err) || "Couldn't save the series");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={series ? `Edit ${series.name}` : "Add series"}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={series ? "Save" : "Add series"}
      confirmLoading={saving}
    >
      <Form form={form} layout="vertical" initialValues={series ? valuesOf(series) : NEW_SERIES} onFinish={save}>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, whitespace: true, message: "Give the series a name" },
            { max: 100, message: "At most 100 characters" },
          ]}
        >
          <Input placeholder="e.g. Expert Take" />
        </Form.Item>
        <Form.Item
          name="slug"
          label="Slug"
          extra={
            series
              ? "Used in the Watch page's links. The website finds the podcast by its slug (beauty-vault-podcast), so leave existing slugs as they are."
              : "Used in the Watch page's links. Made from the name when left blank."
          }
        >
          <Input placeholder={series ? undefined : "Made from the name"} />
        </Form.Item>
        <Form.Item
          name="playlist_id"
          label="YouTube playlist"
          extra="A playlist link or its id (the list=… part). Blank: nothing is imported for this series."
        >
          <Input placeholder="https://www.youtube.com/playlist?list=…" />
        </Form.Item>
        <Form.Item name="sort_order" label="Sort order" extra="The Watch page shows series lowest first.">
          <InputNumber precision={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="is_active"
          label="Active"
          valuePropName="checked"
          extra="Off: the Watch page leaves the series out and imports skip its playlist."
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

/** The Watch page's series and the YouTube playlist each is filled from. */
const WatchSeries = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<VideoSeries[]>([]);
  const [loading, setLoading] = useState(false);
  // `opening` counts openings: each one mounts a new modal, which still closes with its animation.
  const [modal, setModal] = useState<{ open: boolean; series: VideoSeries | null; opening: number }>({
    open: false,
    series: null,
    opening: 0,
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await GetAllSeries();
      setRows(res.data.data);
    } catch (err) {
      console.error("Error loading the video series:", err);
      message.error("Couldn't load the series");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const open = (series: VideoSeries | null) => setModal((m) => ({ open: true, series, opening: m.opening + 1 }));
  const close = () => setModal((m) => ({ ...m, open: false }));

  const columns: TableColumnsType<VideoSeries> = [
    {
      title: "Name",
      key: "name",
      render: (_, row) => (
        <div>
          <div className={styles.title}>{row.name}</div>
          <div className={styles.sub}>{row.slug}</div>
        </div>
      ),
    },
    {
      title: "YouTube playlist",
      dataIndex: "playlist_id",
      render: (playlist: string | null) =>
        playlist ? (
          <a href={playlistUrl(playlist)} target="_blank" rel="noopener noreferrer">
            {playlist}
          </a>
        ) : (
          <span className={styles.muted}>None: nothing is imported</span>
        ),
    },
    {
      title: "Sort order",
      dataIndex: "sort_order",
      width: 110,
      align: "right",
    },
    {
      title: "On the Watch page",
      dataIndex: "is_active",
      width: 160,
      render: (active: boolean) => (active ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>),
    },
    {
      title: "",
      key: "action",
      width: 100,
      align: "center",
      render: (_, row) => (
        <Space size={4}>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} aria-label={`Edit ${row.name}`} onClick={() => open(row)} />
          </Tooltip>
          <Tooltip title="Its videos">
            <Button
              type="text"
              icon={<PlaySquareOutlined />}
              aria-label={`Videos of ${row.name}`}
              onClick={() => navigate(`/watch/videos?series=${row.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Video series"
        subtitle={
          <>
            The Watch page shows active series, lowest sort order first. "Import playlists" on Videos brings in each
            active series' new YouTube uploads.
          </>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => open(null)}>
            Add series
          </Button>
        }
      />
      <Panel>
        <Table columns={columns} dataSource={rows} rowKey="id" loading={loading} size="middle" pagination={false} />
      </Panel>
      {modal.opening > 0 && (
        <SeriesModal
          key={modal.opening}
          open={modal.open}
          series={modal.series}
          onClose={close}
          onSaved={() => {
            close();
            load();
          }}
        />
      )}
    </div>
  );
};

export default WatchSeries;
