import React, { useState } from "react";
import { AdminLogin } from "../../services/Api/Api";
import "./Login.scss";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { Form, Input } from "antd";
import { message } from "antd";
import logo from "../../assets/glamlink in black (1).png";
const Login = () => {
  const navigate = useNavigate();
  const onFinish = (values) => {
    let formData = {
      email: values.email,
      password: values.password,
    };
    AdminLogin(formData)
      .then((res) => {
        message.success("Logged In Successfully");
        setTimeout(() => {
          const token = res?.data?.data?.token;
          localStorage.removeItem("adminToken");
          localStorage.setItem("adminToken", token);
          navigate("/");
        }, 1000);
      })
      .catch((error) => {
        if (error.response.data.message === "User not found.") {
          message.error("Email Doesn't Exist");
        } else if (
          error.response.data.message ===
          "Invalid email or password. Please try again."
        ) {
          message.error("Invalid Password");
        } else if (
          error.response.data.message ===
          "Please Enter Required Fields : [ email_id || password ]"
        ) {
          message.error("Please enter Required Fields");
        }
      });
  };
  const onFinishFailed = (errorInfo) => {};

  return (
    <div className="LoginContainer">
      <div className="Login">
        <div className="Login_Container">
          <div className="LogoContainer">
            <img src={logo} alt="Logo" className="Logo" />
            {/* <h1 style={{ marginBottom: "10px", marginLeft: "10px" }}>
            Mobile Pool 
            </h1> */}
          </div>
          <div className="heading_two_content">
            <h2 className="heading_2">Hi, Welcome Back</h2>
            <span className="heading_two_item">
              Enter Your Credentials To continue
            </span>
          </div>

          <Form
            name="basic"
            layout="vertical"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please enter your EmailId",
                },
              ]}
            >
              <Input
                style={{
                  height: "55px",
                  borderRadius: "10px",
                  borderColor: "var(--color-c3d4da)",
                  boxShadow: "none",
                }}
              />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please enter your Password",
                },
              ]}
            >
              <Input.Password
                style={{
                  height: "55px",
                  borderRadius: "10px",
                  borderColor: "var(--color-c3d4da)",
                  boxShadow: "none",
                }}
              />
            </Form.Item>
            <div className="button_div">
              <Button
                severity="secondary"
                htmlType="submit"
                className="login_button"
              >
                SIGN IN
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};
export default Login;
