import { Box } from "@mui/material";
import React, { useLayoutEffect } from "react";
import { Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { GetAdminById, UpdateAdmin } from "../../services/Api/Api.jsx";
import { message } from "antd";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Select } from "antd";

const EditAdmin = () => {
  const { id } = useParams();
  const [idData, setIdData] = React.useState("");

  //get role By ID
  useLayoutEffect(() => {
    GetAdminById(id)
      .then((res) => {
        setIdData(res.data.data);
      })
      .catch((err) => {
        console.log(err, "error");
      });
  }, [id]);
  console.log("isdata---->", idData);

  //update role api implementation
  const handleNameChange = (e) => {
    console.log("Selected value:", e.target.value);
    setIdData({ ...idData, [e.target?.name]: e.target?.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("admin_id", id);
    formData.append("name", idData?.name ? idData?.name : "");
    formData.append("email", idData?.email ? idData?.email : "");
    formData.append("role_id", idData?.role_id ? idData?.role_id : "");
    console.log("formData", formData);
    UpdateAdmin(formData)
      .then((res) => {
        if (res.status === 200) {
          message.success("Admin updated successfully!");
        }
        navigate("/adminList");
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          message.error("Token expired!");
          localStorage.removeItem("adminToken");
          setTimeout(() => {
            navigate("/Login");
          }, 3000);
        } else {
          message.error("Something went wrong");
        }
      });
  };

  const navigate = useNavigate();
  const navigateToRole = () => {
    navigate("/adminList");
  };
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h3 style={{ marginBottom: "60px" }}>Edit Admin</h3>
      </Box>
      <Card>
        <div>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                defaultValue={idData?.name}
                name="name"
                onChange={(e) => handleNameChange(e)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                defaultValue={idData?.email}
                name="email"
                onChange={(e) => handleNameChange(e)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Select Role :</Form.Label>
              {idData && (
                <Select
                  defaultValue={idData?.admin_role?.name || ""}
                  style={{
                    width: "100%",
                    color: "black",
                    height: "40px",
                  }}
                  onChange={(value) =>
                    handleNameChange({ target: { name: "role_id", value } })
                  }
                  options={[
                    {
                      value: "1",
                      label: "ADMIN",
                    },
                    {
                      value: "2",
                      label: "ADMIN LEVEL 2",
                    },
                    {
                      value: "3",
                      label: "ADMIN LEVEL 1",
                    },
                  ]}
                />
              )}
            </Form.Group>
          </Form>
          <div className="button">
            <Button
              icon="pi pi-check"
              severity="success"
              htmlType="submit"
              type="primary"
              onClick={handleSubmit}
              style={{
                borderRadius: "5px",
                margin: "0px 0px",
                height: "40px",
              }}
            >
              Save
            </Button>
            <Button
              icon="pi pi-times"
              severity="secondary"
              onClick={(e) => {
                navigateToRole();
              }}
              style={{
                borderRadius: "5px",
                marginLeft: "10px",
                height: "40px",
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </Box>
  );
};

export default EditAdmin;
