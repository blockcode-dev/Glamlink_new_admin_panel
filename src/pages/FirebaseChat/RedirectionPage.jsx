import React from "react";
import "./Chat.css";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import AccessImage from "../../assets/not-selected-chat.png";
import { message } from "antd";
import { AdminLogin } from "../../services/Api/Api";

const RedirectionPage = () => {
  const navigate = useNavigate();
  const navigateToDashboard = () => {
    navigate("/");
  };

  const navigateToLoingForChat = () => {
    window.open("/supportLogin", "_blank");
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
          window.open("/chats", "_blank");
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

  return (
    <div className="main_container">
      <img
        src={AccessImage}
        alt="Access Denied"
        className="redirection_image"
      />
      <div className="main_box">
        <p className="text-muted my-4">
          To ensure the security of your chat interactions, we require a<br />
          separate login. Please use your chat-specific credentials to continue.
          <br />
          If you don't have a chat account or need assistance, you can click the
          <br />
          button below to return to the login page and create one. Thank you for
          <br />
          your understanding.
        </p>
      </div>
      <div className="redirection_button">
        <Button
          label="Back To Home"
          severity="secondary"
          style={{ borderRadius: "5px", height: "45px", marginLeft: "10px" }}
          onClick={navigateToDashboard}
        />
        <Button
      
          label="Click To Continue"
          iconPos="right"
          icon="pi pi-arrow-right"
          severity="warning"
          style={{ borderRadius: "5px", height: "45px", marginLeft: "10px" }}
          onClick={onFinish}
        />
      </div>
    </div>
  );
};

export default RedirectionPage;
