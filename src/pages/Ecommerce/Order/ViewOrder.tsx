/** @format */

import React, { useLayoutEffect, useState } from "react";
import { Card, Col, Row, Table } from "antd";
import { GetOrderById } from "../../../services/Api/EcommeceApi";
import type { Order } from "../../../types/ecommerce";

function ccyFormat(num: unknown) {
	const n = Number(num);
	if (isNaN(n)) {
		console.warn("Invalid number passed to ccyFormat:", num);
		return "0.00";
	}
	return `${n.toFixed(2)}`;
}

function priceRow(qty: number, unit: number) {
	return qty * unit;
}

function createRow(desc: string, qty: number, unit: number) {
	const price = priceRow(qty, unit);
	return { desc, qty, unit, price };
}

interface ViewOrderProps {
	orderId: number | null;
	/** Never called yet (see the audit): the list doesn't refresh after an edit. */
	onClose?: () => void;
}

const ViewOrder = ({ orderId, onClose }: ViewOrderProps) => {
	const [orderData, setOrderData] = useState<Order | null>(null);

	useLayoutEffect(() => {
		if (orderId === null) return;
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

	const formatDate = (dateString: string) => {
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
		<div>
			<div style={{ display: "flex", flexDirection: "column" }}>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<Card style={{ width: "100%", borderRadius: "0px" }}>
						<h4
							style={{
								fontSize: "1.2rem",
								color: "var(--color-text)",
								marginBottom: "20px",
							}}
						>
							Order #{orderData?.order_details_order?.order_id} :<br></br>
							<span
								style={{
									fontSize: "0.9rem",
									color: "var(--color-text-tertiary)",
								}}
							>
								{orderData?.created_at
									? formatDate(orderData?.created_at)
									: "N/A"}
							</span>
						</h4>

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
								color: "var(--color-primary)",
							}}
						>
							ORDER ITEMS:
						</h4>

						<Table
							rowKey="desc"
							dataSource={rows}
							pagination={false}
							scroll={{ x: 700 }}
							columns={[
								{
									title: "Order Details",
									align: "center",
									children: [
										{ title: "Product Name", dataIndex: "desc" },
										{ title: "Quantity", dataIndex: "qty", align: "right" },
										{ title: "Price Per Unit", dataIndex: "unit", align: "right" },
									],
								},
								{
									title: "Price",
									align: "right",
									children: [
										{
											title: "Total",
											dataIndex: "price",
											align: "right",
											render: (price) => ccyFormat(price),
										},
									],
								},
							]}
							summary={() => (
								<>
									<Table.Summary.Row>
										<Table.Summary.Cell index={0} rowSpan={3} />
										<Table.Summary.Cell index={1} colSpan={2}>
											Subtotal (Excl. Tax)
										</Table.Summary.Cell>
										<Table.Summary.Cell index={3} align="right">
											{ccyFormat(orderData?.amount_excluding_tax)}
										</Table.Summary.Cell>
									</Table.Summary.Row>
									<Table.Summary.Row>
										<Table.Summary.Cell index={1} colSpan={2}>
											Tax
										</Table.Summary.Cell>
										<Table.Summary.Cell index={3} align="right">
											{ccyFormat(orderData?.tax_amount)}
										</Table.Summary.Cell>
									</Table.Summary.Row>
									<Table.Summary.Row>
										<Table.Summary.Cell index={1} colSpan={2}>
											<strong>Total (Incl. Tax)</strong>
										</Table.Summary.Cell>
										<Table.Summary.Cell index={3} align="right">
											<strong>{ccyFormat(orderData?.amount_including_tax)}</strong>
										</Table.Summary.Cell>
									</Table.Summary.Row>
								</>
							)}
						/>
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
									color: "var(--color-primary)",
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
											color: "var(--color-text-tertiary)",
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
											color: "var(--color-text-tertiary)",
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
											color: "var(--color-text-tertiary)",
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
									color: "var(--color-text-tertiary)",
								}}
							>
								Delivery Address:
							</h5>
							<p>
								{orderData?.order_details_order?.order_address
									? [
											orderData.order_details_order.order_address
												.address_line_1,
											orderData.order_details_order.order_address.user_city
												?.name,
											orderData.order_details_order.order_address.user_state
												?.name,
											orderData.order_details_order.order_address.user_country
												?.name,
											orderData.order_details_order.order_address.postal_code,
									  ]
											.filter(Boolean) // Removes undefined/null/empty entries
											.join(", ")
									: "N/A"}
							</p>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default ViewOrder;
