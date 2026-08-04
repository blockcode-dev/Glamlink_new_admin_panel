/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, message, Button, Input, Modal, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Box } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import { DeleteJournal, GetAllJournal } from "../../../services/Api/JournalApi";
import moment from "moment";

const { Search } = Input;

const Blogs = () => {
  const [data, setData] = useState([]);
  const [backupData, setBackupData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const columns = [
    {
      title: "S.No.",
      dataIndex: "index",
      width: 70,
      align: "center",
    },

    {
      title: "Cover",
      dataIndex: "cover_image",
      width: 100,
      align: "center",

      render: (img) =>
        img ? (
          <img
            src={img}
            alt="cover"
            style={{
              width: 70,
              height: 50,
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid #f0f0f0",
            }}
          />
        ) : (
          <div
            style={{
              width: 70,
              height: 50,
              borderRadius: 8,
              background: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "#999",
            }}
          >
            No Image
          </div>
        ),
    },

    {
      title: "Title",
      dataIndex: "title",
      width: 260,

      render: (text) => (
        <div
          style={{
            fontWeight: 600,
            color: "#1f1f1f",
            lineHeight: "20px",
          }}
        >
          {text}
        </div>
      ),
    },

    {
      title: "Author",
      dataIndex: "journal_author",
      width: 180,

      render: (author) => (
        <div
          style={{
            fontWeight: 500,
            color: "#1f1f1f",
          }}
        >
          {author?.name || "-"}
        </div>
      ),
    },

    {
      title: "Category",
      dataIndex: "journal_category",
      width: 160,

      render: (category) => (
        <span
          style={{
            background: "#f0f5ff",
            color: "#1677ff",
            padding: "5px 12px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 500,
            display: "inline-block",
          }}
        >
          {category?.title || "-"}
        </span>
      ),
    },

    {
      title: "Description",
      dataIndex: "short_description",
      width: 320,

      render: (text) => (
        <div
          style={{
            color: "#666",
            fontSize: 13,
            lineHeight: "20px",
          }}
        >
          {text?.length > 100 ? text.substring(0, 100) + "..." : text || "-"}
        </div>
      ),
    },
    {
	title: "Status",
	dataIndex: "status",
	width: 120,
	align: "center",

	render: (status) => (
		<Tag
			color={
				status === "published"
					? "green"
					: "orange"
			}
			style={{
				fontWeight: 600,
				textTransform: "capitalize",
				padding: "4px 12px",
				borderRadius: 20,
			}}
		>
			{status}
		</Tag>
	),
},

    {
      title: "Published",
      dataIndex: "publish_date",
      width: 180,

      render: (date) => (
        <div>
          <div
            style={{
              fontWeight: 500,
              color: "#1f1f1f",
            }}
          >
            {moment(date, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY")}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "#888",
              marginTop: 2,
            }}
          >
            {moment(date, "YYYY-MM-DD HH:mm:ss").format("hh:mm A")}
          </div>
        </div>
      ),
    },

    {
      title: "Action",
      width: 140,
      align: "center",

      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            style={{
              padding: 0,
              fontWeight: 500,
            }}
            onClick={() => navigate(`/edit-journal/${record.id}`)}
          >
            Edit
          </Button>

          <Button
            type="link"
            danger
            style={{
              padding: 0,
              fontWeight: 500,
            }}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const getData = async () => {
    try {
      setLoading(true);
      const result = await GetAllJournal(localStorage.getItem("adminToken"));

      const newData = result.data.rows.map((item, index) => ({
        ...item,
        index: index + 1,
      }));

      setData(newData);
      setBackupData(newData);
    } catch {
      message.error("Failed to load journals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const onSearch = (value) => {
    const filtered = backupData.filter((item) =>
      item.title.toLowerCase().includes(value.toLowerCase()),
    );
    setData(filtered);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Journal",
      content: "Are you sure you want to delete this journal?",
      onOk: async () => {
        try {
          await DeleteJournal([id]); // 👈 send as array
          message.success("Journal deleted successfully");
          getData();
        } catch (err) {
          message.error("Failed to delete Journal");
        }
      },
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" marginBottom="20px">
        <div>
          <h3>JOURNALS</h3>
          <p>Manage all journals</p>
        </div>

        <Space>
          <Search
            placeholder="Search journal..."
            allowClear
            onChange={(e) => onSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/add-journal")}
          >
            Add Journal
          </Button>
        </Space>
      </Box>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
		pagination={{
		pageSize: 50,
		showSizeChanger: false,
	}}
      />
    </Box>
  );
};

export default Blogs;
