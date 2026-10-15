/** @format */

import React, { useEffect, useState } from "react";
import { Table, message, Button, Input, Tag, Tooltip, Modal } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Box } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import { GetAllAds, DeleteAd } from "../../services/Api/AdApi";
import moment from "moment";
import styles from "./AdsList.module.scss";

const { Search } = Input;

const behaviourLabel = {
  static: "Static",
  sticky: "Sticky (scroll)",
  "fixed-overlay": "Fixed overlay",
};

const Ads = () => {
  const [data, setData] = useState([]);
  const [backupData, setBackupData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getData = async () => {
    try {
      setLoading(true);
      const result = await GetAllAds();

      const newData = result.data.rows || result.data || [];

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

  const onSearch = (value) => {
    const filtered = backupData.filter((item) =>
      item.slot_id.toLowerCase().includes(value.toLowerCase()),
    );
    setData(filtered);
  };

  const handleDelete = (id) => {
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

  const columns = [
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
              ? moment(record.start_date).format("DD/MM/YY")
              : "No start"}{" "}
            -{" "}
            {record.end_date
              ? moment(record.end_date).format("DD/MM/YY")
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
    <Box className={styles.page}>
      <div className={styles.headerCard}>
        <div>
          <h3 className={styles.headerTitle}>Ads</h3>
          <p className={styles.headerSubtitle}>
            Manage banner and sidebar ads shown on the journal pages.
          </p>
        </div>

        <div className={styles.headerActions}>
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
          scroll={{ x: 826 }}
          pagination={{
            pageSize: 50,
            showSizeChanger: false,
          }}
        />
      </div>
    </Box>
  );
};

export default Ads;
