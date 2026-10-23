import React from "react";
import "./Error401.css";
import { useNavigate } from "react-router";
import AccessImage from "../../assets/access-denied-5627546-4694106.webp";
import { Button } from "antd";

const Error401 = () => {
  const navigate = useNavigate();
  const navigateToDashboard = () => {
    navigate("/");
  };

  return (
    <div className="main_container">
      <img src={AccessImage} alt="Access Denied" className="error_image" />
      <div className="main_box">
        <div className="error_heading">
          You are not allowed to access this page
        </div>
        <p style={{
          color: "var(--color-text-secondary)",
          marginTop: 24,
          marginBottom: 24
        }}>
          You have been denied access to this page. Please check your
          permissions.
        </p>
      </div>
      <div className="back_button">
        <Button
          style={{
            borderRadius: "5px"
          }}
          onClick={navigateToDashboard}
          type="primary"
          size="large">Back To Dashboard</Button>
      </div>
    </div>
  );
};

export default Error401;
