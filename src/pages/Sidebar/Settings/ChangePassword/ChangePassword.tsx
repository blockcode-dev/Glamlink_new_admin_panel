import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { EyeOutlined, EyeInvisibleOutlined, KeyOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { ChangeAdminPassword } from "../../../../services/Api/Api";
import { apiErrorMessage } from "../../../../utils/apiError";
import { clearSession } from "../../../../utils/session";

const { Title, Text } = Typography;

const ChangePassword = () => {
  const navigate = useNavigate();
  const navigateToDashboard = () => {
    navigate("/");
  };

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

const handleChangePassword = async () => {
  if (
    oldPassword?.length === 0 ||
    newPassword?.length === 0 ||
    confirmPassword?.length === 0
  ) {
    message.error("Please enter valid input");
    return;
  }

  if (newPassword !== confirmPassword) {
    message.error("New Password and Confirm Password do not match");
    return;
  }

  const formData = new FormData();
  formData.append("old_password", oldPassword);
  formData.append("new_password", newPassword);
  formData.append("confirm_password", confirmPassword);

  setSaving(true);

  try {
    const res = await ChangeAdminPassword(formData);

    if (res?.status === 200) {
      // A new password ends every session, this one included.
      message.success("Password changed. Please sign in with your new password.");
      clearSession();
    } else {
      message.error(res?.data?.message || "Failed to change password");
    }
  } catch (error) {
    message.error(apiErrorMessage(error) || "Something went wrong");
  } finally {
    setSaving(false);
  }
};

  return (
    <div>
      {/* Header Section */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 10,
          border: "1px solid var(--color-border)",
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Change Password
        </Title>
        <Text type="secondary">Update your account password</Text>
      </Card>

      <Card
        style={{
          borderRadius: 10,
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Intro banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--color-primary-soft)",
            border: "1px solid var(--color-primary-border)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--color-primary)",
              color: "var(--color-on-primary)",
              flexShrink: 0,
              fontSize: 18,
            }}
          >
            <KeyOutlined />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>
              Update Your Password
            </div>
            <div style={{ fontSize: 12, color: "var(--color-primary)", marginTop: 2 }}>
              Choose a strong password you haven't used before.
            </div>
          </div>
        </div>

        <Form layout="vertical" onFinish={handleChangePassword}>
          <Form.Item label="Current Password" required>
            <Input.Password
              size="large"
              placeholder="Enter current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item label="New Password" required>
            <Input.Password
              size="large"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item label="Confirm Password" required>
            <Input.Password
              size="large"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              style={{ borderRadius: 6, marginRight: 12 }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={navigateToDashboard}
              style={{ borderRadius: 6 }}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;