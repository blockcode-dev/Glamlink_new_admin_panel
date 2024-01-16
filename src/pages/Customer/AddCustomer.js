import { Box } from "@mui/material";
import React from "react";
import { useState } from "react";
import Form from "react-bootstrap/Form";
import { AddUser } from "../../services/Api/Api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card } from "primereact/card";
import { Button } from "primereact/button";

const AddCustomer = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [disable, setDisable] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setDisable(true);

    if (!name) {
      toast.error("Please enter name ");
      return;
    }
    if (!email) {
      toast.error("Please enter  email");
      return;
    }
    if (!roleId) {
      toast.error("Please select User type");
      return;
    }

    try {
      const response = await AddUser({
        email: email,
        name: name,
        role_id: parseInt(roleId, 10),
      });

      if (response.status === 200) {
        toast.success("User added successfully");
      }
      setTimeout(() => {
        navigate("/customers");
      }, 1000);
      setDisable(false);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error("Email already exists", {
          position: "top-right",
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } else if (error.response.status === 401) {
        toast.error("Token expired");
        localStorage.removeItem("adminToken");
        setTimeout(() => {
          navigate("/Login");
        }, 3000);
      } else {
        toast.error("Something went wrong");
      }
      setDisable(false);
    }
  };

  const navigateToUser = () => {
    navigate("/customers");
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h3 style={{ marginBottom: "50px" }}>Create New User</h3>
      </Box>
      <Card>
        <div>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="new_form_control"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="new_form_control"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>User Type:</Form.Label>
              <Form.Select
                aria-label="Default select example"
                className="new_form_control"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
              >
                <option>Select Status:</option>
                <option value="6">CUSTOMER</option>
                <option value="7">DRIVER</option>
              </Form.Select>
            </Form.Group>

            <div style={{ marginTop: "60px" }}>
              <Button
                icon="pi pi-check"
                severity="success"
                type="submit"
                onClick={handleSubmit}
                disabled={disable}
                style={{
                  borderRadius: "10px",
                  marginLeft: "10px",
                  marginTop: "10px",
                  // width:"10px"
                }}
              >
                {disable ? "Saving...." : "Save"}
              </Button>

              <Button
                icon="pi pi-times"
                severity="secondary"
                onClick={(e) => {
                  navigateToUser();
                }}
                style={{ borderRadius: "10px", marginLeft: "10px" }}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      </Card>
    </Box>
  );
};

export default AddCustomer;
