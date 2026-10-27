import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Alert, Button, DatePicker, Empty, Segmented, Spin, Table, message, type TableColumnsType } from "antd";
import { EditOutlined, ExportOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import PageHeader, { Panel } from "../../components/PageHeader";
import { GetPageAnalytics } from "../../services/Api/ProfilesApi";
import { apiErrorMessage, apiErrorStatus } from "../../utils/apiError";
import type { PageAnalytics } from "../../types/profile";
import DailyChart from "./DailyChart";
import {
  DATE_FORMAT,
  clickCounts,
  clickLabel,
  deviceLabel,
  fillDays,
  isWebLink,
  rangeParams,
  targetText,
  type DayCounts,
} from "./analytics";
import { publicPageUrl, usePageRouteState } from "./pageStatus";
import styles from "./ProfilePages.module.scss";

const { RangePicker } = DatePicker;

type Range = [Dayjs, Dayjs];
type Target = PageAnalytics["top_targets"][number];

const lastDays = (count: number): Range => [dayjs().subtract(count - 1, "day"), dayjs()];

// Worked out when picked, so they stay right past midnight.
const PRESETS = [7, 30, 90].map((n) => ({ label: `Last ${n} days`, value: () => lastDays(n) }));

const count = (n: number) => n.toLocaleString("en-US");

const Tile = ({ label, value, note }: { label: string; value: number; note: string }) => (
  <div className={styles.tile}>
    <div className={styles.tileLabel}>{label}</div>
    <div className={styles.tileValue}>{count(value)}</div>
    <div className={styles.tileNote}>{note}</div>
  </div>
);

interface Bar {
  key: string;
  label: string;
  value: number;
  /** The bar's length, 0 to 1. */
  share: number;
  text: string;
}

/** Counts as bars on one scale: clicks coral, views blue, as in the chart. */
const Bars = ({ rows, clicks = false }: { rows: Bar[]; clicks?: boolean }) => (
  <ul className={`${styles.bars} ${clicks ? styles.clickBars : ""}`}>
    {rows.map((row) => (
      <li key={row.key} className={`${styles.barRow} ${row.value ? "" : styles.zero}`}>
        <span>{row.label}</span>
        <span className={styles.barTrack}>
          <span className={styles.barFill} style={{ width: `${row.share * 100}%` }} />
        </span>
        <span className={styles.barValue}>{row.text}</span>
      </li>
    ))}
  </ul>
);

const dayColumns: TableColumnsType<DayCounts> = [
  { title: "Day", dataIndex: "date", render: (date: string) => dayjs(date).format("ddd, MMM D, YYYY") },
  { title: "Views", dataIndex: "views", align: "right", render: count },
  { title: "Clicks", dataIndex: "clicks", align: "right", render: count },
];

const targetColumns: TableColumnsType<Target> = [
  { title: "Clicked", key: "type", width: 150, render: (_, t) => clickLabel(t.event_type) },
  {
    title: "Target",
    key: "target",
    render: (_, t) =>
      isWebLink(t.event_target) ? (
        <a href={t.event_target} target="_blank" rel="noopener noreferrer nofollow" className={styles.target}>
          {t.event_target}
        </a>
      ) : (
        <span className={styles.target}>{targetText(t)}</span>
      ),
  },
  { title: "Clicks", dataIndex: "count", width: 100, align: "right", render: count },
];

const AnalyticsScreen = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const routeState = usePageRouteState();
  const validId = /^\d+$/.test(userId);
  const [range, setRange] = useState<Range>(() => lastDays(30));
  const [data, setData] = useState<PageAnalytics | null>(null);
  const [loading, setLoading] = useState(validId);
  const [notFound, setNotFound] = useState(!validId);
  const [daily, setDaily] = useState<"chart" | "table">("chart");

  const from = range[0].format(DATE_FORMAT);
  const to = range[1].format(DATE_FORMAT);

  useEffect(() => {
    if (!validId) return;
    let current = true;
    setLoading(true);
    const [fromParam, toParam] = rangeParams(dayjs(from), dayjs(to));
    GetPageAnalytics(userId, fromParam, toParam)
      .then((res) => {
        if (current) setData(res.data.data);
      })
      .catch((err) => {
        if (!current) return;
        console.error("Error loading page analytics:", err);
        if (apiErrorStatus(err) === 404) setNotFound(true);
        else message.error(apiErrorMessage(err) || "Couldn't load the numbers");
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [validId, userId, from, to]);

  const days = useMemo(() => (data ? fillDays(data) : []), [data]);
  const back = routeState.from ?? "/pages";

  if (notFound) {
    return (
      <div>
        <PageHeader title="Page analytics" back={back} />
        <Panel>
          <Empty description="No page for this account. Only active professional and brand accounts have one." />
        </Panel>
      </div>
    );
  }

  const summary = data?.summary ?? { total_views: 0, unique_visitors: 0, total_clicks: 0 };
  const clicks = data ? clickCounts(data.events) : [];
  const mostClicks = Math.max(1, ...clicks.map((c) => c.count));
  const devices = data?.device_breakdown ?? [];
  const deviceViews = devices.reduce((sum, d) => sum + d.count, 0);
  const anything = days.some((d) => d.views || d.clicks);

  return (
    <div>
      <PageHeader
        title={data?.page.name || `Account #${userId}`}
        subtitle="Page analytics: views of the page and clicks on its links, as the owner sees them in their dashboard."
        back={back}
        extra={
          <>
            <RangePicker
              value={range}
              allowClear={false}
              format="MMM D, YYYY"
              presets={PRESETS}
              disabledDate={(day) => day.isAfter(dayjs(), "day")}
              onChange={(dates) => {
                if (dates?.[0] && dates[1]) setRange([dates[0], dates[1]]);
              }}
            />
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/pages/${userId}`, { state: { claimed: routeState.claimed, from: routeState.from } })}
            >
              Edit page
            </Button>
            {data?.page.visible && data.page.slug && (
              <Button icon={<ExportOutlined />} href={publicPageUrl(data.page.slug)} target="_blank" rel="noopener noreferrer">
                View on site
              </Button>
            )}
          </>
        }
      />

      {data && !data.page.visible && (
        <Alert
          type="info"
          showIcon
          title="This page is hidden from the website, so it gets no new views or clicks."
          className={styles.block}
        />
      )}

      {/* While a new range loads, the last numbers stay in view, dimmed. */}
      <Spin spinning={loading}>
        <div className={styles.tiles}>
          <Tile label="Views" value={summary.total_views} note="Times the page was shown" />
          <Tile label="Unique visitors" value={summary.unique_visitors} note="Told apart by an id kept in each browser" />
          <Tile label="Clicks" value={summary.total_clicks} note="On its links, products, email and phone" />
        </div>

        <Panel>
          <div className={styles.panelBody}>
            <div className={styles.panelHead}>
              <h4 className={styles.panelTitle}>Views and clicks by day</h4>
              <Segmented<"chart" | "table">
                size="small"
                options={[
                  { label: "Chart", value: "chart" },
                  { label: "Table", value: "table" },
                ]}
                value={daily}
                onChange={setDaily}
              />
            </div>
            {!anything ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No views or clicks in these dates" />
            ) : daily === "chart" ? (
              <DailyChart days={days} />
            ) : (
              <Table<DayCounts>
                rowKey="date"
                size="small"
                columns={dayColumns}
                dataSource={days}
                pagination={{ pageSize: 31, hideOnSinglePage: true, showSizeChanger: false }}
              />
            )}
          </div>
        </Panel>

        <div className={styles.columns}>
          <Panel>
            <div className={styles.panelBody}>
              <div className={styles.panelHead}>
                <h4 className={styles.panelTitle}>Clicks by type</h4>
              </div>
              <Bars
                clicks
                rows={clicks.map((c) => ({
                  key: c.type,
                  label: c.label,
                  value: c.count,
                  share: c.count / mostClicks,
                  text: count(c.count),
                }))}
              />
            </div>
          </Panel>
          <Panel>
            <div className={styles.panelBody}>
              <div className={styles.panelHead}>
                <h4 className={styles.panelTitle}>Views by device</h4>
              </div>
              {deviceViews ? (
                <Bars
                  rows={devices.map((d) => ({
                    key: d.device_type ?? "unknown",
                    label: deviceLabel(d.device_type),
                    value: d.count,
                    share: d.count / deviceViews,
                    text: `${count(d.count)} · ${Math.round((d.count / deviceViews) * 100)}%`,
                  }))}
                />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No views in these dates" />
              )}
            </div>
          </Panel>
        </div>

        <Panel>
          <div className={styles.panelBody}>
            <div className={styles.panelHead}>
              <h4 className={styles.panelTitle}>Most clicked</h4>
              <span className={styles.muted}>The 10 links and products clicked most</span>
            </div>
            <Table<Target>
              rowKey={(t) => `${t.event_type}:${t.event_target}`}
              size="small"
              columns={targetColumns}
              dataSource={data?.top_targets ?? []}
              pagination={false}
              locale={{ emptyText: "No clicks on links or products in these dates" }}
            />
          </div>
        </Panel>
      </Spin>
    </div>
  );
};

/**
 * A page's numbers (route /pages/:userId/analytics), as its owner sees them in the dashboard: views, unique visitors
 * and clicks for a date range, by day, by kind of click and by device, and the most clicked links and products.
 * Another account's id starts a fresh screen.
 */
const ProfilePageAnalytics = () => {
  const { userId = "" } = useParams();
  return <AnalyticsScreen key={userId} userId={userId} />;
};

export default ProfilePageAnalytics;
