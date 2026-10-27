/** @format */

import React, { useEffect, useState } from "react";
import { Table, message, Input, Tag, Tooltip, Modal, type TableColumnsType } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import {
  GetAllPartnershipInquiries,
  DeletePartnershipInquiry,
} from "../../services/Api/PartnershipApi";
import styles from "./PartnerInquiries.module.scss";
import type { PartnershipInquiry } from "../../types/content";

const { Search } = Input;

const interestColor: Record<string, string> = {
  Podcast: "geekblue",
  "Brand Partnership": "purple",
  Events: "cyan",
};

const PartnerInquiries = () => {
  const [data, setData] = useState<PartnershipInquiry[]>([]);
  const [backupData, setBackupData] = useState<PartnershipInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getData = async () => {
    try {
      setLoading(true);
      const result = await GetAllPartnershipInquiries();
      const list = result?.data;
      const newData = (Array.isArray(list) ? list : list?.rows) || [];
      setData(newData);
      setBackupData(newData);
    } catch (err) {
      message.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const onSearch = (value: string) => {
    const q = value.toLowerCase();
    const filtered = backupData.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.company_brand?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q),
    );
    setData(filtered);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Delete Inquiry",
      content: "Are you sure you want to delete this inquiry?",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await DeletePartnershipInquiry(id);
          message.success("Inquiry deleted successfully");
          setData((prev) => prev.filter((item) => item.id !== id));
          setBackupData((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
          message.error("Failed to delete inquiry");
        }
      },
    });
  };

  const columns: TableColumnsType<PartnershipInquiry> = [
    {
      title: "Name / Brand",
      key: "name",
      width: 200,
      fixed: "left",
      render: (_, record) => (
        <div>
          <div className={styles.primaryCell}>{record.name}</div>
          <div className={styles.subText}>{record.company_brand || "-"}</div>
        </div>
      ),
    },

    {
      title: "Contact",
      key: "contact",
      width: 220,
      render: (_, record) => (
        <div>
          <a href={`mailto:${record.email}`} className={styles.linkText}>
            {record.email}
          </a>
          {record.website_instagram ? (
            <div
              className={styles.subLink}
              onClick={() => window.open(record.website_instagram ?? undefined, "_blank")}
            >
              {record.website_instagram.replace(/^https?:\/\/(www\.)?/, "")}
            </div>
          ) : (
            <div className={styles.subText}>-</div>
          )}
        </div>
      ),
    },

    {
      title: "Interested In",
      dataIndex: "interested_in",
      width: 190,
      render: (items: PartnershipInquiry["interested_in"]) => (
        <div className={styles.pagesCell}>
          {Array.isArray(items) && items.length ? (
            items.map((item) => (
              <Tag
                key={item}
                color={interestColor[item] || "default"}
                style={{ borderRadius: 20, marginBottom: 4 }}
              >
                {item}
              </Tag>
            ))
          ) : (
            <span>-</span>
          )}
        </div>
      ),
    },

    {
      title: "Message",
      dataIndex: "message",
      width: 260,
      render: (text) => (
        <Tooltip title={text} placement="topLeft">
          <div className={styles.messageCell}>{text || "-"}</div>
        </Tooltip>
      ),
    },

    {
      title: "Received",
      dataIndex: "created_at",
      width: 130,
      render: (date) => (
        <div>
          <div className={styles.scheduleDate}>
            {dayjs(date).format("MMM DD, YYYY")}
          </div>
          <div className={styles.subText}>{dayjs(date).format("hh:mm A")}</div>
        </div>
      ),
    },

    {
      title: "Action",
      key: "action",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <div className={styles.actionButtons}>
          <Tooltip title="View Inquiry">
            <button
              type="button"
              className={`${styles.iconButton} ${styles.iconButtonView}`}
              onClick={() => navigate(`/view-partner-inquiry/${record.id}`)}
            >
              <EyeOutlined />
            </button>
          </Tooltip>

          <Tooltip title="Delete Inquiry">
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
          <h3 className={styles.headerTitle}>Partner With Us</h3>
          <p className={styles.headerSubtitle}>
            Partnership inquiries submitted from the website.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Search
            placeholder="Search by name, brand or email..."
            allowClear
            onChange={(e) => onSearch(e.target.value)}
            style={{ width: 280 }}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 50,
            showSizeChanger: false,
          }}
        />
      </div>
    </div>
  );
};

export default PartnerInquiries;