import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { AdminLogin } from "../../services/Api/Api";
import "./Login.scss";
import { Button } from "primereact/button";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/logo.png";
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { email, password } = formData;
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function onSubmit(e) {
    try {
      e.preventDefault();

      let result = await AdminLogin(formData);

      if (result.status === 200) {
        toast.success("Logged In!", {
          position: "top-right",
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        localStorage.setItem("adminToken", result?.data?.data?.token);
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);

      if (error.response && error.response.status === 401) {
        toast.error("Invalid Password!", {
          position: "top-right",
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } else if (error.response && error.response.status === 404) {
        toast.error("Email Doesn't exist", {
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
        toast.error("Please Enter Required Fields", {
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
    }
  }

  return (
    <div className="LoginContainer">
      <ToastContainer />
      <div className="Login">
        <div className="Login_Container">
          <div className="LogoContainer">
            <img src={logo} alt="Logo" className="Logo" />
            <h1 style={{ marginBottom: "10px", marginLeft: "10px" }}>
              Logistic
            </h1>
          </div>
          <div className="heading_two_content">
            <h2 className="heading_2">Hi, Welcome Back</h2>
            <span className="heading_two_item">
              Enter Your Credentials To continue
            </span>
          </div>

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label >Email Address:</Form.Label>
            <Form.Control 
            className="login_form_control"
              name="email"
              onChange={(e) => onChange(e)}
              type="email"
              placeholder="Enter email"
            />
          </Form.Group>
          <Form.Group className="mb-3" style={{ position: "relative" }}>
            <Form.Label>Password:</Form.Label>
            <div
              className="password-toggle-icon"
              onClick={handleTogglePassword}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </div>
            <Form.Control
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              onChange={(e) => onChange(e)}
            />
            <div className="forget-password-link">
              <h6>Forget Password?</h6>
            </div>
          </Form.Group>
          <div className="button_div">
            <Button
              severity="secondary"
              onClick={(e) => {
                onSubmit(e);
              }}
              className="login_button"
            
            >
              SIGN IN
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
