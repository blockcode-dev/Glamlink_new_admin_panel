/** @format */

import React from "react";
import { useState } from "react";
import { CreateAdmin } from "../../services/Api/Api";
import { useNavigate } from "react-router";
import { message, Button, Card, Form, Input, Select } from "antd";

import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../utils/apiError";
import { clearSession } from "../../utils/session";

const AddAdmin = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    if (!name) {
      message.error("Please enter name");

      return;
    }
    if (!email) {
      message.error("Please enter email");
      return;
    }
    if (!roleId) {
      message.error("Please choose any Role");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("role_id", String(parseInt(roleId, 10)));

      const response = await CreateAdmin(formData);

      if (response.status === 201) {
        message.success("Admin added successfully");
      }
      setTimeout(() => {
        navigate("/adminList");
      }, 1000);
    } catch (error) {
      if (apiErrorStatus(error) === 400) {
        message.error("Email already exists");
      } else if (apiErrorStatus(error) === 401) {
        message.error("Token expired");
        clearSession();
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        message.error("Something went wrong");
      }
    }
  };

  const navigateToAdmin = () => {
    navigate("/adminList");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
       <div style={{ marginBottom: "50px" }}>
       <h3 className="page-title">Create New Admin</h3>
        <p className="page-sub-title">Create New Admin</p>
       </div>
      </div>
      <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
        <Card style={{ width: "100%",padding:"20px" }}>
          <div>
            <Form layout="vertical">
              <Form.Item label="Name">

                <Input
                  required
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="new_form_control" />
              </Form.Item>

              <Form.Item label="Email">

                <Input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="new_form_control"
                />
              </Form.Item>

              <Form.Item label="Select Role :">
                <Select
                  placeholder="Select Role"
                  value={roleId || undefined}
                  onChange={(value) => setRoleId(value)}
                  className="new_form_control"
                  options={[
                    { value: "1", label: "ADMIN" },
                    { value: "2", label: "ADMIN LEVEL 1" },
                    { value: "3", label: "ADMIN LEVEL 2" },
                  ]}
                />
              </Form.Item>

              <div style={{marginTop:"50px"}}>
                <Button
                  htmlType="submit"
                  type="primary"
                  onClick={handleSubmit}
                  style={{
                    borderRadius: "5px",
                    margin: "0px 0px"
                  }}
                  icon={<CheckOutlined />}
                  size="large"
                >
                  Save
                </Button>

                <Button
                  onClick={(e) => {
                    navigateToAdmin();
                  }}
                  style={{
                    borderRadius: "5px",
                    marginLeft: "10px"
                  }}
                  icon={<CloseOutlined />}
                  size="large"
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AddAdmin;
