/** @format */

import React, { useEffect, useState } from "react";
import { Table, Drawer, Button, Input, type TableColumnsType } from "antd";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import { Tooltip } from "antd";
import { GetAllOrders } from "../../../services/Api/EcommeceApi";
import ViewOrder from "./ViewOrder";

import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../../utils/apiError";
import type { Order } from "../../../types/ecommerce";

const Orders = () => {
	const navigate = useNavigate();
	const [pageSize, setPageSize] = useState(50);
	const [orderData, setOrderData] = useState<Order[]>([]);
	const [loading, setLoading] = useState(false);
	const [backupData, setBackupData] = useState<Order[]>([]);
	const [isDrawerVisible, setIsDrawerVisible] = useState(false);
	const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

	// Fetch all orders
	const getData = async () => {
		try {
			setLoading(true);
			let result = await GetAllOrders(localStorage.getItem("adminToken"));
			setOrderData(result.data.data);
			setBackupData(result.data.data);
		} catch (e) {
			console.error(e);
			if (apiErrorStatus(e) === 401) {
				navigate("/error401");
				console.error("Unauthorized access.");
			} else {
				console.error("Error loading data. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
	}, []);

	const onSearch = (searchValue: string) => {
		const filteredData = backupData.filter((item) =>
			item?.order_details_order?.orders_user?.user_profile?.name
				?.toLowerCase()
				.includes(searchValue.toLowerCase())
		);

		setOrderData(filteredData);
	};

	const openDrawer = (orderId: number) => {
	    setSelectedOrderId(orderId);
		setIsDrawerVisible(true);
	};

	const columns: TableColumnsType<Order> = [
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
							color: "var(--color-primary)",
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
			render: (created_at) => dayjs(created_at).format("DD/MM/YYYY hh:mm:ss"),
		},
		{
			title: "Actions",
			key: "actions",
			width: "20%",
			render: (record) => (
				<Button
					style={{ margin: "0px 10px", borderRadius: "25px" }}
					onClick={() => openDrawer(record.id)}
					icon={<EyeOutlined />}
					shape="circle"></Button>
			),
		},
	];

	return (
		<div>
			<div
				style={{
				    display: "flex",
				    justifyContent: "space-between",
				    alignItems: "center",
				    marginBottom: "20px"
				}}>
				<div>
					<h3 className="page-title">ORDER MANAGEMENT</h3>
					<p className="page-sub-title">View All Orders</p>
				</div>

				<div>
					<Input
						type="search"
						onChange={(e) => onSearch(e.target.value)}
						placeholder="Search..."
						prefix={<SearchOutlined />}
						size="large"
						style={{
						    width: 240
						}} />
				</div>
			</div>
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
				size={800}
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
		</div>
	);
};

export default Orders;
