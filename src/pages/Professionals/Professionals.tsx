/** @format */

import React, { useEffect, useState } from "react";
import {
  Table,
  Space,
  message,
  Modal,
  Tooltip,
  Card,
  Button,
  Input,
  Switch,
  type TableColumnsType,
} from "antd";
import { useNavigate } from "react-router";
import dayjs from "dayjs";

import {
  CreateFounder,
  DeleteUser,
  GetProfessionals,
} from "../../services/Api/UserApi";

import {
  CloudDownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  SafetyCertificateFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { apiErrorBody, apiErrorMessage, apiErrorStatus } from "../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../utils/table";
import type { Professional } from "../../types/user";
import { downloadCsv } from "../../utils/csv";

const Professionals = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<WithIndex<Professional>[]>([]);
  const [userBackupData, setUserBackupData] = useState<WithIndex<Professional>[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 🔹 Shared style for the small icon-only action buttons in the table
  const smallIconBtnStyle = {
    width: "30px",
    height: "30px",
    padding: 0,
    borderRadius: "25px",
  };

  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 100,
    },
    sortField: null,
    sortOrder: null,
  });

  const columns: TableColumnsType<WithIndex<Professional>> = [
    {
      title: "S.No.",
      dataIndex: "index",
      sorter: (a, b) => a.index - b.index,
      width: 60,
    },
    {
      title: "Name",
      dataIndex: ["user_profile", "name"],
      sorter: (a, b) =>
        a.user_profile && b.user_profile
          ? a.user_profile.name.localeCompare(b.user_profile.name)
          : 0,
      width: 160,
      render: (_, record) => (
        <span>
          {record.user_profile?.name || ""}
          {record.is_founder && (
            <span
              style={{
                color: "var(--color-rating)", // gold
                marginRight: "6px",
                fontSize: "16px",
              }}
              title="Founder"
            >
              <SafetyCertificateFilled
                style={{
                  color: "var(--color-rating)",
                  filter: "drop-shadow(0 0 1px var(--color-warning))",
                }}
              />
            </span>
          )}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 190,
      render: (email, record) => (
        <span>
          {email}{" "}
          {record.status === "PENDING" && (
            <span style={{ color: "var(--color-error)", fontStyle: "italic" }}>
              (Unverified)
            </span>
          )}
        </span>
      ),
    },
    {
      title: "Account Created On",
      dataIndex: "created_at",
      width: "30%",
      render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Action",
      dataIndex: "action",
      width: 190,
      render: (_, record) => (
        <Space size={6}>
          <Tooltip placement="bottom" title="Founders Badge">
            <Switch
              checked={record.is_founder}
              onChange={() => handleFounderToggle(record)}
              size="small"
            />
          </Tooltip>

          <Button
            style={smallIconBtnStyle}
            onClick={(event) => navigateToViewUser(event, record.id)}
            icon={<EyeOutlined />}
            shape="circle" />
          <Button
            style={{
              ...smallIconBtnStyle,
              color: "var(--color-error)",
              borderColor: "var(--color-error)",
            }}
            onClick={() => handleDelete([record.id])}
            icon={<DeleteOutlined />}
            danger
            shape="circle" />
        </Space>
      ),
    },
  ];

  // Get all users
  const getData = async (params: Partial<TableParams> = {}) => {
    try {
      setLoading(true);

      const {
        pagination = { current: 1, pageSize: 100 },
      } = params;

      const result = await GetProfessionals({
        page: pagination.current, // Current page
        limit: pagination.pageSize, // Page size
        sortBy: "DESC",
      });

      const rows = result?.data?.data?.rows || []; // Safely access rows
      const total = result?.data?.data?.count || 0; // Total number of records

      const newData = rows.map((item, index) => ({
        ...item,
        index: index + 1 + ((pagination.current ?? 1) - 1) * (pagination.pageSize ?? 100),
      }));

      setData(newData); // Update current page's data
      setUserBackupData(newData); // Backup for search functionality

      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...pagination,
          total, // Update total records count
        },
      }));
    } catch (e) {
      console.error("Error loading data:", e);

      if (apiErrorStatus(e) === 403) {
        navigate("/error401");
      } else if (apiErrorStatus(e) === 500) {
        // An expired session is handled for every request (utils/session.ts).
        console.error("Server error. Please try again later.");
      } else {
        message.error("Error loading data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tableParams.pagination.current && tableParams.pagination.pageSize) {
      getData({
        pagination: tableParams.pagination,
        sortField: tableParams.sortField,
        sortOrder: tableParams.sortOrder,
      });
    }
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortField,
    tableParams.sortOrder,
  ]);

  const handleTableChange: TableChangeHandler<WithIndex<Professional>> = (pagination, filters, sorter) => {
    const { field, order } = singleSorter(sorter);
    setTableParams({
      pagination,
      filters,
      sortField: field,
      sortOrder: order,
    });
  };

  const onSearch = (searchField: string) => {
    const LIST = [...userBackupData];
    const searchList = [];

    for (let i in LIST) {
      if (
        LIST[i]?.user_profile?.name
          ?.toLowerCase()
          ?.includes(searchField?.toLowerCase()) ||
        LIST[i]?.email?.toLowerCase()?.includes(searchField?.toLowerCase())
      ) {
        searchList.push(LIST[i]);
      }
    }

    setData(searchList);
  };

  const handleFounderToggle = async (userData: Professional) => {
    setLoading(true);

    try {
      const response = await CreateFounder(userData?.id);

      if (response.status === 200) {
        const updatedData = data.map((user) =>
          user.id === userData.id
            ? { ...user, is_founder: !user.is_founder }
            : user,
        );

        setData(updatedData);
        setUserBackupData(updatedData);

        if (!userData.is_founder) {
          message.success("Professional is marked as Founder.");
        } else {
          message.success("Professional is removed as Founder.");
        }
      } else {
        message.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error updating founder status:", error);
      message.error("Failed to update founder status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (userIds: React.Key[]) => {
    Modal.confirm({
      title: "Confirm",
      content: `Are you sure you want to delete ${
        userIds.length > 1 ? "these users" : "this user"
      }?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",

      onOk: async () => {
        try {
          await DeleteUser(userIds);

          message.success(
            `${userIds.length > 1 ? "Users" : "User"} deleted successfully`,
          );

          setSelectedRowKeys([]);
          getData();
        } catch (error) {
          console.error("Error deleting employee(s):", error);

          const rawMessage =
            apiErrorMessage(error) ||
            apiErrorBody(error)?.error ||
            (error instanceof Error ? error.message : "") ||
            "";

          // Detect the "user still has an Access Card" conflict from the backend
          const isAccessCardConflict =
            /access\s*card|business\s*card/i.test(rawMessage) ||
            apiErrorStatus(error) === 409;

          if (isAccessCardConflict) {
            Modal.error({
              title: "Can't Delete This Account",
              centered: true,
              okText: "Got it",
              width: 460,
              content: (
                <div style={{ paddingTop: 6 }}>
                  <p style={{ marginBottom: 10 }}>
                    This account still has an{" "}
                    <strong>active Access Card</strong> linked to it, so it
                    can't be deleted yet.
                  </p>
                  <div
                    style={{
                      background: "var(--color-warning-soft)",
                      border: "1px solid var(--color-warning-border)",
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "var(--color-warning)",
                    }}
                  >
                    Please delete the user's <strong>Access Card</strong> first,
                    then try deleting the account again.
                  </div>
                </div>
              ),
            });
          } else {
            Modal.error({
              title: "Unable to Delete User",
              content:
                rawMessage || "Unable to delete user(s). Please try again.",
              okText: "OK",
              centered: true,
            });
          }
        }
      },
    });
  };

  const exportToCSV = () => {
    downloadCsv(
      "professionals.csv",
      ["ID", "Name", "Mobile", "Email"],
      data.map((row) => [row.id, row.user_profile?.name, row.user_profile?.mobile, row.email]),
    );
  };

  const navigateToViewUser = (event: React.MouseEvent<HTMLElement>, id: number) => {
    navigate(`/viewProfessionals/${id}`);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  return (
    <div>
      {/* ---- Header, styled to match BusinessCard.jsx ---- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 10,
          padding: "18px 22px",
          boxShadow: "0 1px 2px var(--color-shadow)",
          flexWrap: "wrap",
          gap: 14
        }}>
        <div>
          <h3
            className="page-title"
            style={{ margin: 0, fontWeight: 700, fontSize: 20 }}
          >
            Professionals Management
          </h3>
          <p
            className="page-sub-title"
            style={{ margin: "4px 0 0 0", color: "var(--color-text-secondary)", fontSize: 13 }}
          >
            View, delete, and manage registered professionals.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
          <Input
            type="search"
            onChange={(e) => {
              onSearch(e.target.value);
            }}
            placeholder="Search..."
            style={{ height: "42px", borderRadius: "6px" }}
            prefix={<SearchOutlined />}
            size="large" />

          <Button
            style={{
              borderRadius: "6px",
              margin: "10px"
            }}
            onClick={exportToCSV}
            icon={<CloudDownloadOutlined />}
            type="primary"
            size="large" />
          <Button
            style={{
              borderRadius: "6px",
              cursor: "pointer"
            }}
            onClick={() => handleDelete(selectedRowKeys)}
            disabled={!selectedRowKeys.length}
            icon={<DeleteOutlined />}
            danger
            size="large" />
        </div>
      </div>

      <Card
        styles={{ body: { padding: 0 } }}
        style={{
          borderRadius: 10,
          border: "1px solid var(--color-border)",
          boxShadow: "0 1px 2px var(--color-shadow)",
        }}
      >
        <Table
          columns={columns}
          rowKey={(record) => record.id}
          dataSource={data}
          pagination={tableParams.pagination}
          loading={loading}
          onChange={handleTableChange}
          rowSelection={rowSelection}
          scroll={{ x: 800 }}
          size="middle"
        />
      </Card>

    </div>
  );
};

export default Professionals;
