import React from "react";
import { AdminLogin } from "../../services/Api/Api";
import "./Login.scss";
import { useNavigate } from "react-router";
import { Form, Input, Button } from "antd";
import { message } from "antd";
import logo from "../../assets/glamlink-logo-black.png";
import { apiErrorMessage, apiErrorStatus } from "../../utils/apiError";
import { setToken } from "../../utils/session";

interface LoginValues {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const onFinish = (values: LoginValues) => {
    let formData = {
      email: values.email,
      password: values.password,
    };
    AdminLogin(formData)
      .then((res) => {
        const token = res?.data?.data?.token;
        if (!token) {
          message.error("Sign-in failed: the server sent no session. Please try again.");
          return;
        }
        message.success("Logged In Successfully");
        setTimeout(() => {
          setToken(token);
          navigate("/");
        }, 1000);
      })
      .catch((error) => {
        // Every failed sign-in answers 401 "Invalid email or password."; too many tries answer 429.
        message.error(
          apiErrorStatus(error) === 429
            ? "Too many sign-in attempts. Please wait 15 minutes and try again."
            : (apiErrorMessage(error) ?? "Sign-in failed. Please try again."),
        );
      });
  };
  const onFinishFailed = () => {};

  return (
    <div className="LoginContainer">
      <div className="Login">
        <div className="Login_Container">
          <div className="LogoContainer">
            <img src={logo} alt="Logo" className="Logo" />
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
                  borderColor: "var(--color-border-strong)",
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
                  borderColor: "var(--color-border-strong)",
                  boxShadow: "none",
                }}
              />
            </Form.Item>
            <div className="button_div">
              <Button htmlType="submit" className="login_button">
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
