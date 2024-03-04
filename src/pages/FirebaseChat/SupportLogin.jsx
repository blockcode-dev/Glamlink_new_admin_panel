import React from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { Form, Input } from "antd";
import { message } from "antd";
import { AdminLogin } from "../../services/Api/Api";

const SupportLogin = () => {
  const navigate = useNavigate();
  const navigateToDashboard = () => {
    navigate("/chats");
  };

  const onFinish = (values) => {
    let formData = {
      email: "anshitavaryani@gmail.com",
      password: "68h5yrjzql",
    };
    AdminLogin(formData)
      .then((res) => {
        message.success(res?.data?.message);
        setTimeout(() => {
          const token = res?.data?.data?.token;
          localStorage.removeItem("chatToken");
          localStorage.setItem("chatToken", token);
          navigate("/chats");
        }, 1000);
      })
      .catch((error) => {
        if (error.response.data.message === "Error: User not found.") {
          message.error("Email Doesn't Exist");
        } else if (
          error.response.data.message ===
          "Error: Invalid email or password. Please try again."
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

  const hardcodedEmail = "anshitavaryani@gmail.com";
  const hardcodedPassword = "68h5yrjzql";

  // const onFinish = (values) => {
  //   const enteredEmail = values.email;
  //   const enteredPassword = values.password;

  //   // Check against hardcoded email and password
  //   if (enteredEmail === hardcodedEmail && enteredPassword === hardcodedPassword) {
  //     message.success("Login Successful");
  //     setTimeout(() => {
  //       navigate("/chats");
  //     }, 1000);
  //   } else {
  //     // Display error message for invalid credentials
  //     message.error("Invalid Email or Password");
  //   }
  // };

  const onFinishFailed = (errorInfo) => {};

  return (
    <div className="LoginContainer">
      <div className="Login">
        <div className="Login_Container">
          <div className="heading_two_content">
            <h2 className="heading_2">SUPPORT LOGIN</h2>
            <span className="heading_two_item">
              Your credentials to log in as support will be hidden for security purposes.
            </span>
          </div>

          <Form
            name="basic"
            layout="vertical"
            initialValues={{
              email: hardcodedEmail, // Set the default value for email
              password: hardcodedPassword, // Set the default value for password
              remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            disabled
          >
            <Form.Item label="Email Address" name="email">
              <Input
                style={{
                  height: "55px",
                  borderRadius: "10px",
                  borderColor: "var(--color-c3d4da)",
                  boxShadow: "none",
                }}
              />
            </Form.Item>
            <Form.Item label="Password" name="password">
              <Input.Password
                style={{
                  height: "55px",
                  borderRadius: "10px",
                  borderColor: "var(--color-c3d4da)",
                  boxShadow: "none",
                }}
                // Disable the password visibility toggle
                visibilityToggle={false}
                disabled
              />
            </Form.Item>
            <div className="redirection_button">
              <Button
                label="Back To Home"
                severity="secondary"
                style={{
                  borderRadius: "5px",
                  height: "45px",
                  marginLeft: "10px",
                }}
                onClick={navigateToDashboard}
              />
              <Button
                severity="secondary"
                htmlType="submit"
                style={{
                  borderRadius: "5px",
                  height: "45px",
                  marginLeft: "10px",
                  marginRight: "10px",
                  width: "365px",
                  backgroundColor: "#8B0D0E",
                  border: "none",
                  justifyContent: "center",
                }}
              >
                LOGIN FOR CHAT
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SupportLogin;
