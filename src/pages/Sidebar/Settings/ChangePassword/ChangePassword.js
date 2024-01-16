import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import { Button } from "primereact/button";
import "./ChangePassword.css";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ChangeAdminPassword } from "../../../../services/Api/Api";
import { toast } from "react-toastify";
import { Card } from "primereact/card";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePassword = () => {
  const navigate = useNavigate();
  const navigateToDashboard = () => {
    navigate("/");
  };

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (
      oldPassword?.length === 0 ||
      newPassword?.length === 0 ||
      confirmPassword?.length === 0
    ) {
      toast.error("Please enter valid input", {
        position: "top-right",
        autoClose: 500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Please enter valid input", {
        position: "top-right",
        autoClose: 500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    const formData = new FormData();
    formData.append("old_password", oldPassword);
    formData.append("new_password", newPassword);
    formData.append("confirm_password", confirmPassword);

    try {
      const res = await ChangeAdminPassword(formData);
      if (res?.status == 200) {
        toast.success(" Password changed !", {
          position: "top-right",
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } else {
        toast.error(res?.data?.message, {
          position: "top-right",
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message, {
        position: "top-right",
        autoClose: 500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h3 style={{ marginTop: "5px", marginBottom: "30px" }}>
          CHANGE PASSWORD
        </h3>
      </Box>
      <Card>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Current Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Current Password"
              onChange={(event) => {
                setOldPassword(event.target.value);
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3" style={{ position: "relative" }}>
            <Form.Label>New Password</Form.Label>
            <div
              className="new-password-toggle-icon"
              onClick={handleTogglePassword}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </div>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Enter New Password"
              onChange={(event) => {
                setNewPassword(event.target.value);
              }}
            />
          </Form.Group>

          <Form.Group className="mb-4" style={{ position: "relative" }}>
            <Form.Label>Confirm Password</Form.Label>
            <div
              className="confirm-password-toggle-icon"
              onClick={handleTogglePassword}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </div>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Enter Confirm Password"
              onChange={(event) => {
                setConfirmPassword(event.target.value);
              }}
            />
          </Form.Group>

          <Button
            icon="pi pi-check"
            severity="success"
            type="submit"
            onClick={handleChangePassword}
            style={{
              borderRadius: "10px",
              marginLeft: "10px",
              marginTop: "10px",
            }}
          >
            Save
          </Button>
          <Button
            // icon="pi pi-times"
            severity="secondary"
            onClick={(e) => {
              navigateToDashboard();
            }}
            style={{ borderRadius: "10px", marginLeft: "10px" }}
          >
            Cancel
          </Button>
        </Form>
      </Card>
    </Box>
  );
};

export default ChangePassword;
