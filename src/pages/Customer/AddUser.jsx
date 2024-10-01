/** @format */

import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Form, Select, Input, Row, Col, message } from "antd";
import { AddUser, getAllCityByStateId, getAllState } from "../../services/Api/UserApi";
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";

const AddCustomer = () => {
  const [form] = Form.useForm();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [disable, setDisable] = useState(false);
  const [allState, setAllState] = useState([{ id: 0, name: "Please wait ..." }]);
  const [allCity, setAllCity] = useState([{ id: 0, name: "Please wait ..." }]);
  const [selectedStateId, setSelectedStateId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllState = async () => {
      const stateData = await getAllState();
      if (Array.isArray(stateData.data)) {
        setAllState(stateData.data);
      } else {
        message.error("Failed to fetch states");
      }
    };
    fetchAllState();
  }, []);

  useEffect(() => {
    const fetchCitiesByStateId = async () => {
      if (selectedStateId) {
        const cityData = await getAllCityByStateId(selectedStateId);
        if (Array.isArray(cityData.data.all_city)) {
          setAllCity(cityData.data.all_city);
        } else {
          message.error("Failed to fetch cities");
        }
      }
    };
    fetchCitiesByStateId();
  }, [selectedStateId]);

  const handleStateChange = (value) => {
    setSelectedStateId(value);
    setAllCity([{ id: 0, name: "Please wait ..." }]);
  };

  const handleSubmit = async (values) => {
    setDisable(true);

    try {
      const response = await AddUser({
        email: values.email,
        name: values.name,
        role_id: "6",
      });

      if (response.status === 200) {
        message.success("User added successfully");
        setTimeout(() => {
          navigate("/users");
        }, 1000);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        message.error("Email already exists");
      } else if (error.response.status === 401) {
        message.error("Token expired");
        localStorage.removeItem("adminToken");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        message.error("Something went wrong");
      }
    } finally {
      setDisable(false);
    }
  };

  const navigateToUser = () => {
    navigate("/users");
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="20px">
        <div>
          <h3 className="page-title">USER MANAGEMENT</h3>
          <p className="page-sub-title">Create New User</p>
        </div>
        <div>
          <Button
            icon="pi pi-arrow-left"
            severity="secondary"
            onClick={navigateToUser}
            style={{ borderRadius: "5px", height: "47px" }}
          >
            <span style={{ marginLeft: "5px" }}>Return to Users</span>
          </Button>
        </div>
      </Box>
      <Card>
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email address"
            rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: "Please enter password" }]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['password']}
                rules={[
                  { required: true, message: "Please confirm password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Enter password again" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="state"
            label="Select State"
            rules={[{ required: true, message: "Please select a state" }]}
          >
            <Select placeholder="Select state" onChange={handleStateChange}>
              {Array.isArray(allState) && allState.map((state) => (
                <Select.Option key={state.id} value={state.id}>
                  {state.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="city"
            label="Select City"
            rules={[{ required: true, message: "Please select a city" }]}
          >
            <Select placeholder="Select city">
              {Array.isArray(allCity) && allCity.map((city) => (
                <Select.Option key={city.id} value={city.id}>
                  {city.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ marginTop: "40px" }}>
            <Button
              icon="pi pi-check"
              severity="info"
              type="submit"
              disabled={disable}
              style={{ height: "45px", padding: "20px", borderRadius: "5px" }}
            >
              {disable ? "Saving...." : "Save"}
            </Button>

            <Button
              icon="pi pi-times"
              severity="secondary"
              onClick={navigateToUser}
              style={{ marginLeft: "10px", marginTop: "10px", height: "45px", padding: "20px", borderRadius: "5px" }}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Card>
    </Box>
  );
};

export default AddCustomer;
