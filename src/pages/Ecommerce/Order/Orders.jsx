/** @format */

import React, { useEffect, useState } from "react";
import { message, Table, Drawer } from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Box } from "@mui/material";
import { Tooltip } from "antd";
import { GetAllOrders } from "../../../services/Api/EcommeceApi";
import ViewOrder from "./ViewOrder";

const Orders = () => {
	const navigate = useNavigate();
	const [pageSize, setPageSize] = useState(50);
	const [orderData, setOrderData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [backupData, setBackupData] = useState([]);
	const [isDrawerVisible, setIsDrawerVisible] = useState(false);
	const [selectedOrderId, setSelectedOrderId] = useState(null);
	// console.log(selectedOrderId, "selectedOrderId");

	// Fetch all orders
	const getData = async () => {
		try {
			setLoading(true);
			let result = await GetAllOrders(localStorage.getItem("adminToken"));
			setOrderData(result.data.data);
			setBackupData(result.data.data);
		} catch (e) {
			console.error(e);
			if (e.response && e.response.status === 401) {
				navigate("/error401");
				console.log("Unauthorized access.");
			} else {
				console.log("Error loading data. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
	}, []);

	const onSearch = (searchValue) => {
		const filteredData = backupData.filter((item) =>
			item?.orders_user?.user_profile?.name
				?.toLowerCase()
				.includes(searchValue.toLowerCase())
		);

		setOrderData(filteredData);
	};

	const openDrawer = (orderId) => {
		console.log("Opening drawer for orderId:", orderId); // Debugging log
		setSelectedOrderId(orderId);
		setIsDrawerVisible(true);
	};

	const closeDrawer = () => {
		setIsDrawerVisible(false);
		setSelectedOrderId(null);
	};

	const columns = [
		{
			title: "Sr. No",
			key: "index",
			render: (text, record, index) => index + 1,
			width: "10%",
		},
		{
			title: "Order Id",
			dataIndex: ["order_details_order", "order_id"],
			key: "order_id",
			width: "15%",
			render: (order_id, record) => (
				<Tooltip title={`Go to Order #${order_id}`}>
					<span
						style={{
							color: "purple",
							cursor: "pointer",
							textDecoration: "underline",
						}}
						onClick={() => openDrawer(record.id)} // Open drawer with order ID
					>
						#{order_id}
					</span>
				</Tooltip>
			),
		},
		{
			title: "Ordered By",
			dataIndex: ["order_details_order", "orders_user", "user_profile", "name"],
			key: "name",
			width: "20%",
		},
		{
			title: "Total",
			dataIndex: "total_price",
			key: "total_price",
			width: "10%",
			render: (total_price) => <span>${total_price}</span>,
		},
		{
			title: "Total Items",
			dataIndex: "total_items",
			key: "total_items",
			width: "10%",
		},
		{
			title: "Date",
			dataIndex: "created_at",
			key: "created_at",
			width: "20%",
			render: (created_at) => moment(created_at).format("DD/MM/YYYY hh:mm:ss"),
		},
		{
			title: "Actions",
			key: "actions",
			width: "20%",
			render: (record) => (
				<Button
					icon="pi pi-eye"
					rounded
					outlined
					className="mr-2"
					style={{ margin: "0px 10px", borderRadius: "25px" }}
					onClick={() => openDrawer(record.id)}
				></Button>
			),
		},
	];

	return (
		<Box>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				marginBottom="20px"
			>
				<div>
					<h3 className="page-title">ORDER MANAGEMENT</h3>
					<p className="page-sub-title">View All Orders</p>
				</div>

				<Box>
					<span className="p-input-icon-left">
						<i className="pi pi-search" />
						<InputText
							type="search"
							onChange={(e) => onSearch(e.target.value)}
							placeholder="Search..."
						/>
					</span>
				</Box>
			</Box>
			{loading ? (
				<p>Loading...</p>
			) : (
				<Table
					columns={columns}
					dataSource={orderData}
					rowKey="id"
					pagination={{
						pageSize: pageSize,
						showSizeChanger: true,
						pageSizeOptions: [50, 75, 100],
						onChange: (page, size) => setPageSize(size),
					}}
				/>
			)}

			<Drawer
				title={`View Order Details`}
				placement="right"
				width={800}
				// onClose={closeDrawer}
				onClose={() => setIsDrawerVisible(false)}
				open={isDrawerVisible}
			>
				<ViewOrder
					orderId={selectedOrderId}
					onClose={() => {
						setIsDrawerVisible(false);
						getData(); // Refresh the product list after editing
					}}
				/>
			</Drawer>
		</Box>
	);
};

export default Orders;
