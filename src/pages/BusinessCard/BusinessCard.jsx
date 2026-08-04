/** @format */

import React, { useEffect, useState } from "react";
import {
  Table,
  Space,
  Modal,
  message,
  Select,
  Tag,
  Card,
  Divider,
  Avatar,
  Image,
  Row,
  Col,
  Tooltip,
} from "antd";
import "./Businesscard.scss";
import { Button } from "primereact/button";
import {
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  PictureOutlined,
  StarOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
  HeartOutlined,
  GiftOutlined,
  InstagramOutlined,
  VideoCameraOutlined,
  QrcodeOutlined,
  LinkOutlined,
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
import { useNavigate } from "react-router";
import { InputText } from "primereact/inputtext";
import { Box } from "@material-ui/core";
import moment from "moment";
import {
  DeleteBusinessCard,
  GetAllBusinessCards,
  UpdateStatus,
} from "../../services/Api/BusinessCardApi";

const BusinessCard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [userBackupData, setUserBackupData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const openViewModal = (record) => {
    setSelectedCard(record);
    setViewModalOpen(true);
  };

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 100,
    },
    sortField: null,
    sortOrder: null,
  });

  // Fetch list of users who submitted the form
  const getData = async () => {
    try {
      setLoading(true);
      let result = await GetAllBusinessCards(
        localStorage.getItem("adminToken"),
      );
      const newData = result.data.data.map((item, index) => ({
        ...item,
        index: index + 1,
      }));
      setData(newData);
      setUserBackupData(newData);
    } catch (e) {
      console.log(e);
      if (e.response && e.response.status === 403) {
        navigate("/error401");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      sortField: sorter.field,
      sortOrder: sorter.order,
    });
  };

  const onSearch = (value) => {
    const searchText = value?.toLowerCase().trim();

    if (!searchText) {
      setData(userBackupData);
      return;
    }

    const searchList = userBackupData.filter((item) => {
      return (
        item.name?.toLowerCase().includes(searchText) ||
        item.email?.toLowerCase().includes(searchText) ||
        item.business_name?.toLowerCase().includes(searchText) ||
        item.professional_title?.toLowerCase().includes(searchText) ||
        item.primary_specialty?.toLowerCase().includes(searchText) ||
        item.status?.toLowerCase().includes(searchText)
      );
    });

    setData(searchList);
  };

  const handleStatusChange = async (cardId, status) => {
    try {
      const formData = new FormData();
      formData.append("cardId", cardId);
      formData.append("status", status); // accepted | rejected

      await UpdateStatus(formData);

      message.success(`Marked as ${status.toUpperCase()}`);
      getData();
    } catch (error) {
      message.error("Failed to update status");
    }
  };
const getPurchaseInfo = (record) => {
  const hasNfc = record.nfc_status?.toLowerCase() === "paid";

  const hasSubscription =
    record.plan_type === "subscription_only" ||
    record.plan_type === "nfc_with_subscription";

  if (hasNfc && hasSubscription) {
    return {
      label: "NFC + Subscription",
      color: "gold",
    };
  }

  if (hasNfc) {
    return {
      label: "NFC Purchased",
      color: "blue",
    };
  }

  if (hasSubscription) {
    return {
      label: "Subscription Purchased",
      color: "purple",
    };
  }

  return {
    label: "Not Purchased",
    color: "default",
  };
};

  const iconBtnBase = {
    width: 30,
    height: 30,
    borderRadius: 8,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid",
    cursor: "pointer",
    fontSize: 13,
  };

  const viewBtnStyle = {
    ...iconBtnBase,
    color: "#16a34a",
    borderColor: "#bbf7d0",
    background: "#f0fdf4",
  };

  const editBtnStyle = {
    ...iconBtnBase,
    color: "#1677ff",
    borderColor: "#dbeafe",
    background: "#eff6ff",
  };

  const deleteBtnStyle = {
    ...iconBtnBase,
    color: "#e5484d",
    borderColor: "#fee2e2",
    background: "#fef2f2",
  };

  const columns = [
    {
      title: "Card Holder",
      dataIndex: "name",
      width: 210,
      render: (name, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar src={record.profile_image} size={36}>
            {name?.[0]}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                color: "#1f1f1f",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#888",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 160,
              }}
            >
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Card",
      dataIndex: "business_card_link",
      width: 195,
      render: (_, record) => (
        <Space size={6}>
          {record.business_card_link ? (
            <Tooltip title="View Live Card">
              <a
                href={record.business_card_link}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "4px 12px",
                  background: "#fff0f6",
                  border: "1px solid #ffadd2",
                  borderRadius: 20,
                  color: "#eb2f96",
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <LinkOutlined style={{ fontSize: 11 }} /> View Card
              </a>
            </Tooltip>
          ) : (
            <span style={{ color: "#bbb", fontSize: 12 }}>N/A</span>
          )}

          {record.business_card_qr && (
            <Tooltip title="View QR Code">
              <span
                onClick={() => {
                  setSelectedCard(record);
                  setQrModalOpen(true);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 12px",
                  background: "#e6f7ff",
                  border: "1px solid #91d5ff",
                  borderRadius: 20,
                  color: "#1890ff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <QrcodeOutlined style={{ fontSize: 11 }} /> QR Code
              </span>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Purchases",
      dataIndex: "nfc_status",
      width: 170,
      render: (_, record) => {
        const { label, color } = getPurchaseInfo(record);
        return (
          <Space direction="vertical" size={4}>
            <Tag
              color={color}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 10px",
                borderRadius: 20,
              }}
            >
              {label}
            </Tag>
            <Tag
              color={record.created_by_admin ? "blue" : "purple"}
              style={{ fontSize: 10, padding: "0 6px" }}
            >
              {record.created_by_admin ? "ADMIN" : "WEBSITE"}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 110,
      render: (status, record) => {
        return (
          <Select
            value={status}
            style={{ width: 92 }}
            bordered={true}
            className="bc-status-select"
            onChange={(value) => handleStatusChange(record.id, value)}
          >
            <Select.Option value="pending">
              <Tag color="warning" style={{ fontSize: 10, padding: "0 5px" }}>
                PENDING
              </Tag>
            </Select.Option>
            <Select.Option value="accepted">
              <Tag color="success" style={{ fontSize: 10, padding: "0 5px" }}>
                ACCEPTED
              </Tag>
            </Select.Option>
            <Select.Option value="rejected">
              <Tag color="error" style={{ fontSize: 10, padding: "0 5px" }}>
                REJECTED
              </Tag>
            </Select.Option>
          </Select>
        );
      },
    },
    {
      title: "Submitted",
      dataIndex: "created_at",
      width: 95,
      render: (date) => (
        <>
          {moment(date).format("MM/DD/YY")}
          <br />
          <span style={{ fontSize: 11, color: "#888" }}>
            {moment(date).format("hh:mm A")}
          </span>
        </>
      ),
    },
    {
      title: "Action",
      width: 110,
      align: "center",
      render: (_, record) => (
        <Space size={6} wrap={false}>
          <Tooltip title="View Business Card">
            <button
              type="button"
              style={viewBtnStyle}
              onClick={() => openViewModal(record)}
            >
              <EyeOutlined />
            </button>
          </Tooltip>

          <Tooltip title="Edit Business Card">
            <button
              type="button"
              style={editBtnStyle}
              onClick={() => navigate(`/editBusinessCard/${record.id}`)}
            >
              <EditOutlined />
            </button>
          </Tooltip>

          <Tooltip title="Delete Business Card">
            <button
              type="button"
              style={deleteBtnStyle}
              onClick={() => handleDelete([record.id])}
            >
              <DeleteOutlined />
            </button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleDelete = (ids) => {
    if (!ids.length) return;

    Modal.confirm({
      title: "Delete Business Card",
      content: `Are you sure you want to delete ${
        ids.length > 1 ? "these business cards" : "this business card"
      }?`,
      onOk: async () => {
        try {
          await DeleteBusinessCard(ids, localStorage.getItem("adminToken"));
          message.success("Business Card deleted successfully");

          getData();
        } catch {
          message.error("Failed to delete Business Card");
        }
      },
    });
  };

  const safeParse = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  };

  const socialMedia =
    typeof selectedCard?.social_media === "string"
      ? JSON.parse(selectedCard.social_media)
      : selectedCard?.social_media || {};

  const instagramLinks = Object.entries(socialMedia)
    .filter(([key]) => key.startsWith("instagram"))
    .sort(([a], [b]) => {
      const aNum = a === "instagram" ? 0 : parseInt(a.replace("instagram", ""));
      const bNum = b === "instagram" ? 0 : parseInt(b.replace("instagram", ""));
      return aNum - bNum;
    });

  const renderTagsList = (items, color = "default") => {
    if (!Array.isArray(items) || !items.length) {
      return (
        <span style={{ color: "#999", fontSize: "13px" }}>Not provided</span>
      );
    }

    return (
      <Space wrap style={{ marginTop: 4 }}>
        {items.map((item, idx) => {
          const val =
            typeof item === "object" ? item.note || JSON.stringify(item) : item;
          return (
            <Tag
              key={idx}
              color={color}
              style={{
                padding: "4px 12px",
                fontSize: "13px",
                borderRadius: "4px",
              }}
            >
              {val}
            </Tag>
          );
        })}
      </Space>
    );
  };

  const galleryImages =
    selectedCard?.images?.filter((x) => x.file_type === "image") || [];

  const galleryVideos =
    selectedCard?.images?.filter((x) => x.file_type === "video") || [];

  const InfoSection = ({ icon, title, children, noDivider }) => (
    <>
      <div style={{ marginBottom: 24 }}>
        <h4
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#ff4d8d",
            marginBottom: 16,
            fontSize: 15,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {icon} {title}
        </h4>
        <div style={{ paddingLeft: 4 }}>{children}</div>
      </div>
      {!noDivider && (
        <Divider style={{ margin: "20px 0", borderColor: "#f0f0f0" }} />
      )}
    </>
  );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(selectedCard?.business_card_qr || "");
      message.success("Link copied");
    } catch {
      message.error("Failed to copy link");
    }
  };

  return (
    <Box>
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
            Digital Business Cards
          </h3>
          <p
            className="page-sub-title"
            style={{ margin: "4px 0 0 0", color: "#666", fontSize: 13 }}
          >
            Review, manage, and approve submitted digital business cards.
          </p>
        </div>

        <Box display="flex" alignItems="center" gap="12px">
          <span className="p-input-icon-left">
            <InputText
              type="search"
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search Business Card..."
              style={{ height: "42px", borderRadius: "6px" }}
            />
          </span>

          <Button
            icon="pi pi-plus"
            style={{
              height: "42px",
              borderRadius: "6px",
              background: "#23b8cb",
              borderColor: "#23b8cb",
              marginLeft: "8px",
            }}
            onClick={() => navigate("/addBusinessCard")}
          />
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
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* View Details Modal */}
      <Modal
        title={null}
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        width={1000}
        footer={null}
        bodyStyle={{ padding: 0 }}
        centered
        style={{ borderRadius: "12px", overflow: "hidden" }}
      >
        {selectedCard && (
          <div>
            <div
              style={{
                background: "linear-gradient(135deg, #111111 0%, #2c3e50 100%)",
                padding: "32px",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <Avatar
                  size={90}
                  src={selectedCard?.profile_image}
                  style={{
                    border: "3px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                    backgroundColor: "#fff",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        color: "white",
                        fontSize: 26,
                        fontWeight: 700,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {selectedCard?.name}
                    </h2>
                    <Space size={4}>
                      <Tag
                        color={
                          selectedCard.status === "accepted"
                            ? "success"
                            : selectedCard.status === "rejected"
                              ? "error"
                              : "warning"
                        }
                      >
                        Card: {selectedCard.status?.toUpperCase()}
                      </Tag>

                      <Tag
                        color={getPurchaseInfo(selectedCard).color}
                      >
                        {getPurchaseInfo(selectedCard).label}
                      </Tag>

                      <Tag
                        color={
                          selectedCard.created_by_admin ? "blue" : "purple"
                        }
                      >
                        {selectedCard.created_by_admin
                          ? "Created by Admin"
                          : "Created from Website"}
                      </Tag>

                      {selectedCard?.elite_setup && (
                        <Tag color="gold">ELITE SETUP</Tag>
                      )}
                    </Space>
                  </div>

                  <p
                    style={{
                      margin: "4px 0",
                      color: "#ff4d8d",
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    {selectedCard?.professional_title}
                  </p>

                  {/* <p
                    style={{
                      margin: 0,
                      color: "rgba(255,255,255,0.75)",
                      fontSize: 13,
                    }}
                  >
                    {selectedCard?.business_name || "Independent"}{" "}
                    {selectedCard?.custom_handle &&
                      `• @${selectedCard.custom_handle}`}
                  </p> */}

                  {selectedCard.business_card_link && (
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                      }}
                    >
                      <GlobalOutlined
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      />
                      <a
                        href={selectedCard?.business_card_link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "rgba(255,255,255,0.85)",
                          textDecoration: "underline",
                        }}
                      >
                        Live Digital Card Link
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "24px 32px",
                maxHeight: "65vh",
                overflowY: "auto",
                backgroundColor: "#fcfcfc",
              }}
            >
              <Row gutter={32}>
                <Col span={15}>
                  <InfoSection icon={<MailOutlined />} title="Contact details">
                    <Row gutter={[16, 12]}>
                      <Col span={12}>
                        <div style={{ fontSize: "12px", color: "#888" }}>
                          Email Address
                        </div>
                        <a
                          href={`mailto:${selectedCard.email}`}
                          style={{ color: "#222", fontWeight: 500 }}
                        >
                          {selectedCard.email}
                        </a>
                      </Col>
                      <Col
                        span={12}
                        style={{
                          borderLeft: "1px solid #eee",
                          paddingLeft: 16,
                        }}
                      >
                        <div style={{ fontSize: "12px", color: "#888" }}>
                          Phone Number
                        </div>
                        <a
                          href={`tel:${selectedCard.phone}`}
                          style={{ color: "#222", fontWeight: 500 }}
                        >
                          {selectedCard.phone}
                        </a>
                      </Col>
                      {selectedCard.website && (
                        <Col span={24} style={{ marginTop: 4 }}>
                          <div style={{ fontSize: "12px", color: "#888" }}>
                            Website
                          </div>
                          <a
                            href={selectedCard.website}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#ff4d8d", fontWeight: 500 }}
                          >
                            {selectedCard.website}
                          </a>
                        </Col>
                      )}
                    </Row>
                  </InfoSection>

                  <InfoSection
                    icon={<InfoCircleOutlined />}
                    title="Account Information"
                  >
                    <Row gutter={[16, 12]}>
                      <Col span={12}>
                        <div style={{ fontSize: 12, color: "#888" }}>
                          NFC Card
                        </div>

                        <Tag
                          color={
                            selectedCard.nfc_status === "paid"
                              ? "success"
                              : "warning"
                          }
                          style={{ marginTop: 6 }}
                        >
                          {selectedCard.nfc_status
                            ?.replace("_", " ")
                            ?.toUpperCase()}
                        </Tag>
                      </Col>

                      <Col span={12}>
                        <div style={{ fontSize: 12, color: "#888" }}>
                          Subscription
                        </div>

                        <Tag
                          color={
                            selectedCard.business_user?.subscription_status?.toLowerCase() ===
                            "active"
                              ? "success"
                              : "default"
                          }
                          style={{ marginTop: 6 }}
                        >
                          {selectedCard.business_user?.subscription_status
                            ? selectedCard.business_user.subscription_status.toUpperCase()
                            : "NONE"}
                        </Tag>
                      </Col>

                      <Col span={12} style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 12, color: "#888" }}>
                          Card Source
                        </div>

                        <Tag
                          color={
                            selectedCard.created_by_admin ? "blue" : "purple"
                          }
                          style={{ marginTop: 6 }}
                        >
                          {selectedCard.created_by_admin
                            ? "Created by Admin"
                            : "Created by Website"}
                        </Tag>
                      </Col>
                    </Row>
                  </InfoSection>

                  <InfoSection
                    icon={<CalendarOutlined />}
                    title="Booking & Integration"
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div>
                        <span style={{ color: "#777" }}>Ways To Connect:</span>{" "}
                        <strong>
                          {selectedCard.preferred_booking_method || "N/A"}
                        </strong>
                      </div>
                      {selectedCard.booking_link && (
                        <div>
                          <span style={{ color: "#777" }}>Link:</span>{" "}
                          <a
                            href={selectedCard.booking_link}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#ff4d8d" }}
                          >
                            {selectedCard.booking_link}
                          </a>
                        </div>
                      )}
                    </div>
                  </InfoSection>

                  {(socialMedia.instagram ||
                    socialMedia.tiktok ||
                    socialMedia.linkedin ||
                    socialMedia.youtube ||
                    socialMedia.facebook) && (
                    <InfoSection
                      icon={<InstagramOutlined />}
                      title="Social networks"
                    >
                      <Space wrap size="small">
                        {instagramLinks.map(([key, url], index) => (
                          <Tag
                            key={key}
                            color="purple"
                            style={{ cursor: "pointer" }}
                            onClick={() => window.open(url, "_blank")}
                          >
                            Instagram {index + 1}
                          </Tag>
                        ))}
                        {socialMedia.tiktok && (
                          <Tag
                            color="cyan"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              window.open(socialMedia.tiktok, "_blank")
                            }
                          >
                            TikTok
                          </Tag>
                        )}
                        {socialMedia.linkedin && (
                          <Tag
                            color="blue"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              window.open(socialMedia.linkedin, "_blank")
                            }
                          >
                            LinkedIn
                          </Tag>
                        )}
                        {socialMedia.youtube && (
                          <Tag
                            color="red"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              window.open(socialMedia.youtube, "_blank")
                            }
                          >
                            YouTube
                          </Tag>
                        )}
                        {socialMedia.facebook && (
                          <Tag
                            color="geekblue"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              window.open(socialMedia.facebook, "_blank")
                            }
                          >
                            Facebook
                          </Tag>
                        )}
                      </Space>
                    </InfoSection>
                  )}

                  {safeParse(selectedCard?.other_links)?.length > 0 && (
                    <InfoSection
                      icon={<GlobalOutlined />}
                      title="Press & external links"
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        {safeParse(selectedCard.other_links).map((link, i) => (
                          <div key={i} style={{ marginBottom: 10 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "13px",
                                marginBottom: 2,
                              }}
                            >
                              {link.title || "External Link"}
                            </div>

                            <a
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: "#ff4d8d",
                                textDecoration: "underline",
                              }}
                            >
                              {link.url}
                            </a>
                          </div>
                        ))}
                      </div>
                    </InfoSection>
                  )}

                  {selectedCard.bio && (
                    <InfoSection
                      icon={<InfoCircleOutlined />}
                      title="Professional Overview"
                    >
                      <div
                        style={{
                          color: "#333",
                          lineHeight: 1.6,
                          fontSize: "14px",
                        }}
                        dangerouslySetInnerHTML={{ __html: selectedCard.bio }}
                      />
                    </InfoSection>
                  )}

                  <InfoSection
                    icon={<StarOutlined />}
                    title="Specialties & Focus"
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#888",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Additional Scope
                    </span>
                    {renderTagsList(
                      safeParse(selectedCard.specialties),
                      "blue",
                    )}
                  </InfoSection>

                  <InfoSection
                    icon={<TrophyOutlined />}
                    title="Platform Insights"
                  >
                    <div style={{ marginBottom: 12 }}>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#777",
                          fontWeight: 500,
                        }}
                      >
                        Key business complications:
                      </span>
                      <div style={{ marginTop: 4 }}>
                        {renderTagsList(
                          safeParse(selectedCard.biggest_pain_points),
                          "volcano",
                        )}
                      </div>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#777",
                          fontWeight: 500,
                        }}
                      >
                        Key expectations from platform:
                      </span>
                      <div style={{ marginTop: 4 }}>
                        {renderTagsList(
                          safeParse(selectedCard.excites_about_glamlink),
                          "green",
                        )}
                      </div>
                    </div>
                  </InfoSection>

                  {selectedCard.offer_promotion && (
                    <InfoSection
                      icon={<GiftOutlined />}
                      title="Special promotion campaign"
                      noDivider
                    >
                      <div
                        style={{
                          background: "#fff0f6",
                          border: "1px dashed #ffadd2",
                          padding: "14px",
                          borderRadius: "8px",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color: "#c41d7f",
                            fontWeight: 500,
                          }}
                        >
                          {selectedCard.promotion_details}
                        </p>
                      </div>
                    </InfoSection>
                  )}
                </Col>

                <Col span={9} style={{ borderLeft: "1px solid #f0f0f0" }}>
                  <InfoSection
                    icon={<EnvironmentOutlined />}
                    title="Active addresses"
                  >
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size="small"
                    >
                      {selectedCard.locations?.map((loc) => (
                        <div
                          key={loc.id}
                          style={{
                            background: "#f5f5f5",
                            padding: "10px 14px",
                            borderRadius: "6px",
                            borderLeft: "3px solid #ff4d8d",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: "13px",
                              color: "#222",
                            }}
                          >
                            {loc.label || "Branch Hub"}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              marginTop: 2,
                            }}
                          >
                            {loc.location_type === "city_only"
                              ? `${loc.city}${loc.state ? `, ${loc.state}` : ""}`
                              : loc.address}
                          </div>
                        </div>
                      ))}
                    </Space>
                  </InfoSection>

                  <InfoSection
                    icon={<ClockCircleOutlined />}
                    title="Operating schedule"
                  >
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size="4px"
                    >
                      {selectedCard.business_hour?.map((h) => (
                        <div
                          key={h.id}
                          style={{
                            padding: "6px 12px",
                            background: "#f9f9f9",
                            borderRadius: 4,
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "12px",
                          }}
                        >
                          <span
                            style={{
                              fontStyle: "italic",
                              color: "#666",
                            }}
                          >
                            {h.note}
                          </span>
                        </div>
                      ))}
                    </Space>
                  </InfoSection>

                  <InfoSection
                    icon={<PictureOutlined />}
                    title="Media parameters"
                    noDivider
                  >
                    {galleryImages.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#777",
                            marginBottom: 6,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <PictureOutlined /> Showcase Cards
                        </div>
                        <Image.PreviewGroup>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(2, 1fr)",
                              gap: 8,
                            }}
                          >
                            {galleryImages.map((img) => (
                              <Image
                                key={img.id}
                                src={img.file_uri}
                                alt="Gallery Portfolio"
                                width="100%"
                                style={{
                                  borderRadius: 4,
                                  objectFit: "cover",
                                  height: "70px",
                                }}
                              />
                            ))}
                          </div>
                        </Image.PreviewGroup>
                      </div>
                    )}

                    {galleryVideos.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#777",
                            marginBottom: 6,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <VideoCameraOutlined /> Production Material
                        </div>
                        {galleryVideos.map((video) => (
                          <video
                            key={video.id}
                            controls
                            width="100%"
                            style={{
                              borderRadius: 6,
                              marginBottom: 6,
                              maxHeight: "110px",
                              background: "#000",
                            }}
                          >
                            <source src={video.file_uri} type="video/mp4" />
                          </video>
                        ))}
                      </div>
                    )}
                  </InfoSection>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>

      {/* QR Code Modal */}
      <Modal
        open={qrModalOpen}
        footer={null}
        onCancel={() => setQrModalOpen(false)}
        centered
        width={500}
      >
        <div
          style={{
            textAlign: "center",
            padding: "10px 20px 24px",
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ marginBottom: 6, fontWeight: 700 }}>
              Digital Business Card QR
            </h2>
            <p style={{ color: "#666", margin: 0 }}>
              Scan this QR code to instantly access the digital business card.
            </p>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#ff4d8d",
                marginBottom: 16,
              }}
            >
              {selectedCard?.name}
            </div>
          </div>

          <div
            style={{
              background: "#fafafa",
              padding: 20,
              borderRadius: 16,
              display: "inline-block",
              border: "1px solid #f0f0f0",
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            }}
          >
            <img
              src={selectedCard?.business_card_qr}
              alt="Business Card QR"
              style={{
                width: 280,
                height: 280,
                objectFit: "contain",
              }}
            />
          </div>

          {selectedCard?.business_card_link && (
            <div
              style={{
                marginTop: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#fafafa",
                border: "1px solid #f0f0f0",
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div
                onClick={handleCopyLink}
                title="Copy Link"
                style={{
                  width: 34,
                  height: 34,
                  minWidth: 34,
                  borderRadius: 8,
                  background: "#fff0f6",
                  border: "1px solid #ffadd2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#eb2f96",
                }}
              >
                <CopyOutlined />
              </div>

              <div
                style={{
                  flex: 1,
                  fontSize: 12,
                  color: "#666",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "left",
                }}
              >
                {selectedCard.business_card_qr}
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 20,
              background: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: 12,
              padding: "14px 16px",
              textAlign: "left",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              📱 Scan & Open
            </div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
              Open your phone camera and scan this QR code to instantly access
              this digital business card. Perfect for sharing contact details,
              booking information, social profiles, and portfolio links.
            </div>
          </div>
        </div>
      </Modal>
    </Box>
  );
};

export default BusinessCard;