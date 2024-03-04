import React, { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Card, Col, Row, message } from "antd";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  GetOrderById,
  UpdateOrderStatus,
} from "../../../services/Api/OrderApi";
import { Select } from "antd";
import { Steps } from "antd";
import { Button } from "primereact/button";

function ccyFormat(num) {
  return `${num.toFixed(2)}`;
}

function priceRow(qty, unit) {
  return qty * unit;
}

function createRow(desc, qty, unit) {
  const price = priceRow(qty, unit);
  return { desc, qty, unit, price };
}

const EditOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [stepCurrent, setStepCurrent] = useState(1);

  useLayoutEffect(() => {
    GetOrderById(id)
      .then((res) => {
        setOrderData(res.data.data);
        console.log("GetOrderById=>", res.data.data);
      })
      .catch((err) => {
        console.log(err, "error");
      });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("order_id", orderData?.order_id ? orderData?.order_id : "");
    formData.append(
      "order_status",
      orderData?.order_status ? orderData?.order_status : ""
    );

    UpdateOrderStatus(formData)
      .then((res) => {
        if (res.status === 201) {
          message.success("Order updated successfully!");
        }
        navigate("/orders");
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

  const rows = (orderData?.order_orderDetails ?? []).map((orderDetail) =>
    createRow(
      orderDetail.orderDetails_product.name,
      orderDetail.total_items,
      orderDetail.orderDetails_product.price
    )
  );

  const handleChange1 = (value) => {
    console.log(`selected ${value}`);

    // Update the order_status in the state
    setOrderData((prevOrderData) => ({
      ...prevOrderData,
      order_status: value,
    }));

    // Update the Steps current based on the selected order status
    switch (value) {
      case "ACCEPTED":
        setStepCurrent(1);
        break;
      case "SHIPPED":
        setStepCurrent(2);
        break;
      case "DELIVERED":
        setStepCurrent(3);
        break;
      default:
        setStepCurrent(0); // For "BOOKED" status or other cases
        break;
    }
  };

  const sumOfPrice = orderData?.order_orderDetails.reduce(
    (total, items) => total + items.total_price,
    0
  );

  return (
    <Box>
      <Box style={{ marginBottom: "30px" }}>
        <h3 className="page-title">Update Order Status</h3>
        <p className="page-sub-title">Details of Order</p>
      </Box>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Card
          style={{ width: "30%", marginRight: "20px", borderRadius: "0px" }}
        >
          <div
            style={{
              margin: "0 0 7px 0px",
            }}
          >
            <h4
              style={{
                fontSize: "1.2rem",
                fontFamily: "Cerebri Sans,sans-serif",
                fontWeight: "600",
                marginBottom: "20px",
                color: "#6575FE",
              }}
            >
              Track Order :
            </h4>

            <Col>
              <h5
                style={{
                  fontSize: "0.9rem",
                  fontFamily: "Cerebri Sans,sans-serif",
                  fontWeight: "700",
                  marginTop: "14px",
                  color: "darkgray",
                }}
              >
                Order ID:
              </h5>
              <p style={{ marginBottom: "20px" }}>{orderData?.order_id}</p>
            </Col>

            <Steps
              direction="vertical"
              size="small"
              current={stepCurrent}
              items={[
                {
                  title: "Booked",
                  description: "Booked by User",
                  status:
                    orderData?.order_status === "BOOKED" ? "finish" : "wait",
                },
                {
                  title: "Accepted",
                  description: "Order Accepted",
                  status:
                    orderData?.order_status === "ACCEPTED" ? "finish" : "wait",
                },
                {
                  title: "Shipped",
                  description: "Out for delivery",
                  status:
                    orderData?.order_status === "SHIPPED" ? "finish" : "wait",
                },
                {
                  title: "Delivered",
                  description: "Items Delivered",
                  status:
                    orderData?.order_status === "DELIVERED" ? "finish" : "wait",
                },
              ]}
            />

            <Col>
              <h4
                style={{
                  fontSize: "1rem",
                  fontFamily: "Cerebri Sans,sans-serif",
                  fontWeight: "400",
                  color: "#6575FE",
                  marginTop: "20px",
                }}
              >
                Order Status :
              </h4>

              <Select
                value={orderData?.order_status}
                style={{
                  width: "100%",
                  color: "black",
                  height: "40px",
                }}
                onChange={handleChange1}
                options={[
                  {
                    value: "BOOKED",
                    label: "BOOKED",
                    disabled: true,
                  },
                  {
                    value: "ACCEPTED",
                    label: "ACCEPTED",
                  },
                  {
                    value: "SHIPPED",
                    label: "SHIPPED",
                  },
                  {
                    value: "DELIVERED",
                    label: "DELIVERED",
                  },
                ]}
              />
            </Col>

            <div style={{ marginTop: "150px", textAlign: "center" }}>
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
                onClick={handleSubmit}
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
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Card style={{ width: "100%", borderRadius: "0px" }}>
            <h4
              style={{
                fontSize: "1.2rem",
                fontFamily: "Cerebri Sans,sans-serif",
                fontWeight: "600",
                marginBottom: "20px",
                color: "#6575FE",
              }}
            >
              Items From Order #{orderData?.order_id} :
            </h4>

            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 700 }} aria-label="spanning table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" colSpan={3}>
                      Order Details
                    </TableCell>
                    <TableCell align="right">Price</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price Per Unit</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows &&
                    rows.map((row) => (
                      <TableRow key={row.desc}>
                        <TableCell>{row.desc}</TableCell>
                        <TableCell align="right">{row.qty}</TableCell>
                        <TableCell align="right">{row.unit}</TableCell>
                        <TableCell align="right">
                          {ccyFormat(row.price)}
                        </TableCell>
                      </TableRow>
                    ))}

                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell align="right">
                      {sumOfPrice?.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
          <Card
            style={{
              width: "100%",
              marginRight: "20px",
              borderRadius: "0px",
              marginTop: "20px",
              height: "-webkit-fill-available",
            }}
          >
            <div
              style={{
                margin: "0 0 7px 0px",
              }}
            >
              <h4
                style={{
                  fontSize: "1.2rem",
                  fontFamily: "Cerebri Sans,sans-serif",
                  fontWeight: "600",
                  marginBottom: "20px",
                  color: "#6575FE",
                }}
              >
                Shipping Information :
              </h4>
              <Row>
                <Col style={{ marginRight: "100px" }}>
                  <h5
                    style={{
                      fontSize: "0.9rem",
                      fontFamily: "Cerebri Sans,sans-serif",
                      fontWeight: "700",
                      marginTop: "14px",
                      color: "darkgray",
                    }}
                  >
                    Name:
                  </h5>
                  <p style={{ marginBottom: "20px" }}>
                    {orderData?.order_user?.user_profile?.name}
                  </p>
                </Col>
                <Col style={{ marginRight: "100px" }}>
                  <h5
                    style={{
                      fontSize: "0.9rem",
                      fontFamily: "Cerebri Sans,sans-serif",
                      fontWeight: "700",
                      marginTop: "14px",
                      color: "darkgray",
                    }}
                  >
                    Email:
                  </h5>
                  <p style={{ marginBottom: "20px" }}>
                    {orderData?.order_user?.email}
                  </p>
                </Col>
                <Col>
                  <h5
                    style={{
                      fontSize: "0.9rem",
                      fontFamily: "Cerebri Sans,sans-serif",
                      fontWeight: "700",
                      marginTop: "14px",
                      color: "darkgray",
                    }}
                  >
                    Phone:
                  </h5>
                  <p style={{ marginBottom: "20px" }}>
                    {orderData?.order_user?.user_profile?.mobile}
                  </p>
                </Col>
              </Row>
              <h5
                style={{
                  fontSize: "0.9rem",
                  fontFamily: "Cerebri Sans,sans-serif",
                  fontWeight: "700",
                  marginTop: "14px",
                  color: "darkgray",
                }}
              >
                Delivery Address:
              </h5>
              <p style={{ marginBottom: "20px" }}>
                {orderData?.order_orderDetails[0]?.address}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Box>
  );
};

export default EditOrder;
