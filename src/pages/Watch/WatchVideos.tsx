import React, { useEffect, useState } from "react";
import { Button, Input, Select, Space, Table, Tag, Tooltip, message, type TableColumnsType } from "antd";
import { CloudDownloadOutlined, EditOutlined, ExportOutlined, YoutubeOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router";
import dayjs from "dayjs";
import PageHeader, { Panel } from "../../components/PageHeader";
import { GetAllSeries, GetVideos, ImportPlaylists } from "../../services/Api/VideoApi";
import { websiteUrl } from "../../utils/website";
import AddFromYouTube from "./AddFromYouTube";
import {
  SOURCES,
  STATUSES,
  formatDuration,
  playlistImportMessage,
  seriesOptions,
  youtubeErrorMessage,
  youtubeUrl,
} from "./youtube";
import styles from "./Watch.module.scss";
import type { VideoRow, VideoSeries, VideoSource, VideoStatus } from "../../types/video";

const PAGE_SIZE = 50;

interface Filters {
  page: number;
  search: string;
  status?: VideoStatus;
  /** A series' id. */
  series?: number;
}

/** Every video of the Watch page and the podcast, drafts too, with adding one by link and importing the playlists. */
const WatchVideos = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // The series screen links here with ?series=<id>.
  const [filters, setFilters] = useState<Filters>(() => ({
    page: 1,
    search: "",
    series: Number(params.get("series")) || undefined,
  }));
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState<VideoRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState<VideoSeries[]>([]);
  const [importing, setImporting] = useState(false);
  // `opening` counts openings: each one mounts a new "Add from YouTube", which still closes with its animation.
  const [adding, setAdding] = useState({ open: false, opening: 0 });

  useEffect(() => {
    GetAllSeries()
      .then((res) => setSeries(res.data.data))
      .catch((err) => console.error("Error loading the video series:", err));
  }, []);

  // One request per change of filters; the answer to a superseded one is dropped.
  useEffect(() => {
    let current = true;
    const { page, search, status, series: seriesId } = filters;
    setLoading(true);
    GetVideos({ page, limit: PAGE_SIZE, search: search || undefined, status, series: seriesId })
      .then((res) => {
        if (!current) return;
        setRows(res.data.data.rows);
        setTotal(res.data.data.count);
      })
      .catch((err) => {
        console.error("Error loading the videos:", err);
        if (current) message.error("Couldn't load the videos");
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [filters]);

  // The list follows the search box 300 ms after the last key, from the first page.
  useEffect(() => {
    const timer = setTimeout(() => {
      const search = searchText.trim();
      setFilters((f) => (f.search === search ? f : { ...f, search, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  // New uploads reach the website only through this: the API doesn't check YouTube on its own.
  const importPlaylists = async () => {
    try {
      setImporting(true);
      const res = await ImportPlaylists();
      const report = res.data.data;
      const { type, text } = playlistImportMessage(report, (slug) => series.find((s) => s.slug === slug)?.name ?? slug);
      message[type](text);
      if (report.imported) setFilters((f) => ({ ...f }));
    } catch (err) {
      message.error(youtubeErrorMessage(err, "Couldn't import the playlists"));
    } finally {
      setImporting(false);
    }
  };

  const columns: TableColumnsType<VideoRow> = [
    {
      title: "Video",
      dataIndex: "thumbnail",
      width: 120,
      render: (thumbnail: string | null, row) => (
        <a
          href={youtubeUrl(row.youtube_id)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Watch ${row.title} on YouTube`}
        >
          {thumbnail ? <img src={thumbnail} alt="" className={styles.thumb} /> : <div className={styles.noThumb} />}
        </a>
      ),
    },
    {
      title: "Title",
      key: "title",
      render: (_, row) => (
        <div>
          <div className={styles.title}>{row.title}</div>
          <div className={styles.sub}>
            /watch/{row.slug}
            {row.published_at && ` · on YouTube ${dayjs(row.published_at).format("MMM D, YYYY")}`}
          </div>
        </div>
      ),
    },
    {
      title: "Series",
      key: "series",
      width: 170,
      render: (_, row) => row.series?.name ?? <span className={styles.muted}>None</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 110,
      render: (status: VideoStatus) =>
        status === "published" ? <Tag color="green">Published</Tag> : <Tag>Draft</Tag>,
    },
    {
      title: "Source",
      dataIndex: "source",
      width: 140,
      render: (source: VideoSource) => (
        <Tooltip title={SOURCES[source]?.hint}>
          <Tag color={source === "sync" ? "geekblue" : "purple"}>{SOURCES[source]?.label ?? source}</Tag>
        </Tooltip>
      ),
    },
    {
      title: "Featured",
      dataIndex: "is_featured",
      width: 100,
      render: (featured: boolean) => (featured ? <Tag color="gold">Featured</Tag> : null),
    },
    {
      title: "Length",
      dataIndex: "duration_seconds",
      width: 90,
      align: "right",
      render: (seconds: number | null) =>
        seconds == null ? <span className={styles.muted}>-</span> : formatDuration(seconds),
    },
    {
      title: "",
      key: "action",
      width: 100,
      align: "center",
      render: (_, row) => (
        <Space size={4}>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              aria-label={`Edit ${row.title}`}
              onClick={() => navigate(`/watch/videos/${row.id}`)}
            />
          </Tooltip>
          <Tooltip title={row.status === "published" ? "View on site" : "Drafts aren't on the site"}>
            <Button
              type="text"
              icon={<ExportOutlined />}
              aria-label={`View ${row.title} on the site`}
              href={websiteUrl(`/watch/${row.slug}`)}
              target="_blank"
              rel="noopener noreferrer"
              disabled={row.status !== "published"}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Videos"
        subtitle={
          `The Watch page's videos and the podcast's episodes, drafts too${total ? ` (${total})` : ""}. ` +
          "New YouTube uploads come in only when you import the playlists."
        }
        extra={
          <>
            <Input.Search
              placeholder="Search titles"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="All series"
              allowClear
              value={filters.series}
              onChange={(seriesId?: number) => setFilters((f) => ({ ...f, series: seriesId, page: 1 }))}
              options={seriesOptions(series)}
              style={{ width: 190 }}
            />
            <Select
              placeholder="Any status"
              allowClear
              value={filters.status}
              onChange={(status?: VideoStatus) => setFilters((f) => ({ ...f, status, page: 1 }))}
              options={STATUSES}
              style={{ width: 130 }}
            />
            <Button icon={<YoutubeOutlined />} onClick={() => setAdding((a) => ({ open: true, opening: a.opening + 1 }))}>
              Add from YouTube
            </Button>
            <Button icon={<CloudDownloadOutlined />} loading={importing} onClick={importPlaylists}>
              Import playlists
            </Button>
          </>
        }
      />
      <Panel>
        <Table
          columns={columns}
          dataSource={rows}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 1000 }}
          pagination={{
            current: filters.page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            onChange: (page) => setFilters((f) => ({ ...f, page })),
          }}
        />
      </Panel>
      {adding.opening > 0 && (
        <AddFromYouTube
          key={adding.opening}
          open={adding.open}
          series={series}
          onClose={() => setAdding((a) => ({ ...a, open: false }))}
        />
      )}
    </div>
  );
};

export default WatchVideos;
