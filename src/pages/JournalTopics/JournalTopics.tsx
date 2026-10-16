/** @format */

import React, { useEffect, useState } from "react";
import { Table, Button, Input, Modal, Tag, Tooltip, message, type TableColumnsType } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagsOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";

import {
  GetAllJournalTopics,
  DeleteJournalTopic,
} from "../../services/Api/JournalApi";

import styles from "./JournalTopics.module.scss";
import { apiErrorMessage } from "../../utils/apiError";
import type { JournalTopic } from "../../types/journal";

const { Search } = Input;

// Strips HTML tags from the rich-text description so the table shows
// plain text instead of raw markup like "<p>...</p>".
const stripHtml = (html: unknown) =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const JournalTopics = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<JournalTopic[]>([]);
  const [filteredData, setFilteredData] = useState<JournalTopic[]>([]);

  const [loading, setLoading] = useState(false);

  const getData = async () => {
    try {
      setLoading(true);

      const result = await GetAllJournalTopics();

      const rows = Array.isArray(result?.data?.data)
        ? result.data.data
        : result?.data?.data?.rows || result?.data?.rows || [];

      setData(rows);
      setFilteredData(rows);
    } catch (error) {
      console.error(error);
      message.error("Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleSearch = (value: string) => {
    const search = value.trim().toLowerCase();

    if (!search) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((item) => {
      const name = String(item.name || "").toLowerCase();
      const description = stripHtml(item.description || "").toLowerCase();

      return (
        name.includes(search) ||
        description.includes(search)
      );
    });

    setFilteredData(filtered);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Delete Topic",
      icon: <TagsOutlined />,
      content: "Are you sure you want to delete this topic?",
      okText: "Delete",
      okButtonProps: {
        danger: true,
      },
      cancelText: "Cancel",

      onOk: async () => {
        try {
          await DeleteJournalTopic([id]);

          message.success("Topic deleted successfully");

          await getData();
        } catch (error) {
          console.error(error);

          message.error(
            apiErrorMessage(error) ||
              "Failed to delete topic",
          );
        }
      },
    });
  };

  const columns: TableColumnsType<JournalTopic> = [
    {
      title: "#",
      width: 60,
      render: (_, __, index) => index + 1,
    },

    {
      title: "Topic",
      dataIndex: "name",
      width: 300,
      render: (text) => (
        <div className={styles.topicName}>
          <Tag color="blue">{text || "-"}</Tag>
        </div>
      ),
    },

    {
      title: "Description",
      dataIndex: "description",
      width: 450,
      render: (text) => {
        const plain = stripHtml(text);

        return (
          <div
            style={{
              maxWidth: 430,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {plain || "-"}
          </div>
        );
      },
    },

    {
      title: "Status",
      dataIndex: "is_active",
      width: 110,
      align: "center",
      render: (active) => (
        <Tag color={active ? "green" : "default"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },

    {
      title: "Action",
      width: 160,
      align: "center",
      render: (_, record) => (
        <div className={styles.actionButtons}>
          {/* Edit */}
          <Tooltip title="Edit Topic">
            <button
              type="button"
              className={`${styles.iconButton} ${styles.iconButtonEdit}`}
              onClick={() =>
                navigate(`/journal-topics/edit/${record.id}`)
              }
            >
              <EditOutlined />
            </button>
          </Tooltip>

          {/* Manage Topic */}
          <Tooltip title="Manage Topic">
            <button
              type="button"
              className={`${styles.iconButton} ${styles.iconButtonEdit}`}
              onClick={() =>
                navigate(`/journal-topics/${record.id}`)
              }
            >
              <SettingOutlined />
            </button>
          </Tooltip>

          {/* Delete */}
          <Tooltip title="Delete Topic">
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
      {/* HEADER */}
      <div className={styles.headerCard}>
        <div>
          <h3 className={styles.headerTitle}>Journal Topics</h3>

          <p className={styles.headerSubtitle}>
            Manage reusable topics and tags for Journal articles.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Search
            placeholder="Search topic..."
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 280 }}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/journal-topics/add")}
          >
            Add Topic
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className={styles.tableCard}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{
            pageSize: 20,
            showSizeChanger: false,
          }}
        />
      </div>
    </div>
  );
};

export default JournalTopics;