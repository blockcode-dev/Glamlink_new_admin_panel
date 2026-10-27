import React, { useEffect, useState } from "react";
import { message, Button, Spin, Table, Typography, type TableColumnsType } from "antd";
import {
  getUserLoginTimings,
  clearUserLoginTimings,
} from "../../../services/Api/Api";
import type { LoginRecord, LoginRecordsByUser } from "../../../types/admin";

interface UserRow {
  key: string;
  records: LoginRecord[];
}

const formatTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

const userColumns: TableColumnsType<UserRow> = [
  {
    title: "Name",
    key: "name",
    render: (_, { records }) => records[0].login_user?.user_profile?.name,
  },
  {
    title: "Email",
    key: "email",
    align: "right",
    // Rows without login_user are filtered out below.
    render: (_, { records }) => records[0].login_user!.email,
  },
  {
    title: "Role",
    key: "role",
    align: "right",
    render: (_, { records }) =>
      records[0].role_id === 6 ? "User" : records[0].role_id === 7 ? "Driver" : "",
  },
  {
    title: "User Id",
    key: "user_id",
    align: "right",
    render: (_, { records }) => records[0].user_id,
  },
];

const LoginHistory = ({ records }: { records: LoginRecord[] }) => (
  <div style={{ margin: 8 }}>
    <Typography.Title level={5}>Login History</Typography.Title>
    <Table
      size="small"
      rowKey="id"
      pagination={false}
      dataSource={records}
      columns={[
        {
          title: "Ip address",
          key: "ip",
          render: () => records[0].ip_address.split(":").pop(),
        },
        {
          title: "Login Time",
          dataIndex: "login_time_utc",
          align: "right",
          render: (value: string) => formatTime(value),
        },
        {
          title: "Logout Time",
          dataIndex: "logout_time_utc",
          align: "right",
          render: (value: string | null) => (value ? formatTime(value) : "----"),
        },
      ]}
    />
  </div>
);

const LoginLogs = () => {
  const [userLoginTimingData, setUserLoginTimingData] = useState<LoginRecordsByUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  useEffect(() => {
    const loginTimingsFunc = async () => {
      try {
        let data = await getUserLoginTimings();
        setUserLoginTimingData(data.data.data);
      } catch (error) {
        console.error(error);
      }
      finally {
        setLoading(false)
      }
    };

    loginTimingsFunc();
  }, []);

  const handleClearButtonClick = async () => {
    setClearLoading(true);
    try {
      await clearUserLoginTimings();
      setUserLoginTimingData(null);
      message.success("Login Record Cleared Successfully");
    } catch (error) {
      message.error("Failed to Clear Login Record");
    } finally {
      setClearLoading(false);
    }
  };

  // The API returns { [userId]: loginRecord[] }; rows without a user are skipped.
  const userRows: UserRow[] = Object.entries(userLoginTimingData || {})
    .map(([userId, records]) => ({ key: userId, records }))
    .filter(({ records }) => records && records[0] && records[0]?.login_user);

  return (
    <div style={{
      margin: "20px"
    }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column"
          }}>
          <h3 className="dashboard_title"> User Login Activity:</h3>
          <p className="page-sub-title" style={{ color: "var(--color-success)" }}>
            Login track record of all users
          </p>
        </div>
        <div>
          <Button
            onClick={handleClearButtonClick}
            disabled={clearLoading}
            style={{
              margin: "0px 0px",
              borderRadius: "5px"
            }}
            danger
            size="large">Clear Logs</Button>
        </div>
      </div>
      {loading ? (
        <Spin />
      ) : (
        userLoginTimingData &&
        Object.keys(userLoginTimingData).length !== 0 && (
          <div
            style={{
              margin: "40px 0 0 0",
              height: "64.5vh",
              overflow: "auto"
            }}>
            <Table
              columns={userColumns}
              dataSource={userRows}
              pagination={false}
              expandable={{
                expandedRowRender: ({ records }) => (
                  <LoginHistory records={records} />
                ),
              }}
            />
          </div>
        )
      )}
    </div>
  );
};

export default LoginLogs;
