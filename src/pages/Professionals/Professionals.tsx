/** @format */

import React, { useEffect, useState } from "react";
import {
  Table,
  Space,
  message,
  Modal,
  Tooltip,
  Form,
  Select,
  Tag,
  Divider,
  List,
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
  GetAllkeywords,
  GetAllProfessional,
  GetAllReferralByBeauticianId,
  GetProfessionalPayoutSummary,
  GetProfessionals,
  GetUserPromotions,
  ProfessialPayout,
  PromoteUserAPI,
  UnpromoteAllAPI,
  UnpromoteUserAPI,
} from "../../services/Api/UserApi";

import {
  CloudDownloadOutlined,
  DeleteOutlined,
  DollarOutlined,
  EyeOutlined,
  SafetyCertificateFilled,
  SearchOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { apiErrorBody, apiErrorMessage, apiErrorStatus } from "../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../utils/table";
import type { PayoutSummary, Professional, Promotion, PromotionTarget, User } from "../../types/user";

const Professionals = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<WithIndex<Professional>[]>([]);
  const [userBackupData, setUserBackupData] = useState<WithIndex<Professional>[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [payoutSummary, setPayoutSummary] = useState<PayoutSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const [promotionModalVisible, setPromotionModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Professional | null>(null);

  const [professions, setProfessions] = useState<PromotionTarget[]>([]);
  const [keywords, setKeywords] = useState<PromotionTarget[]>([]);
  const [selectedProfession, setSelectedProfession] = useState<number | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<number[] | null | undefined>(null);

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  // Referral modal states
  const [isReferralModalOpen, setReferralModalOpen] = useState(false);
  const [selectedReferrals, setSelectedReferrals] = useState<User[]>([]);
  const [referralLoading, setReferralLoading] = useState(false);

  // 🔹 Shared style for the small icon-only action buttons in the table
  const smallIconBtnStyle = {
    width: "30px",
    height: "30px",
    padding: 0,
    borderRadius: "25px",
  };

  const openReferralModal = async (beauticianId: number) => {
    try {
      setReferralLoading(true);
      const res = await GetAllReferralByBeauticianId(beauticianId);
      const users = res.data?.data?.users || []; // assuming API returns { users: [...] }
      setSelectedReferrals(users);
      setReferralModalOpen(true);
    } catch (err) {
      message.error("Failed to load referred users");
    } finally {
      setReferralLoading(false);
    }
  };

  const fetchUserPromotions = async (userId: number) => {
    try {
      const res = await GetUserPromotions(userId);
      setPromotions(res.data.data || []);
    } catch (err) {
      message.error("Failed to load promotions");
    }
  };

  const openPromotionManager = (record: Professional) => {
    setSelectedUser(record);
    fetchUserPromotions(record.id);
    setPromotionModalVisible(true);
  };

  const fetchProfessions = async () => {
    const res = await GetAllProfessional();
    setProfessions(res.data.data || []);
  };

  const fetchKeywords = async () => {
    const res = await GetAllkeywords();
    setKeywords(res.data.data || []);
  };

  useEffect(() => {
    fetchProfessions();
    fetchKeywords();
  }, []);

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
      title: "Referral",
      width: 110,
      dataIndex: "referral_code",
      render: (referral_code, record) => {
        const referrals = record.referrals || []; // list of referral details
        const count = record.referral_count || 0; // use API field instead of length

        if (count === 0) {
          return referral_code || "-";
        }

        if (count === 1 && referrals.length === 1) {
          return (
            <>
              {referral_code} ({count}) - {referrals[0].name}
            </>
          );
        }

        // More than one -> make count clickable
        return (
          <>
            {referral_code} (
            <a onClick={() => openReferralModal(record.id)}>{count}</a>)
          </>
        );
      },
    },

    {
      title: "Account Created On",
      dataIndex: "created_at",
      width: "30%",
      render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Promotion",
      dataIndex: "promotion",
      width: 90,
      align: "center",
      render: (_, record) => (
        <Tooltip placement="bottom" title="Manage Promotion">
          <Button
            style={{
              ...smallIconBtnStyle,
              color: record.is_promoted ? "var(--color-rating)" : "var(--color-text-tertiary)", // highlighted if promoted, muted otherwise
              borderColor: record.is_promoted ? "var(--color-rating)" : "var(--color-text-tertiary)",
              backgroundColor: record.is_promoted ? "var(--color-warning-soft)" : "transparent", // light background for promoted
            }}
            onClick={() => openPromotionManager(record)}
            icon={<StarOutlined />}
            shape="circle" />
        </Tooltip>
      ),
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
              onChange={() => handlePromotionToggle(record)}
              size="small"
            />
          </Tooltip>

          <Tooltip placement="bottom" title="View Payouts to Professional">
            <Button
              style={{
                ...smallIconBtnStyle,
                color: "var(--color-success)",
                borderColor: "var(--color-success)",
              }}
              onClick={() => {
                fetchPayoutSummary(record.id);
              }}
              icon={<DollarOutlined />}
              shape="circle" />
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

      const result = await GetProfessionals(
        localStorage.getItem("adminToken"),
        {
          page: pagination.current, // Current page
          limit: pagination.pageSize, // Page size
          sortBy: "DESC",
        },
      );

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

      if (apiErrorStatus(e) === 401) {
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

  const handlePromotionToggle = async (userData: Professional) => {
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
          message.success("Beautician is marked as Founder.");
        } else {
          message.success("Beautician is removed as Founder.");
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
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Name,Mobile,Email\n" +
      data
        .map(
          (row) =>
            `${row.id},${row.user_profile.name},${row.user_profile.mobile},${row.email}`,
        )
        .join("\n");

    const encodedURI = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedURI);
    link.setAttribute("download", "customers.csv");
    document.body.appendChild(link);
    link.click();
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

  const fetchPayoutSummary = async (professionalId: number) => {
    try {
      const res = await GetProfessionalPayoutSummary(professionalId);
      const professional = data.find((p) => p.id === professionalId);
      setSelectedProfessional(professional || null);

      if (res.data.success) {
        const result = res.data.data;

        if (result.length === 0) {
          setPayoutSummary(null); // No payout to show
        } else {
          setPayoutSummary(result[0]);
        }
      } else {
        setPayoutSummary(null);
        message.error(res.data.message || "Failed to fetch payout summary.");
      }

      setIsModalOpen(true); // Always show modal
    } catch (err) {
      console.error("Error fetching payout summary:", err);
      message.error("Server error.");
      setIsModalOpen(true);
      setPayoutSummary(null);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handlePayout = async () => {
    if (!selectedProfessional || !payoutSummary?.netPayout) return;

    setPaying(true);
    try {
      const formData = new FormData();
      formData.append("professional_id", String(selectedProfessional.id));
      formData.append("amount", parseFloat(String(payoutSummary.netPayout)).toFixed(2)); // Ensure proper decimal format

      const response = await ProfessialPayout(formData);

      if (response.status === 201) {
        message.success("Payout processed successfully.");
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Payout error:", err instanceof Error ? err.message : err);

      if (apiErrorStatus(err) !== undefined) {
        if (apiErrorStatus(err) === 400) {
          message.error("You have insufficient funds in your Stripe account.");
        } else if (apiErrorStatus(err) === 500) {
          message.error("Professional hasn't connected their Stripe account.");
        } else {
          message.error("Unexpected error occurred.");
        }
      } else {
        message.error("Server error.");
      }
    } finally {
      setPaying(false);
    }
  };

  const handlePromote = async () => {
    if (!selectedUser) return;
    if (!selectedProfession && !selectedKeyword) {
      message.error("Please select a profession and keyword");
      return;
    }

    try {
      await PromoteUserAPI({
        user_id: selectedUser.id,
        professionId: selectedProfession || null,
        keywordIds: selectedKeyword || [],
      });
      message.success("User promoted successfully!");

      setPromotionModalVisible(false);
      getData();
      setSelectedProfessional(null);
      setSelectedKeyword(undefined);
    } catch (err) {
      message.error("Failed to promote user");
    }
  };

  const handleUnpromoteSingle = async (item: Promotion) => {
    if (!selectedUser) return;
    try {
      await UnpromoteUserAPI({
        user_id: selectedUser.id,
        professionId: item.type === "profession" ? item.ref_id : null,
        keywordIds: item.type === "keyword" ? [item.ref_id] : [],
      });
      message.success("Unpromoted successfully!");
      fetchUserPromotions(selectedUser.id);
      setSelectedProfessional(null);
      setSelectedKeyword(undefined);
    } catch (err) {
      message.error("Failed to unpromote");
    }
  };

  const handleUnpromoteAll = async () => {
    if (!selectedUser) return;
    try {
      await UnpromoteAllAPI({ user_id: selectedUser.id });
      message.success("All promotions removed!");
      setPromotionModalVisible(false);
      setSelectedProfessional(null);
      setSelectedKeyword(undefined);
      getData();
    } catch (err) {
      message.error("Failed to unpromote all");
    }
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

      <Modal
        title={
          <span style={{ fontWeight: 600, fontSize: "18px" }}>
            Payout Summary -{" "}
            {selectedProfessional?.user_profile?.name || "Professional"}
          </span>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button
            onClick={handleCancel}
            style={{ marginRight: "10px", borderRadius: "8px", height: "32px" }}>Cancel</Button>,
          <Button
            loading={paying}
            onClick={handlePayout}
            style={{ marginRight: "10px", borderRadius: "8px", height: "32px" }}
            disabled={!payoutSummary?.netPayout || !selectedProfessional}
            type="primary">Process Payout</Button>,
        ]}
      >
        {payoutSummary ? (
          <div style={{ display: "grid", rowGap: "12px", padding: "10px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>
                <strong>Gross Sales :</strong>
              </span>
              <span>${payoutSummary.grossSales}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>
                <strong>Total Revenue:</strong>
              </span>
              <span>${payoutSummary.totalRevenue}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>
                <strong>Tax Collected:</strong>
              </span>
              <span>${payoutSummary.totalTax}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>
                <strong>Platform Fee:</strong>
              </span>
              <span>${payoutSummary.totalPlatformFees}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>
                <strong>Net Payable Amount:</strong>
              </span>
              <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>
                ${payoutSummary.netPayout}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>
                <strong>Total Orders:</strong>
              </span>
              <span>{payoutSummary.totalOrders}</span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-tertiary)" }}>
            <p>
              <strong>No payout available for this professional.</strong>
            </p>
          </div>
        )}
      </Modal>

      <Modal
        title={`Manage Promotion - ${selectedUser?.user_profile?.name}`}
        open={promotionModalVisible}
        onCancel={() => {
          setPromotionModalVisible(false);
          setSelectedProfessional(null);
          setSelectedKeyword(undefined);
        }}
        footer={null}
        width={650}
      >
        <h4>Current Promotions</h4>

        {promotions.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={promotions}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    size="small"
                    danger
                    type="link"
                    onClick={() => handleUnpromoteSingle(item)}
                  >
                    Unpromote
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <span>
                      {item.title}{" "}
                      <Tag
                        color={item.type === "profession" ? "blue" : "purple"}
                      >
                        {item.type}
                      </Tag>
                    </span>
                  }
                  description={
                    <>
                      <div>
                        Purchased:{" "}
                        {dayjs(item.purchase_date).format("YYYY/MM/DD")}
                      </div>
                      <div
                        style={{ color: item.days_left < 10 ? "var(--color-error)" : "var(--color-success)" }}
                      >
                        Expires: {dayjs(item.expiry_date).format("YYYY/MM/DD")}{" "}
                        ({item.days_left} days left)
                      </div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", marginBottom: 20 }}>
            No active promotions
          </p>
        )}

        <Divider />
        <h4>Add New Promotion</h4>
        <Form layout="vertical">
          <Form.Item label="Select Profession">
            <Select
              value={selectedProfession}
              placeholder="Select Profession"
              style={{ width: "100%" }}
              options={professions.map((p) => ({
                label: p.title,
                value: p.id,
              }))}
              onChange={(val) => setSelectedProfession(val)}
            />
          </Form.Item>

          <Form.Item label="Select Service / Keyword">
            <Select
              value={
                selectedKeyword && selectedKeyword.length > 0
                  ? selectedKeyword
                  : undefined
              }
              placeholder="Select Service / Keyword"
              mode="multiple"
              style={{ width: "100%" }}
              options={keywords.map((k) => ({ label: k.title, value: k.id }))}
              onChange={(val) => setSelectedKeyword(val)}
            />
          </Form.Item>

          <Button
            type="primary"
            block
            style={{ background: "var(--color-rating)", borderColor: "var(--color-rating)" }}
            onClick={handlePromote}
          >
            Promote
          </Button>
        </Form>

        {promotions.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Button danger type="link" onClick={handleUnpromoteAll}>
              Unpromote All
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        open={isReferralModalOpen}
        onCancel={() => setReferralModalOpen(false)}
        footer={null}
        title="Referred Users"
        width={600} // optional: to make table fit better
      >
        {referralLoading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : selectedReferrals.length > 0 ? (
          <Table<User>
            dataSource={selectedReferrals}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: "Name",
                dataIndex: ["user_profile", "name"],
                render: (text) => text || "-",
              },
              {
                title: "Email",
                dataIndex: "email",
                render: (text) => text || "-",
              },
              {
                title: "Joined On",
                dataIndex: "created_at",
                render: (date) =>
                  date ? new Date(date).toLocaleDateString() : "-",
              },
            ]}
          />
        ) : (
          <p style={{ textAlign: "center", color: "var(--color-text-tertiary)" }}>
            No referred users found
          </p>
        )}
      </Modal>
    </div>
  );
};

export default Professionals;
