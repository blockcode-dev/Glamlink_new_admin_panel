import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Card } from "antd";
import { Form, Input, Row, Col } from "antd";
import "./Service.css";
import { Button } from "primereact/button";
import { BASE_URL_IMAGE } from "../../../services/Host";
import { GetServiceById } from "../../../services/Api/ServiceApi";


const ViewService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [componentDisabled, setComponentDisabled] = useState(true);
  const [serviceData, setServiceData] = useState(null);

  useLayoutEffect(() => {
    GetServiceById(id)
      .then((res) => {
        setServiceData(res.data.data);
        console.log("servicebyid=>", res.data.data);
        // console.log("serviceData:", serviceData);
      })
      .catch((err) => {
        console.log(err, "error");
      });
  }, [id]);

  const navigateToService = () => {
    navigate("/services");
  };
  return (
    <Box>
      <Box style={{ marginBottom: "30px" }}>
        <h3 className="page-title">About Service</h3>
        <p className="page-sub-title">Details of Service</p>
      </Box>
      <Card style={{ width: "100%" }}>
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          disabled={componentDisabled}
          style={{ width: "1745px" }}
          layout="vertical"
        >
          <Form.Item label="Service Name:">
            <Input
              style={{ color: "black", height: "40px" }}
              value={serviceData?.name}
            />
          </Form.Item>
          <Form.Item label="Service Description:">
            <div
              value={serviceData?.description}
              rows={4}
              dangerouslySetInnerHTML={{
                __html: serviceData?.description,
              }}
              style={{
                backgroundColor: "#F5F5F5",
                borderRadius: "5px",
                padding: "10px",
                border: "1px solid #ced4da ",
                color: "black",
              }}
            />
          </Form.Item>
          <Form.Item label="Images:">
            <Row gutter={[16, 16]}>
              {serviceData?.service_attachments.map((attachment, index) => (
                <Col key={index} span={6}>
                  <img
                    crossOrigin="anonymous"
                    src={`${BASE_URL_IMAGE}${attachment.file_name}`}
                    alt={`Service graphic ${index + 1}`}
                    style={{ height: "150px", width: "150px" ,borderRadius:"10px" }}
                  />
                </Col>
              ))}
            </Row>
          </Form.Item>

          <div>
            <Button
              icon="pi pi-arrow-left"
              severity="secondary"
              onClick={(e) => {
                navigateToService();
              }}
              style={{ borderRadius: "5px", height: "40px" }}
            >
              <span style={{ marginLeft: "5px" }}> Return to Services</span>
            </Button>
          </div>
        </Form>
      </Card>
    </Box>
  );
};

export default ViewService;
