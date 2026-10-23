/** @format */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Tag, Table, Button, Tabs, type TableColumnsType } from "antd";
import { GetBookingsByProfessionalId } from "../../../services/Api/UserApi";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../../utils/table";
import { useIdParam } from "../../../utils/routing";
import type { Booking } from "../../../types/user";

const ProfessionalBooking = () => {
	const id = useIdParam(); // Get user_id from params
	const navigate = useNavigate();
	const [bookingData, setBookingData] = useState<WithIndex<Booking>[]>([]);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("UPCOMING"); // Default active tab
	const [tableParams, setTableParams] = useState<TableParams>({
		pagination: {
			current: 1,
			pageSize: 20,
		},
		sortField: null,
		sortOrder: null,
	});

	// Fetch booking data with status and user_id
	// Fetch booking data with booking_status and user_id
	const getData = async (status: string, user_id: string) => {
		try {
			setLoading(true);
			// Pass both status and user_id in the API call
			const result = await GetBookingsByProfessionalId(status, user_id);
			const newData = result.data.data.map((item, index) => ({
				...item,
				index: index + 1,
			}));
			setBookingData(newData);
		} catch (e) {
			console.error(e);
			if (apiErrorStatus(e) === 403) {
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

	const handleTableChange: TableChangeHandler<WithIndex<Booking>> = (pagination, filters, sorter) => {
		const { field, order } = singleSorter(sorter);
		setTableParams({
			pagination,
			filters,
			sortField: field,
			sortOrder: order,
		});
	};

	const tabsContent = [
		{ label: "Upcoming Bookings", key: "UPCOMING" },
		{ label: "Booking History", key: "COMPLETED" },
	];

	const columns: TableColumnsType<WithIndex<Booking>> = [
		{
			title: "S.No.",
			dataIndex: "index",
			sorter: (a, b) => a.index - b.index,
		},

		{
			title: "Professional's Name",
			dataIndex: ["appointment_professional", "user_profile", "name"],
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
						color = "default";
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
		<div>
			<div
				style={{
				    display: "flex",
				    justifyContent: "space-between",
				    alignItems: "center",
				    marginBottom: "20px"
				}}>
				<div>
					<h3 className="page-title">BOOKING MANAGEMENT</h3>
					<p className="page-sub-title">View Professional's Bookings</p>
				</div>
				<div
					style={{
					    display: "flex",
					    justifyContent: "space-between",
					    alignItems: "center"
					}}>
					<div>
						<Button
							onClick={navigateToUser}
							style={{
							    borderRadius: "5px"
							}}
							icon={<ArrowLeftOutlined />}
							size="large"
						>
							<span style={{ marginLeft: "5px" }}>Return to Users</span>
						</Button>
					</div>
				</div>
			</div>
			<div className="tabs-container">
				<Tabs
					activeKey={activeTab}
					onChange={(key) => {
						setActiveTab(key);
					}}
					items={tabsContent.map((tab) => ({ key: tab.key, label: tab.label }))}
				/>
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
		</div>
	);
};

export default ProfessionalBooking;

