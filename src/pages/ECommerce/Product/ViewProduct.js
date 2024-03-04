import React, { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Card } from "antd";
import { Form, Input, Row, Col } from "antd";
import "./Product.css";
import { Button } from "primereact/button";
import { BASE_URL_IMAGE } from "../../../services/Host";
import { GetProductById } from "../../../services/Api/ProductApi";

const ViewProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [componentDisabled, setComponentDisabled] = useState(true);
  const [productData, setProductData] = useState(null);

  useLayoutEffect(() => {
    GetProductById(id)
      .then((res) => {
        setProductData(res.data.data);
        console.log("GetProductById=>", res.data.data);
        // console.log("productData:", productData);
      })
      .catch((err) => {
        console.log(err, "error");
      });
  }, [id]);

  const navigateToService = () => {
    navigate("/productList");
  };
  return (
    <Box>
      <Box style={{ marginBottom: "30px" }}>
        <h3 className="page-title">About Product</h3>
        <p className="page-sub-title">Details of Product</p>
      </Box>
      <Card style={{ width: "100%" }}>
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          disabled={componentDisabled}
          style={{ width: "1745px" }}
          layout="vertical"
        >
          <Form.Item label="Product Name:">
            <Input
              style={{ color: "black", height: "40px" }}
              value={productData?.name}
            />
          </Form.Item>
          <Form.Item label="Product Description:">
            <div
              value={productData?.description}
              rows={4}
              dangerouslySetInnerHTML={{
                __html: productData?.description,
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
          <Form.Item label="Product Stock:">
            <Input
              style={{ color: "black", height: "40px" }}
              value={productData?.stock}
              
            />
          </Form.Item>
          {/* <Row>
            <Col>
              <Form.Item label="Product Size:">
                <Input
                  style={{ color: "black", height: "40px" }}
                  value={productData?.size}
                  className="view_booking_heading"
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="Product Weight:">
                <Input
                  style={{ color: "black", height: "40px" }}
                  value={productData?.weight}
                  className="view_booking_heading"
                />
              </Form.Item>
            </Col>
          </Row> */}
          <Form.Item label="Images:">
            <Row gutter={[16, 16]}>
              {productData?.product_attachments.map((attachment, index) => (
                <Col key={index} span={6}>
                  <img
                    crossOrigin="anonymous"
                    src={`${BASE_URL_IMAGE}${attachment.file_name}`}
                    alt={`Product graphic ${index + 1}`}
                    style={{
                      height: "150px",
                      width: "150px",
                      borderRadius: "10px",
                    }}
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
              <span style={{ marginLeft: "5px" }}> Return to Products</span>
            </Button>
          </div>
        </Form>
      </Card>
    </Box>
  );
};

export default ViewProduct;
