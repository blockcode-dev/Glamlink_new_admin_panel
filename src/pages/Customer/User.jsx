/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, message, Modal } from "antd";
import { Button } from "primereact/button";
import { useNavigate } from "react-router";
import { InputText } from "primereact/inputtext";
import { Box } from "@material-ui/core";
import moment from "moment/moment";
import "./Customers.css";
import { DeleteUser, GetUsers } from "../../services/Api/UserApi";

const User = () => {
	const navigate = useNavigate();
	const [data, setData] = useState([]);
	const [userBackupData, setUserBackupData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
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
			title: "Name",
			dataIndex: ["user_profile", "name"],
			sorter: (a, b) => a.user_profile.name.localeCompare(b.user_profile.name),
			width: "20%",
		},
		{
			title: "UserName",
			dataIndex: "user_name",
			width: "20%",
		},
		{
			title: "Email",
			dataIndex: "email",
			width: "20%",
		},

		{
			title: "No. Of Post",
			dataIndex: ["user_profile", "no_of_post_posted"],
			width: "10%",
		},

		{
			title: "Account Created On",
			dataIndex: "created_at",
			width: "30%",
			render: (date) => moment(date).format("YYYY-MM-DD HH:mm:ss"),
		},
		{
			title: "Action",
			dataIndex: "action",
			render: (_, record) => (
				<Space size="middle">
					<Button
						icon="pi pi-eye"
						rounded
						outlined
						className="mr-2"
						style={{ margin: "0px", borderRadius: "25px" }}
						onClick={(event) => navigateToViewUser(event, record.id)}
					/>
					<Button
						icon="pi pi-trash"
						rounded
						outlined
						severity="danger"
						style={{ borderRadius: "25px", color: "red", borderColor: "red" }}
						onClick={() => handleDelete([record.id])}
					/>
				</Space>
			),
		},
	];

	// Get all users
	const getData = async (params = {}) => {
		try {
			setLoading(true);

			const {
				pagination = { current: 1, pageSize: 100 },
				sortField = null,
				sortOrder = null,
			} = params;

			const result = await GetUsers(
				localStorage.getItem("adminToken"),
				{
					page: pagination.current, // Current page
					limit: pagination.pageSize, // Page size
					sortBy: "DESC",
					order: sortField,
				}
			);

			// Debugging API Response
			console.log("API Response:", result);

			const rows = result?.data?.data?.rows || []; // Safely access rows
			const total = result?.data?.data?.count || 0; // Total number of records

			const newData = rows.map((item, index) => ({
				...item,
				index: index + 1 + (pagination.current - 1) * pagination.pageSize,
			}));

			setData(newData); // Update current page's data
			setUserBackupData(newData); // Backup for search functionality

			setTableParams((prev) => ({
				...prev,
				pagination: {
					...pagination,
					total, // Update total records count
				},
			}));
		} catch (e) {
			console.error("Error loading data:", e);

			if (e.response?.status === 401) {
				navigate("/error401");
			} else if (e.response?.status === 500) {
				const errorMessage = e.response.data?.message || e.response.message;
				if (errorMessage === "jwt expired") {
					message.error("Session Expired");
					navigate("/login");
				} else {
					console.error("Server error. Please try again later.");
				}
			} else {
				message.error("Error loading data. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (tableParams.pagination.current && tableParams.pagination.pageSize) {
			getData({
				pagination: tableParams.pagination,
				sortField: tableParams.sortField,
				sortOrder: tableParams.sortOrder,
			});
		}
	}, [
		tableParams.pagination.current,
		tableParams.pagination.pageSize,
		tableParams.sortField,
		tableParams.sortOrder,
	]);

	const handleTableChange = (pagination, filters, sorter) => {
		setTableParams({
			pagination,
			filters,
			sortField: sorter.field,
			sortOrder: sorter.order,
		});
	};

	const onSearch = (searchField) => {
		const LIST = [...userBackupData];
		const searchList = [];

		for (let i in LIST) {
			if (
				LIST[i]?.user_profile?.name
					?.toLowerCase()
					?.includes(searchField?.toLowerCase()) ||
				LIST[i]?.email?.toLowerCase()?.includes(searchField?.toLowerCase())
			) {
				searchList.push(LIST[i]);
			}
		}

		setData(searchList);
	};

	const handleDelete = (userIds) => {
		Modal.confirm({
			title: "Confirm",
			content: `Are you sure you want to delete ${
				userIds.length > 1 ? "these users" : "this user"
			}?`,
			onOk: async () => {
				try {
					await DeleteUser(userIds, localStorage.getItem("adminToken"));
					message.success("Employee(s) deleted successfully");
					getData();
				} catch (error) {
					console.error("Error deleting employee(s):", error);
					message.error("Error deleting employee(s)");
				}
			},
		});
	};

	const exportToCSV = () => {
		const csvContent =
			"data:text/csv;charset=utf-8," +
			"ID,Name,Mobile,Email\n" +
			data
				.map(
					(row) =>
						`${row.id},${row.user_profile.name},${row.user_profile.mobile},${row.email}`
				)
				.join("\n");

		const encodedURI = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedURI);
		link.setAttribute("download", "customers.csv");
		document.body.appendChild(link);
		link.click();
	};

	const navigateToViewUser = (event, id) => {
		navigate(`/viewUser/${id}`);
	};

	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedRowKeys) => {
			setSelectedRowKeys(selectedRowKeys);
		},
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
					<h3 className="page-title">USER MANAGEMENT</h3>
					<p className="page-sub-title">View, delete, and add User</p>
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

						<Button
							icon="pi pi-cloud-download"
							severity="success"
							style={{
								marginLeft: "10px",
								borderRadius: "5px",
								height: "47px",
							}}
							onClick={exportToCSV}
						/>
						<Button
							icon="pi pi-trash"
							severity="danger"
							style={{
								marginLeft: "10px",
								borderRadius: "5px",
								height: "47px",
								cursor: "pointer",
							}}
							onClick={() => handleDelete(selectedRowKeys)}
							disabled={!selectedRowKeys.length}
						/>
						{/* <Button
							icon="pi pi-plus"
							severity="info"
							style={{
								margin: "0px 10px",
								borderRadius: "5px",
								height: "47px",
							}}
							onClick={navigateToAddUser}
						/> */}
					</Box>
				</Box>
			</Box>
			<Table
				columns={columns}
				rowKey={(record) => record.id}
				dataSource={data}
				pagination={tableParams.pagination}
				loading={loading}
				onChange={handleTableChange}
				rowSelection={rowSelection}
			/>
		</Box>
	);
};

export default User;
