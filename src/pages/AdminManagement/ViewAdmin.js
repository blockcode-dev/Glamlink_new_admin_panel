import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetAdminProfile } from "../../services/Api/Api.jsx";
import { Box } from "@mui/material";
import { Card, Typography, Button, Row, Col } from "antd";
import { ArrowLeftOutlined, UserOutlined, MailOutlined, SafetyOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ViewAdmin = () => {
  const [idData, setIdData] = useState({});
  const navigate = useNavigate();

  const getData = async () => {
    try {
      let result = await GetAdminProfile(localStorage.getItem("adminToken"));
      setIdData(result.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const navigateToAdmin = () => {
    navigate("/");
  };

  const fields = [
    { label: "Name", value: idData?.name, icon: <UserOutlined /> },
    { label: "Email", value: idData?.email, icon: <MailOutlined /> },
    {
      label: "Role",
      value: idData?.admin_role?.name,
      icon: <SafetyOutlined />,
    },
  ];

  return (
    <Box>
      {/* Header Section */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 10,
          border: "1px solid #eef0f2",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Admin Profile
            </Title>
            <Text type="secondary">View your admin account details</Text>
          </div>

          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={navigateToAdmin}
            style={{ borderRadius: 8, height: 42, fontWeight: 600 }}
          >
            Return to Dashboard
          </Button>
        </div>
      </Card>

      <Card
        style={{
          borderRadius: 10,
          border: "1px solid #eef0f2",
        }}
      >
        {/* Intro banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#eef2ff",
            border: "1px solid #e0e7ff",
            borderRadius: 10,
            padding: "14px 18px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#4f46e5",
              color: "#fff",
              flexShrink: 0,
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {idData?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1e1b4b" }}>
              {idData?.name || "—"}
            </div>
            <div style={{ fontSize: 12.5, color: "#4338ca", marginTop: 2 }}>
              {idData?.admin_role?.name || "Admin"}
            </div>
          </div>
        </div>

        {/* Fields */}
        <Row gutter={[24, 24]}>
          {fields.map(({ label, value, icon }) => (
            <Col xs={24} sm={8} key={label}>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#6b7280",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14.5,
                  color: "#111827",
                  fontWeight: 500,
                }}
              >
                <span style={{ color: "#9ca3af" }}>{icon}</span>
                {value || "--"}
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </Box>
  );
};

export default ViewAdmin;