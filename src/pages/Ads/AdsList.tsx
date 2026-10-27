/** @format */

import React, { useEffect, useState } from "react";
import { Table, message, Button, Input, Tag, Tooltip, Modal, type TableColumnsType } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { GetAllAds, DeleteAd, GetAdTotals } from "../../services/Api/AdApi";
import dayjs from "dayjs";
import styles from "./AdsList.module.scss";
import DateRangeFilter, { lastDays, rangeParams, type DateRange } from "../../components/DateRangeFilter";
import type { Ad, AdTotals } from "../../types/ads";

const { Search } = Input;

const behaviourLabel: Record<string, string> = {
  static: "Static",
  sticky: "Sticky (scroll)",
  "fixed-overlay": "Fixed overlay",
};

const Ads = () => {
  const [data, setData] = useState<Ad[]>([]);
  const [backupData, setBackupData] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  // Views and clicks per ad for the chosen days; null range = all time.
  const [range, setRange] = useState<DateRange | null>(() => lastDays(30));
  const [totals, setTotals] = useState<Map<number, AdTotals>>(new Map());
  const navigate = useNavigate();

  const getData = async () => {
    try {
      setLoading(true);
      const result = await GetAllAds();

      const list = result.data;
      const newData = (Array.isArray(list) ? list : list?.rows) || [];

      setData(newData);
      setBackupData(newData);
    } catch (err) {
      message.error("Failed to load ads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    let current = true;
    GetAdTotals(rangeParams(range))
      .then((res) => {
        if (current) setTotals(new Map(res.data.data.map((row) => [row.ad_id, row])));
      })
      .catch((err) => {
        console.error("Error loading ad counts:", err);
        if (current) message.error("Couldn't load the ads' views and clicks");
      });
    return () => {
      current = false;
    };
  }, [range]);

  const onSearch = (value: string) => {
    const filtered = backupData.filter((item) =>
      item.slot_id.toLowerCase().includes(value.toLowerCase()),
    );
    setData(filtered);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Delete Ad",
      content: "Are you sure you want to delete this ad?",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await DeleteAd([id]); // send as array
          message.success("Ad deleted successfully");
          getData();
        } catch (err) {
          message.error("Failed to delete Ad");
        }
      },
    });
  };

  const columns: TableColumnsType<Ad> = [
    {
      title: "Media",
      dataIndex: "image_url",
      width: 76,
      align: "center",
      fixed: "left",
      render: (img, record) =>
        img ? (
          record.media_type === "video" ? (
            <video src={img} className={styles.adThumb} muted />
          ) : (
            <img src={img} alt="ad" className={styles.adThumb} />
          )
        ) : (
          <div className={styles.adThumbEmpty}>No media</div>
        ),
    },

    {
      title: "Slot ID",
      dataIndex: "slot_id",
      width: 160,
      render: (text, record) => (
        <div>
          <div className={styles.slotCell}>{text}</div>
          <div className={styles.sizeText}>
            {record.width} x{" "}
            {record.height && record.height !== "null" ? record.height : "auto"}
          </div>
        </div>
      ),
    },

    {
      title: "Type / Behaviour",
      key: "type-behaviour",
      width: 140,
      render: (_, record) => (
        <div className={styles.stackTags}>
          <Tag color={record.media_type === "video" ? "geekblue" : "default"}>
            {record.media_type === "video" ? "Video" : "Image"}
          </Tag>
          <Tag color="purple">
            {behaviourLabel[record.behaviour] || record.behaviour}
          </Tag>
        </div>
      ),
    },

    {
      title: "Pages",
      dataIndex: "pages",
      width: 170,
      render: (pages) => (
        <div className={styles.pagesCell}>
          {Array.isArray(pages) && pages.length ? (
            pages.map((page) => (
              <Tag key={page} style={{ borderRadius: 20, marginBottom: 4 }}>
                {page}
              </Tag>
            ))
          ) : (
            <span>-</span>
          )}
        </div>
      ),
    },

    {
      title: "Views / Clicks",
      key: "performance",
      width: 150,
      sorter: (a, b) => (totals.get(a.id)?.impressions ?? 0) - (totals.get(b.id)?.impressions ?? 0),
      render: (_, record) => {
        const counts = totals.get(record.id);
        if (!counts) return <span className={styles.sizeText}>No views</span>;
        return (
          <div>
            <div>
              {counts.impressions.toLocaleString()} / {counts.clicks.toLocaleString()}
            </div>
            <div className={styles.sizeText}>
              {counts.click_rate === null ? "No views" : `${counts.click_rate}% click rate`}
            </div>
          </div>
        );
      },
    },

    {
      title: "Status / Schedule",
      key: "status-schedule",
      width: 160,
      render: (_, record) => (
        <div>
          <Tag
            color={record.status === "active" ? "green" : "red"}
            style={{
              fontWeight: 600,
              textTransform: "capitalize",
              borderRadius: 20,
              marginBottom: 4,
            }}
          >
            {record.status}
          </Tag>
          <div className={styles.scheduleDate}>
            {record.start_date
              ? dayjs(record.start_date).format("DD/MM/YY")
              : "No start"}{" "}
            -{" "}
            {record.end_date
              ? dayjs(record.end_date).format("DD/MM/YY")
              : "No end"}
          </div>
        </div>
      ),
    },

    {
      title: "Action",
      key: "action",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <div className={styles.actionButtons}>
          <Tooltip title="View Ad">
            <button
              type="button"
              className={`${styles.iconButton} ${styles.iconButtonView}`}
              onClick={() => navigate(`/view-ad/${record.id}`)}
            >
              <EyeOutlined />
            </button>
          </Tooltip>

          <Tooltip title="Edit Ad">
            <button
              type="button"
              className={`${styles.iconButton} ${styles.iconButtonEdit}`}
              onClick={() => navigate(`/edit-ad/${record.id}`)}
            >
              <EditOutlined />
            </button>
          </Tooltip>

          <Tooltip title="Delete Ad">
            <button
              type="button"
              className={`${styles.iconButton} ${styles.iconButtonDanger}`}
              onClick={() => handleDelete(record.id)}
            >
              <DeleteOutlined />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.headerCard}>
        <div>
          <h3 className={styles.headerTitle}>Ads</h3>
          <p className={styles.headerSubtitle}>
            Manage banner and sidebar ads shown on the journal pages.
          </p>
        </div>

        <div className={styles.headerActions}>
          <DateRangeFilter value={range} onChange={setRange} allowAllTime />
          <Search
            placeholder="Search by slot id..."
            allowClear
            onChange={(e) => onSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/add-ad")}
          >
            Add Ad
          </Button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 976 }}
          pagination={{
            pageSize: 50,
            showSizeChanger: false,
          }}
        />
      </div>
    </div>
  );
};

export default Ads;
