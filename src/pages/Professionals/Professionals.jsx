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
} from "antd";
import { Button } from "primereact/button";
import { useNavigate } from "react-router";
import { InputText } from "primereact/inputtext";
import { Box } from "@material-ui/core";
import moment from "moment/moment";
import { FaShield } from "react-icons/fa6";
import { TagOutlined, StopOutlined } from "@ant-design/icons";
import { FaBriefcase } from "react-icons/fa";

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
import { Switch } from "@mui/material";

const Professionals = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [userBackupData, setUserBackupData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [payoutSummary, setPayoutSummary] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const [promotionModalVisible, setPromotionModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [professions, setProfessions] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [selectedKeyword, setSelectedKeyword] = useState(null);

  const [promotions, setPromotions] = useState([]);
  // Referral modal states
  const [isReferralModalOpen, setReferralModalOpen] = useState(false);
  const [selectedReferrals, setSelectedReferrals] = useState([]);
  const [referralLoading, setReferralLoading] = useState(false);

  // 🔹 Shared style for the small icon-only action buttons in the table
  const smallIconBtnStyle = {
    width: "30px",
    height: "30px",
    padding: 0,
    borderRadius: "25px",
  };

  const openReferralModal = async (beauticianId) => {
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

  const fetchUserPromotions = async (userId) => {
    try {
      const res = await GetUserPromotions(userId);
      console.log(res.data.data);
      setPromotions(res.data.data || []);
    } catch (err) {
      message.error("Failed to load promotions");
    }
  };

  const openPromotionManager = (record) => {
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

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 100,
    },
    sortField: null,
    sortOrder: null,
  });

  const columns = [
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
                color: "#FFD700", // gold
                marginRight: "6px",
                fontSize: "16px",
              }}
              title="Founder"
            >
              <FaShield
                style={{
                  color: "gold",
                  filter: "drop-shadow(0 0 1px goldenrod)",
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
            <span style={{ color: "red", fontStyle: "italic" }}>
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
      render: (date) => moment(date).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Promotion",
      dataIndex: "promotion",
      width: 90,
      align: "center",
      render: (_, record) => (
        <Tooltip placement="bottom" title="Manage Promotion">
          <Button
            icon="pi pi-star"
            rounded
            outlined
            severity="warning"
            style={{
              ...smallIconBtnStyle,
              color: record.is_promoted ? "goldenrod" : "#aaa", // gold if promoted, gray otherwise
              borderColor: record.is_promoted ? "goldenrod" : "#aaa",
              backgroundColor: record.is_promoted ? "#fffbe6" : "transparent", // light background for promoted
            }}
            onClick={() => openPromotionManager(record)}
          />
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
              color="primary"
              size="small"
            />
          </Tooltip>

          <Tooltip placement="bottom" title="View Payouts to Professional">
            <Button
              icon="pi pi-dollar"
              rounded
              outlined
              severity="info"
              style={{
                ...smallIconBtnStyle,
                color: "green",
                borderColor: "green",
              }}
              onClick={() => {
                fetchPayoutSummary(record.id);
              }}
            />
          </Tooltip>

          <Button
            icon="pi pi-eye"
            rounded
            outlined
            className="mr-2"
            style={smallIconBtnStyle}
            onClick={(event) => navigateToViewUser(event, record.id)}
          />
          <Button
            icon="pi pi-trash"
            rounded
            outlined
            severity="danger"
            style={{
              ...smallIconBtnStyle,
              color: "red",
              borderColor: "red",
            }}
            onClick={() => handleDelete([record.id])}
          />
        </Space>
      ),
    },
  ];

  // Get all users
  const getData = async (params = {}) => {
    try {
      setLoading(true);

      const {
        pagination = { current: 1, pageSize: 100 },
        sortField = null,
        sortOrder = null,
      } = params;

      const result = await GetProfessionals(
        localStorage.getItem("adminToken"),
        {
          page: pagination.current, // Current page
          limit: pagination.pageSize, // Page size
          sortBy: "DESC",
          order: sortField,
        },
      );

      // Debugging API Response
      console.log("API Response:", result);

      const rows = result?.data?.data?.rows || []; // Safely access rows
      const total = result?.data?.data?.count || 0; // Total number of records

      const newData = rows.map((item, index) => ({
        ...item,
        index: index + 1 + (pagination.current - 1) * pagination.pageSize,
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

      if (e.response?.status === 401) {
        navigate("/error401");
      } else if (e.response?.status === 500) {
        const errorMessage = e.response.data?.message || e.response.message;
        if (errorMessage === "jwt expired") {
          message.error("Session Expired");
          navigate("/login");
        } else {
          console.error("Server error. Please try again later.");
        }
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

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      sortField: sorter.field,
      sortOrder: sorter.order,
    });
  };

  const onSearch = (searchField) => {
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

  const handlePromotionToggle = async (userData) => {
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

  const handleDelete = (userIds) => {
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
          await DeleteUser(userIds, localStorage.getItem("adminToken"));

          message.success(
            `${userIds.length > 1 ? "Users" : "User"} deleted successfully`,
          );

          setSelectedRowKeys([]);
          getData();
        } catch (error) {
          console.error("Error deleting employee(s):", error);

          const rawMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "";

          // Detect the "user still has an Access Card" conflict from the backend
          const isAccessCardConflict =
            /access\s*card|business\s*card/i.test(rawMessage) ||
            error?.response?.status === 409;

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
                      background: "#fff7e6",
                      border: "1px solid #ffe1a8",
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "#8a6d3b",
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

  const navigateToViewUser = (event, id) => {
    navigate(`/viewProfessionals/${id}`);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  const fetchPayoutSummary = async (professionalId) => {
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
      formData.append("professional_id", selectedProfessional.id);
      formData.append("amount", parseFloat(payoutSummary.netPayout).toFixed(2)); // Ensure proper decimal format

      const response = await ProfessialPayout(formData);

      if (response.status === 201) {
        message.success("Payout processed successfully.");
        setPayoutModalVisible(false);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Payout error:", err.message);

      if (err.response) {
        if (err.response.status === 400) {
          message.error("You have insufficient funds in your Stripe account.");
        } else if (err.response.status === 500) {
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
    if (!selectedProfession && !selectedKeyword) {
      message.error("Please select a profession and keyword");
      return;
    }
    const token = localStorage.getItem("adminToken");

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

  const handleUnpromoteSingle = async (item) => {
    try {
      console.log(item, "item");
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
    <Box>
      {/* ---- Header, styled to match BusinessCard.jsx ---- */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="16px"
        style={{
          background: "#fff",
          border: "1px solid #eef0f3",
          borderRadius: 10,
          padding: "18px 22px",
          boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div>
          <h3
            className="page-title"
            style={{ margin: 0, fontWeight: 700, fontSize: 20 }}
          >
            Professionals Management
          </h3>
          <p
            className="page-sub-title"
            style={{ margin: "4px 0 0 0", color: "#666", fontSize: 13 }}
          >
            View, delete, and manage registered professionals.
          </p>
        </div>

        <Box display="flex" alignItems="center" gap="12px">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              type="search"
              onChange={(e) => {
                onSearch(e.target.value);
              }}
              placeholder="Search..."
              style={{ height: "42px", borderRadius: "6px" }}
            />
          </span>

          <Button
            icon="pi pi-cloud-download"
            severity="success"
            style={{
              height: "42px",
              borderRadius: "6px",
              margin: "10px",
            }}
            onClick={exportToCSV}
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            style={{
              height: "42px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            onClick={() => handleDelete(selectedRowKeys)}
            disabled={!selectedRowKeys.length}
          />
          {/* <Button
						icon="pi pi-plus"
						severity="info"
						style={{
							margin: "0px 10px",
							borderRadius: "5px",
							height: "47px",
						}}
						onClick={navigateToAddUser}
					/> */}
        </Box>
      </Box>

      <Card
        bodyStyle={{ padding: 0 }}
        style={{
          borderRadius: 10,
          border: "1px solid #eef0f3",
          boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
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
            label="Cancel"
            severity="secondary"
            outlined
            style={{ marginRight: "10px", borderRadius: "8px", height: "32px" }}
          />,
          <Button
            label="Process Payout"
            severity="info"
            loading={paying}
            onClick={handlePayout}
            style={{ marginRight: "10px", borderRadius: "8px", height: "32px" }}
            disabled={!payoutSummary?.netPayout || !selectedProfessional}
          />,
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
              <span style={{ fontWeight: 600, color: "#0a7" }}>
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
          <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
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
                        style={{ color: item.days_left < 10 ? "red" : "green" }}
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
          <p style={{ textAlign: "center", color: "gray", marginBottom: 20 }}>
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
            style={{ background: "goldenrod", borderColor: "goldenrod" }}
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
          <Table
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
          <p style={{ textAlign: "center", color: "#999" }}>
            No referred users found
          </p>
        )}
      </Modal>
    </Box>
  );
};

export default Professionals;
