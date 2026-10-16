/** @format */

import React, { useEffect, useState } from "react";
import { Table, message, Space, Button, type TableColumnsType } from "antd";
import { useNavigate } from "react-router";
import { GetAdmins, DeleteAdmin } from "../../services/Api/Api";
import Alert from "../Customer/Alert";
import { PlusOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams } from "../../utils/table";
import type { Admin } from "../../types/admin";

const AdminUser = () => {
	const navigate = useNavigate();
	const [roleData, setRoleData] = useState<Admin[]>([]);
	const [loading, setLoading] = useState(false);
	const [tableParams, setTableParams] = useState<TableParams>({
		pagination: {
			current: 1,
			pageSize: 100,
		},
		sortField: null,
		sortOrder: null,
	});

	const getData = async () => {
		try {
		    setLoading(true);
			let result = await GetAdmins(localStorage.getItem("adminToken"));
			setRoleData(result.data.data);
		} catch (e) {
			console.error(e);
			if (apiErrorStatus(e) === 401) {
				navigate("/error401");
				message.error("You do not have access to this page.");
			} else {
				message.error("Error loading data. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
	}, [tableParams]);

	const handleTableChange: TableChangeHandler<Admin> = (pagination, filters, sorter) => {
		const { field, order } = singleSorter(sorter);
		setTableParams({
			pagination,
			filters,
			sortField: field,
			sortOrder: order,
		});
	};

	const navigateToAddAdmin = () => {
		navigate("/addAdmin");
	};

	const removeUser = (user_id: number) => {
		DeleteAdmin(user_id, localStorage.getItem("adminToken"))
			.then((res) => {
				message.success(res?.data?.message);
				getData(); // Reload data after deleting
			})
			.catch((error) => {
				console.error(error);
				message.error("Error deleting admin.");
			});
	};

	// Define columns for antd table
	const columns: TableColumnsType<Admin> = [
    {
			title: "S.No.",
			dataIndex: "index",
			render: (text, record, index) =>
				((tableParams.pagination.current ?? 1) - 1) * (tableParams.pagination.pageSize ?? 100) + index + 1,
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			width: 350,
		},
		{
			title: "Email",
			dataIndex: "email",
			key: "email",
			width: 350,
		},
		{
			title: "Actions",
			key: "action",
			width: 350,
			render: (text, record) => (
				<Space>
					<Alert title="Admin" handleDelete={() => removeUser(record.id)} />
				</Space>
			),
		},
	];

	return (
		<div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginBottom: "20px",
				}}
			>
				<div>
					<h3 className="page-title">Admin List</h3>
					<p className="page-sub-title">View, Edit, Delete, and Create Admin</p>
				</div>
				<Button
					onClick={navigateToAddAdmin}
					style={{
					    marginLeft: "10px",
					    borderRadius: "5px"
					}}
					icon={<PlusOutlined />}
					type="primary"
					size="large"
				>Add New Admin</Button>
			</div>
			<Table
				dataSource={roleData}
				columns={columns}
				rowKey={(record) => record.id}
				pagination={tableParams.pagination}
				loading={loading}
				onChange={handleTableChange}
			/>
		</div>
	);
};

export default AdminUser;
