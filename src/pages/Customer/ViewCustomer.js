import React, { useEffect, useLayoutEffect, useState } from "react";
import { Button } from "primereact/button";
import { Box } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { Row, Col } from "react-bootstrap";
import { GetUserById } from "../../services/Api/Api";
import { BASE_URL_IMAGE } from "../../services/Host";
import { Card } from "primereact/card";

const ViewCustomer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [userData, setUserData] = useState([]);
  const [image, setImage] = useState({ preview: "", raw: "" });

  const navigateToUser = () => {
    navigate("/customers");
  };

  //get role By ID
  useLayoutEffect(() => {
    GetUserById(id)
      .then((res) => {
        setUserData(res.data.data);
        console.log("user", res.data.data);
      })
      .catch((err) => {
        console.log(err, "error");
      });
  }, [id]);
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h3 style={{ marginTop: "5px", marginBottom: "30px" }}>
          View User Details
        </h3>
      </Box>

      <Card>
        <div className="admin_profile">
          <Form className="admin_details_form">
            <Row>
              <Form.Group className="mb-3">
                <Form.Label>User's Profile Picture:</Form.Label>
                <br />
                {userData?.user_attachments &&
                userData?.user_attachments[0]?.file_name ? (
                  <img
                    src={`${BASE_URL_IMAGE}${userData?.user_attachments[0]?.file_name}`}
                    // src = "https://nmnode.blockcod.in:8080/images/images-1705307791412.jpg"
                    alt="User's Dp"
                    className="category-icon-preview"
                    style={{ height: "100px", width: "100px" }}
                  />
                ) : (
                  <span>No Image Available</span>
                )}
              </Form.Group>
            </Row>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name="name"
                    defaultValue={userData?.user_profile?.name}
                    type="text"
                    disabled
                  />
                </Form.Group>
              </Col>

              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>User Name</Form.Label>
                  <Form.Control
                    name="name"
                    defaultValue={userData?.user_name}
                    type="text"
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  name="email"
                  defaultValue={userData?.email}
                  type="text"
                  disabled
                />
              </Form.Group>
            </Row>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Mobile</Form.Label>
                  <Form.Control
                    name="mobile"
                    defaultValue={userData?.user_profile?.mobile}
                    type="text"
                    disabled
                  />
                </Form.Group>
              </Col>

              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Date Of Birth</Form.Label>
                  <Form.Control
                    name="mobile"
                    defaultValue={userData?.user_profile?.dob}
                    type="text"
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    name="mobile"
                    defaultValue={userData?.user_profile?.address}
                    type="text"
                    disabled
                  />
                </Form.Group>
              </Col>

              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Country:</Form.Label>
                  <Form.Control
                    name="mobile"
                    defaultValue={userData?.user_profile?.country}
                    type="text"
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>

            <div>
              <Button
                // icon="pi pi-times"
                severity="secondary"
                onClick={(e) => {
                  navigateToUser();
                }}
                style={{ borderRadius: "10px", marginLeft: "10px" }}
              >
                Return to User List
              </Button>
            </div>
          </Form>
        </div>
      </Card>
    </Box>
  );
};

export default ViewCustomer;
