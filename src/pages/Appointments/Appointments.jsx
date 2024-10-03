/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space } from "antd";
import { useNavigate } from "react-router";
import { Box } from "@material-ui/core";
import { InputText } from "primereact/inputtext";
import { GetAllAppointments } from "../../services/Api/AppointmentsApi";

const Appointments = () => {
	const navigate = useNavigate();
	const [serviceData, setServiceData] = useState([]);
	const [serviceBackupData, setServiceBackupData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [serviceListData, setServiceListData] = useState([]);

	const [tableParams, setTableParams] = useState({
		pagination: {
			current: 1,
			pageSize: 100,
		},
		sortField: null,
		sortOrder: null,
	});

	const columns = [
		{
			title: "S.No.",
			dataIndex: "index",
			sorter: (a, b) => a.index - b.index,
			width: "5%",
		},
		{
			title: "Profesisonal's Name",
			dataIndex: ["appointment_counselor", "user_profile", "name"],
			width: "20%",
		},
		{
			title: "User's Name",
			dataIndex: ["appointment_user", "user_profile", "name"],
			width: "20%",
		},
		{
			title: "Status",
			dataIndex: "status",
			width: "20%",
			render: (status) => {
				let textColor = "#000"; // Default text color

				switch (status) {
					case "PENDING":
						textColor = "#FFD700"; // Yellow
						break;
					case "ACCEPTED":
						textColor = "#800080"; // Purple
						break;
					case "COMPLETED":
						textColor = "#28a745"; // Green
						break;
					case "ONGOING":
						textColor = "#FFA500"; // Orange
						break;
					case "REJECTED":
					case "CANCELED":
						textColor = "#FF4D4F"; // Red
						break;
					default:
						textColor = "#000"; // Default to black if status is unknown
				}

				return (
					<span
						style={{
							color: textColor,
							padding: "5px 10px",
							borderRadius: "5px",
							fontWeight: "bold",
							backgroundColor: "#fff", // Set background to white
						}}
					>
						{status}
					</span>
				);
			},
		},
		{
			title: "Notes",
			dataIndex: "notes",
			width: "20%",
		},

		{
			title: "Date",
			dataIndex: ["appointment_slot", "date"],
			width: "20%",
		},
		{
			title: "Time",
			dataIndex: ["appointment_slot", "start_time"],
			width: "20%",
		},
	];

	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedRowKeys) => {
			setSelectedRowKeys(selectedRowKeys);
		},
	};

	const getData = async (params = {}) => {
		try {
			setLoading(true);
			const { pagination, sortField, sortOrder } = params;
			const result = await GetAllAppointments(
				localStorage.getItem("adminToken"),
				{
					page: pagination.current,
					limit: pagination.pageSize,
					sortBy: sortField,
				}
			);

			// Adding index for serial number
			const newData = result.data.rows.map((item, index) => ({
				...item,
				index: index + 1 + (pagination.current - 1) * pagination.pageSize,
			}));
			console.log(newData, "newData");

			setServiceData(newData);
			setServiceBackupData(newData);
			setTableParams({
				...tableParams,
				pagination: {
					...pagination,
					total: result.count, // Total count from the API response
				},
			});
		} catch (e) {
			console.log(e);
			if (e.response && e.response.status === 401) {
				navigate("/error401");
				console.log("You do not have access to this page as a sub-admin.");
			} else {
				console.log("Error loading data. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleTableChange = (pagination, filters, sorter) => {
		setTableParams({
			pagination,
			sortField: sorter.field,
			sortOrder: sorter.order,
		});
	};

	const onSearch = (searchField) => {
		const LIST = [...serviceBackupData];
		const searchList = LIST.filter(
			(item) =>
				item.appointment_counselor.user_profile.name
					.toLowerCase()
					.includes(searchField.toLowerCase()) || // Professional's Name
				item.appointment_user.user_profile.name
					.toLowerCase()
					.includes(searchField.toLowerCase()) || // User's Name
				item.appointment_slot.date
					.toLowerCase()
					.includes(searchField.toLowerCase()) || // Date
				item.status.toLowerCase().includes(searchField.toLowerCase()) // Status
		);
		setServiceData(searchList);
	};
	// const handleDelete = (blogIds) => {
	// 	Modal.confirm({
	// 		title: "Confirm",
	// 		content: `Are you sure you want to delete ${
	// 			blogIds.length > 1 ? "these Categroy" : "this Categroy"
	// 		}?`,
	// 		onOk: async () => {
	// 			try {
	// 				await DeleteServiceCategory(blogIds, localStorage.getItem("adminToken"));
	// 				message.success("Categroy(s) deleted successfully");
	// 				setSelectedRowKeys([]);
	// 				getData();
	// 			} catch (error) {
	// 				console.error("Error deleting Categroy(s):", error);
	// 				message.error("Error deleting Categroy(s)");
	// 			}
	// 		},
	// 	});
	// };

	useEffect(() => {
		getData({
			pagination: tableParams.pagination,
			sortField: tableParams.sortField,
			sortOrder: tableParams.sortOrder,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const navigateToAddBlog = () => {
		navigate("/add-service-categories");
	};

	const navigateToEditBlog = (event, id) => {
		navigate(`/edit-service-categories/${id}`);
	};

	const navigateToViewBlog = (event, id) => {
		navigate(`/view-service-categories/${id}`);
	};

	const handleModalClose = () => {
		setIsModalVisible(false);
		setServiceListData([]); // Clear the data on modal close
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
					<h3 className="page-title">Appointment Management</h3>
					<p className="page-sub-title">View Appointment List</p>
				</div>
				<Box display="flex" justifyContent="space-between" alignItems="center">
					<Box>
						<span className="p-input-icon-left">
							<i className="pi pi-search" />
							<InputText
								type="search"
								onChange={(e) => {
									onSearch(e.target.value);
								}}
								placeholder="Search..."
							/>
						</span>
					</Box>
				</Box>
			</Box>
			<Table
				columns={columns}
				rowKey={(record) => record.id}
				dataSource={serviceData}
				pagination={tableParams.pagination}
				loading={loading}
				onChange={handleTableChange}
				// rowSelection={rowSelection}
			/>
		</Box>
	);
};

export default Appointments;
