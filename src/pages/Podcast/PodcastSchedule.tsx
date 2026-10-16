// src/pages/PodcastSchedule/index.js

/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, message, Button, Input, Modal, Tag, type TableColumnsType } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import {
  DeletePodcastSchedule,
  GetAllPodcastSchedule,
} from "../../services/Api/PodcastScheduleApi";
import { type WithIndex } from "../../utils/table";
import type { PodcastSchedule } from "../../types/journal";

const { Search } = Input;

const PodcastSchedule = () => {
  const [data, setData] = useState<WithIndex<PodcastSchedule>[]>([]);
  const [backupData, setBackupData] = useState<WithIndex<PodcastSchedule>[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const columns: TableColumnsType<WithIndex<PodcastSchedule>> = [
    {
      title: "S.No.",
      dataIndex: "index",
      width: "8%",
    },
    {
      title: "Guest Name",
      dataIndex: "name",
      width: "25%",
    },
    {
      title: "Description",
      dataIndex: "short_description",
      width: "35%",
      render: (text) =>
        text?.length > 80 ? text.substring(0, 80) + "..." : text,
    },
    {
      title: "Schedule Date",
      dataIndex: "schedule_date",
      width: "20%",
      render: (date) => {
        const scheduleDate = dayjs(date, "YYYY-MM-DD", true);
const isPast = scheduleDate.isBefore(dayjs().startOf("day"));



        return (
          <Space orientation="vertical" size={0}>
            <span>{scheduleDate.format("MM/DD/YYYY")}</span>

            <Tag color={isPast ? "red" : "green"}>
              {isPast ? "Past" : "Upcoming"}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate(`/edit-podcast-schedule/${record.id}`)}
          >
            Edit
          </Button>

          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const getData = async () => {
    try {
      setLoading(true);

      const result = await GetAllPodcastSchedule(
        localStorage.getItem("adminToken"),
      );

      const newData = result?.data?.data?.map((item, index) => ({
        ...item,
        index: index + 1,
      }));

      setData(newData);
      setBackupData(newData);
    } catch (err) {
      message.error("Failed to load podcast schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const onSearch = (value: string) => {
    const filtered = backupData.filter((item) =>
      item.name.toLowerCase().includes(value.toLowerCase()),
    );

    setData(filtered);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Delete Schedule",
      content: "Are you sure you want to delete this schedule?",

      onOk: async () => {
        try {
          await DeletePodcastSchedule(
            [id],
            localStorage.getItem("adminToken"),
          );

          message.success("Schedule deleted successfully");

          getData();
        } catch (err) {
          message.error("Failed to delete schedule");
        }
      },
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px"
        }}>
        <div>
          <h3>PODCAST SCHEDULES</h3>
          <p>Manage all podcast schedules</p>
        </div>

        <Space>
          <Search
            placeholder="Search guest..."
            allowClear
            onChange={(e) => onSearch(e.target.value)}
            style={{ width: 250 }}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/add-podcast-schedule")}
          >
            Add Schedule
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

export default PodcastSchedule;
