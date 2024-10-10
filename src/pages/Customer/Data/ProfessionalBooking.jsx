/** @format */

import React, { useEffect, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import { Box } from "@mui/material";
import { Button } from "primereact/button";
import { useNavigate, useParams } from "react-router-dom";
import { Tag, Table, Space } from "antd";
import { GetBookingsByCounsellorId } from "../../../services/Api/UserApi";

const ProfessionalBooking = () => {
	const { id } = useParams(); // Get user_id from params
	const navigate = useNavigate();
	const [bookingData, setBookingData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("UPCOMING"); // Default active tab
	const [tableParams, setTableParams] = useState({
		pagination: {
			current: 1,
			pageSize: 20,
		},
		sortField: null,
		sortOrder: null,
	});

	// Fetch booking data with status and user_id
	// Fetch booking data with booking_status and user_id
	const getData = async (status, user_id) => {
		try {
			setLoading(true);
			// Pass both status and user_id in the API call
			const result = await GetBookingsByCounsellorId(status, user_id);
			const newData = result.data.data.map((item, index) => ({
				...item,
				index: index + 1,
			}));
			setBookingData(newData);
		} catch (e) {
			console.error(e);
			if (e.response && e.response.status === 401) {
				navigate("/error401");
			} else {
				console.error("Error loading data. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};

	// UseEffect call
	useEffect(() => {
		getData(activeTab, id); // Fetch data with the activeTab status and user_id from params
	}, [activeTab, id]);

	// Call getData on component mount and when the activeTab changes
	useEffect(() => {
		getData(activeTab, id); // Fetch data with the activeTab status and user_id from params
	}, [activeTab, id]);

	const handleTableChange = (pagination, filters, sorter) => {
		setTableParams({
			pagination,
			filters,
			sortField: sorter.field,
			sortOrder: sorter.order,
		});
	};

	const tabsContent = [
		{ label: "Upcoming Bookings", key: "UPCOMING" },
		{ label: "Booking History", key: "COMPLETED" },
	];

	const columns = [
		{
			title: "S.No.",
			dataIndex: "index",
			sorter: (a, b) => a.index - b.index,
		},

		{
			title: "Professional's Name",
			dataIndex: ["appointment_counselor", "user_profile", "name"],
			key: "name",
		},
		{
			title: "User's Name",
			dataIndex: ["appointment_user", "user_profile", "name"],
			key: "name",
		},
		{
			title: "Appoitment Service",
			dataIndex: ["appointment_service", "name"],
			key: "name",
		},
		{
			title: "Notes",
			dataIndex: "notes",
			key: "notes",
		},
		{
			title: "Booking Status",
			dataIndex: "status",
			key: "status",
			render: (status) => {
				let color;
				let displayStatus = status;
				switch (status) {
					case "PENDING":
						color = "gold";
						break;
					case "SUCCESS":
						color = "green";
						displayStatus = "COMPLETED";
						break;
					case "ACCEPTED":
						color = "blue";
						break;
					case "REJECTED":
					case "CANCELED":
						color = "red";
						break;
					case "DELETED":
						color = "volcano";
						break;
					case "ONGOING":
						color = "purple";
						break;
					default:
						color = "black";
				}
				return (
					<Tag color={color} key={status}>
						{displayStatus}
					</Tag>
				);
			},
		},
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
		},
		{
			title: "Time",
			dataIndex: "start_time",
			key: "time",
		},
	];

	const navigateToUser = () => {
		navigate(`/viewProfessionals/${id}`);
	};

	return (
		<Box>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				marginBottom="20px"
			>
				<div>
					<h3 className="page-title">BOOKING MANAGEMENT</h3>
					<p className="page-sub-title">View Professional's Bookings</p>
				</div>
				<Box display="flex" justifyContent="space-between" alignItems="center">
					<Box>
						<Button
							icon="pi pi-arrow-left"
							severity="secondary"
							onClick={navigateToUser}
							style={{ borderRadius: "5px", height: "47px" }}
						>
							<span style={{ marginLeft: "5px" }}>Return to Users</span>
						</Button>
					</Box>
				</Box>
			</Box>
			<div className="tabs-container">
				<Tabs
					defaultActiveKey="all"
					onSelect={(key) => {
						setActiveTab(key);
					}}
					activeKey={activeTab}
				>
					{tabsContent.map((tab) => (
						<Tab eventKey={tab.key} title={tab.label} key={tab.key} />
					))}
				</Tabs>
			</div>

			{/* Table component */}
			<Table
				columns={columns}
				rowKey={(record) => record.id}
				dataSource={bookingData}
				pagination={tableParams.pagination}
				loading={loading}
				onChange={handleTableChange}
			/>
		</Box>
	);
};

export default ProfessionalBooking;


