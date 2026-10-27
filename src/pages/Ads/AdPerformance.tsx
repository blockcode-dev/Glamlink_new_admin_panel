import React, { useEffect, useState } from "react";
import { Col, Row, Statistic, Table, message, type TableColumnsType } from "antd";
import dayjs from "dayjs";
import DateRangeFilter, { lastDays, rangeParams, type DateRange } from "../../components/DateRangeFilter";
import { GetAdDaily } from "../../services/Api/AdApi";
import type { AdDaily } from "../../types/ads";
import styles from "./ViewAd.module.scss";

type Day = AdDaily["days"][number];

const clickRate = (impressions: number, clicks: number) =>
  impressions ? `${Math.round((clicks / impressions) * 10000) / 100}%` : "-";

/** One ad's views and clicks on the website, in total and by day. A view counts once the ad is half in view. */
const AdPerformance = ({ adId }: { adId: number | string }) => {
  const [range, setRange] = useState<DateRange | null>(() => lastDays(30));
  const [stats, setStats] = useState<AdDaily | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let current = true;
    setLoading(true);
    GetAdDaily(adId, rangeParams(range))
      .then((res) => {
        if (current) setStats(res.data.data);
      })
      .catch((err) => {
        console.error("Error loading the ad's counts:", err);
        if (current) message.error("Couldn't load this ad's views and clicks");
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [adId, range]);

  const columns: TableColumnsType<Day> = [
    { title: "Day", dataIndex: "day", render: (day: string) => dayjs(day).format("ddd, MMM D, YYYY") },
    { title: "Views", dataIndex: "impressions", align: "right" },
    { title: "Clicks", dataIndex: "clicks", align: "right" },
    { title: "Click rate", key: "rate", align: "right", render: (_, d) => clickRate(d.impressions, d.clicks) },
  ];

  return (
    <div className={styles.sectionCard} style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <h4 style={{ margin: 0 }}>Performance</h4>
        <DateRangeFilter value={range} onChange={setRange} allowAllTime />
      </div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={8}>
          <Statistic title="Views" value={stats?.impressions ?? 0} loading={loading} />
        </Col>
        <Col xs={8}>
          <Statistic title="Clicks" value={stats?.clicks ?? 0} loading={loading} />
        </Col>
        <Col xs={8}>
          <Statistic
            title="Click rate"
            value={stats ? clickRate(stats.impressions, stats.clicks) : "-"}
            loading={loading}
          />
        </Col>
      </Row>
      <Table
        columns={columns}
        // Newest day first; days without views or clicks aren't listed.
        dataSource={[...(stats?.days ?? [])].reverse()}
        rowKey="day"
        size="small"
        loading={loading}
        pagination={{ pageSize: 14, showSizeChanger: false, hideOnSinglePage: true }}
        locale={{ emptyText: "No views or clicks on these days" }}
      />
    </div>
  );
};

export default AdPerformance;
