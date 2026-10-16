/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, message, Modal, Button, Input, type TableColumnsType } from "antd";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import "./Customers.css";
import { DeleteUser, GetUsers } from "../../services/Api/UserApi";

import { CloudDownloadOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../utils/table";
import type { User } from "../../types/user";
import { downloadCsv } from "../../utils/csv";

const User = () => {
	const navigate = useNavigate();
	const [data, setData] = useState<WithIndex<User>[]>([]);
	const [userBackupData, setUserBackupData] = useState<WithIndex<User>[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [tableParams, setTableParams] = useState<TableParams>({
		pagination: {
			current: 1,
			pageSize: 100,
		},
		sortField: null,
		sortOrder: null,
	});

	const columns: TableColumnsType<WithIndex<User>> = [
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
      width: 190,
      render: (email, record) => (
        <span>
          {email}{" "}
          {record.status === "PENDING" && (
            <span style={{ color: "var(--color-error)", fontStyle: "italic" }}>
              (Unverified)
            </span>
          )}
        </span>
      ),
    },


		{
			title: "Account Created On",
			dataIndex: "created_at",
			width: "30%",
			render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
		},
		{
			title: "Action",
			dataIndex: "action",
			render: (_, record) => (
				<Space size="middle">
					<Button
						style={{ margin: "0px", borderRadius: "25px" }}
						onClick={(event) => navigateToViewUser(event, record.id)}
						icon={<EyeOutlined />}
						shape="circle" />
					<Button
						style={{ borderRadius: "25px", color: "var(--color-error)", borderColor: "var(--color-error)" }}
						onClick={() => handleDelete([record.id])}
						icon={<DeleteOutlined />}
						danger
						shape="circle" />
				</Space>
			),
		},
	];

	// Get all users
	const getData = async (params: Partial<TableParams> = {}) => {
		try {
		    setLoading(true);

			const {
				pagination = { current: 1, pageSize: 100 },
			} = params;

			const result = await GetUsers(
				localStorage.getItem("adminToken"),
				{
					page: pagination.current, // Current page
					limit: pagination.pageSize, // Page size
					sortBy: "DESC",
				}
			);

			const rows = result?.data?.data?.rows || []; // Safely access rows
			const total = result?.data?.data?.count || 0; // Total number of records

			const newData = rows.map((item, index) => ({
				...item,
				index: index + 1 + ((pagination.current ?? 1) - 1) * (pagination.pageSize ?? 100),
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

			if (apiErrorStatus(e) === 401) {
				navigate("/error401");
			} else if (apiErrorStatus(e) === 500) {
				// An expired session is handled for every request (utils/session.ts).
				console.error("Server error. Please try again later.");
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

	const handleTableChange: TableChangeHandler<WithIndex<User>> = (pagination, filters, sorter) => {
		const { field, order } = singleSorter(sorter);
		setTableParams({
			pagination,
			filters,
			sortField: field,
			sortOrder: order,
		});
	};

	const onSearch = (searchField: string) => {
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

	const handleDelete = (userIds: React.Key[]) => {
		Modal.confirm({
			title: "Confirm",
			content: `Are you sure you want to delete ${
				userIds.length > 1 ? "these users" : "this user"
			}?`,
			onOk: async () => {
				try {
					await DeleteUser(userIds);
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
		downloadCsv(
			"customers.csv",
			["ID", "Name", "Mobile", "Email"],
			data.map((row) => [row.id, row.user_profile.name, row.user_profile.mobile, row.email]),
		);
	};

	const navigateToViewUser = (event: React.MouseEvent<HTMLElement>, id: number) => {
		navigate(`/viewUser/${id}`);
	};

	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedRowKeys: React.Key[]) => {
			setSelectedRowKeys(selectedRowKeys);
		},
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
					<h3 className="page-title">USER MANAGEMENT</h3>
					<p className="page-sub-title">View, delete, and add User</p>
				</div>
				<div
					style={{
					    display: "flex",
					    justifyContent: "space-between",
					    alignItems: "center"
					}}>
					<div>
						<Input
							type="search"
							onChange={(e) => {
								onSearch(e.target.value);
							}}
							placeholder="Search..."
							prefix={<SearchOutlined />}
							size="large"
							style={{
							    width: 240
							}} />

						<Button
							style={{
							    marginLeft: "10px",
							    borderRadius: "5px"
							}}
							onClick={exportToCSV}
							icon={<CloudDownloadOutlined />}
							type="primary"
							size="large" />
						<Button
							style={{
							    marginLeft: "10px",
							    borderRadius: "5px",
							    cursor: "pointer"
							}}
							onClick={() => handleDelete(selectedRowKeys)}
							disabled={!selectedRowKeys.length}
							icon={<DeleteOutlined />}
							danger
							size="large" />
					</div>
				</div>
			</div>
			<Table
				columns={columns}
				rowKey={(record) => record.id}
				dataSource={data}
				pagination={tableParams.pagination}
				loading={loading}
				onChange={handleTableChange}
				rowSelection={rowSelection}
			/>
		</div>
	);
};

export default User;
