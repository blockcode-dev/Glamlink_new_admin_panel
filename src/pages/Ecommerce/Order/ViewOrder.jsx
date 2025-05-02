/** @format */

import React, { useLayoutEffect, useState } from "react";
import { Box } from "@mui/material";
import { Card, Col, Row } from "antd";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { GetOrderById } from "../../../services/Api/EcommeceApi";

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

const ViewOrder = ({ orderId, onClose }) => {
	const [orderData, setOrderData] = useState(null);

	useLayoutEffect(() => {
		GetOrderById(orderId)
			.then((res) => {
				setOrderData(res.data.data);
			})
			.catch((err) => {
				console.error("Error fetching order:", err);
			});
	}, [orderId]);

	const rows = [
		createRow(
			orderData?.product_details?.name || "N/A",
			orderData?.total_items || 0,
			orderData?.product_details?.price || 0
		),
	];

	const sumOfPrice = orderData?.total_price || 0;

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return (
			date.toLocaleDateString("en-GB", {
				weekday: "short", // "Fri"
				year: "numeric", // "2022"
				month: "short", // "Mar"
				day: "2-digit", // "04"
			}) +
			", " +
			date.toLocaleTimeString("en-GB", { hour12: true })
		); // "05:45 PM"
	};

	return (
		<Box>
			<div style={{ display: "flex", flexDirection: "column" }}>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<Card style={{ width: "100%", borderRadius: "0px" }}>
						<h4
							style={{
								fontSize: "1.2rem",
								color: "black",
								marginBottom: "20px",
							}}
						>
							Order #{orderData?.order_details_order?.order_id} :<br></br>
							<span
								style={{
									fontSize: "0.9rem",
									color: "gray",
								}}
							>
								{orderData?.created_at
									? formatDate(orderData?.created_at)
									: "N/A"}
							</span>
						</h4>

						{/* Display Radio Buttons for Update Option */}
						{/* <Radio.Group onChange={handleRadioChange} value={updateOption}>
							<Radio value="update">Update Order Dynamically</Radio>
							<Radio value="tracking">Pass Tracking Link</Radio>
						</Radio.Group>

						
						{updateOption === "update" && (
							<div style={{ marginTop: "20px" }}>
								<h4 style={{ fontSize: "1rem", color: "#6575FE" }}>
									Order Status :
								</h4>
								<Select
									value={orderData?.order_status || "PLACED"}
									style={{ width: "100%", color: "black", height: "40px" }}
									onChange={handleChange1}
									options={[
										{ value: "PLACED", label: "PLACED", disabled: true },
										{ value: "CONFIRMED", label: "CONFIRMED" },
										{ value: "SHIPPED", label: "SHIPPED" },
										{ value: "OUT_FOR_DELIVERY", label: "OUT FOR DELIVERY" },
										{ value: "DELIVERED", label: "DELIVERED" },
									]}
								/>
								<h4
									style={{
										fontSize: "1rem",
										color: "#6575FE",
										marginTop: "20px",
									}}
								>
									Estimated Delivery Date:
								</h4>
								<DatePicker
									value={
										estimatedDate ||
										(orderData?.estimated_date
											? dayjs(orderData?.estimated_date)
											: null)
									}
									onChange={(date) => setEstimatedDate(date)}
									style={{ width: "100%" }}
									placeholder="Select Date" // Placeholder text when no date is selected
								/>
							</div>
						)}

					
						{updateOption === "tracking" && (
							<div style={{ marginTop: "20px" }}>
								<h4 style={{ fontSize: "1rem", color: "#6575FE" }}>
									Tracking Link:
								</h4>
								<input
									type="text"
									value={trackingLink || orderData?.tracking_link} // Default to the API value if exists
									onChange={(e) => setTrackingLink(e.target.value)}
									placeholder="Enter tracking link"
									style={{ width: "100%", padding: "10px" }}
								/>
							</div>
						)} */}

						{/* <div
							style={{
								marginTop: "20px",
								display: "flex",
								justifyContent: "flex-end",
							}}
						>
							<Button
								icon="pi pi-check"
								label="Save"
								severity="info"
								onClick={handleSubmit}
								style={{
									borderRadius: "5px",
									margin: "0px 0px",
									height: "40px",
								}}
							/>

							<Button
								icon="pi pi-times"
								severity="secondary"
								label="Cancel"
								onClick={onClose}
								style={{
									borderRadius: "5px",
									marginLeft: "10px",
									height: "40px",
								}}
							></Button>
						</div> */}
					</Card>
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						marginTop: "20px",
					}}
				>
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
							ORDER ITEMS:
							{/* Items From Order #{orderData?.order_details_order?.order_id} : */}
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
								SHIPPING INFORMATION :
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
										{
											orderData?.order_details_order?.orders_user?.user_profile
												?.name
										}
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
										{orderData?.order_details_order?.orders_user?.email}
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
										{
											orderData?.order_details_order?.orders_user?.user_profile
												?.mobile
										}
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
								{orderData?.order_details_order?.order_address?.full_address}
							</p>
						</div>
					</Card>
				</div>
			</div>
		</Box>
	);
};

export default ViewOrder;
