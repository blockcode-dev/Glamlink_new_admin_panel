import { Box } from "@mui/material";
import React, { useLayoutEffect } from "react";
import { Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { GetAdminProfile } from "../../services/Api/Api.jsx";

import { Button } from "primereact/button";
import { Card } from "primereact/card";

const ViewAdmin = () => {
  const { id } = useParams();
  const [idData, setIdData] = React.useState({});

  //get role By ID
  useLayoutEffect(() => {
    GetAdminProfile(id)
      .then((res) => {
        setIdData(res.data.data);
      })
      .catch((err) => {
        console.log(err, "error");
      });
  }, [id]);

  const navigate = useNavigate();
  const navigateToAdmin = () => {
    navigate("/adminList");
  };
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h3 style={{ marginBottom: "60px" }}>Admin Profile</h3>
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
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                defaultValue={idData?.email_id}
                name="abbreviation"
              />
            </Form.Group>


            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Control
                type="text"
                defaultValue={idData?.admin_roles?.name || ''}
                name="abbreviation"
              />
            </Form.Group>

          </Form>
          <div className="button">
            <Button
              // icon="pi pi-times"
              severity="secondary"
              onClick={(e) => {
                navigateToAdmin();
              }}
              style={{ borderRadius: "10px", marginLeft: "10px" }}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </Box>
  );
};

export default ViewAdmin;
