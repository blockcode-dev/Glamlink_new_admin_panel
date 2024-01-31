import React, { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Card } from "antd";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { GetOrderById } from "../../../services/Api/OrderApi";

const TAX_RATE = 0.07;

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

function subtotal(items) {
  return items.map(({ price }) => price).reduce((sum, i) => sum + i, 0);
}
const ViewOrder = () => {
  const { id } = useParams();
  const [orderData, setOrderData] = useState(null);

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

  const rows = (orderData?.order_orderDetails ?? []).map((orderDetail) =>
    createRow(
      orderDetail.orderDetails_product.name,
      orderDetail.total_items,
      orderDetail.orderDetails_product.price
    )
  );

  const invoiceSubtotal = subtotal(rows);
  const invoiceTaxes = TAX_RATE * invoiceSubtotal;
  const invoiceTotal = invoiceTaxes + invoiceSubtotal;

  const sumOfPrice = orderData?.order_orderDetails.reduce(
    (total, items) => total + items.total_price,
    0
  );
  console.log("sum", sumOfPrice);

  return (
    <Box>
      <Box style={{ marginBottom: "30px" }}>
        <h3 className="page-title">About Orders</h3>
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
              Shipping Information :
            </h4>
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
            <h5
              style={{
                fontSize: "0.9rem",
                fontFamily: "Cerebri Sans,sans-serif",
                fontWeight: "700",
                marginTop: "14px",
                color: "darkgray",
              }}
            >
              Order Date:
            </h5>
            <p style={{ marginBottom: "20px" }}>
              {orderData?.created_at.split("T")[0]}
            </p>
            <h5
              style={{
                fontSize: "0.9rem",
                fontFamily: "Cerebri Sans,sans-serif",
                fontWeight: "700",
                marginTop: "14px",
                color: "darkgray",
              }}
            >
              Order Id:
            </h5>
            <p style={{ marginBottom: "20px" }}>{orderData?.order_id}</p>
            <h5
              style={{
                fontSize: "0.9rem",
                fontFamily: "Cerebri Sans,sans-serif",
                fontWeight: "700",
                marginTop: "14px",
                color: "darkgray",
              }}
            >
              Order Status:
            </h5>
            <p style={{ marginBottom: "20px" }}>{orderData?.order_status}</p>
          </div>
        </Card>
        <Card style={{ width: "70%", borderRadius: "0px" }}>
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
                  <TableCell align="right">{sumOfPrice?.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </div>
    </Box>
  );
};

export default ViewOrder;
