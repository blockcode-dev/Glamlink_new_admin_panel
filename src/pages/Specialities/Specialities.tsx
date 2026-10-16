/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, message, Modal, Button, Input, type TableColumnsType } from "antd";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import {
	DeleteSpecialities,
	GetSpecialities,
	GetUserByProfessionId,
} from "../../services/Api/SpecialitiesApi";

import {
    DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	RightCircleOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { apiErrorStatus } from "../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../utils/table";
import type { ProfessionUser, Speciality } from "../../types/catalog";

const Specialities = () => {
	const navigate = useNavigate();
	const [serviceData, setServiceData] = useState<WithIndex<Speciality>[]>([]);
	const [serviceBackupData, setServiceBackupData] = useState<WithIndex<Speciality>[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [userListData, setUserListData] = useState<(ProfessionUser & { autoIncrementId: number })[]>([]);

	const [tableParams, setTableParams] = useState<TableParams>({
		pagination: {
			current: 1,
			pageSize: 100,
		},
		sortField: null,
		sortOrder: null,
	});

	const columns: TableColumnsType<WithIndex<Speciality>> = [
		{
			title: "S.No.",
			dataIndex: "index",
			sorter: (a, b) => a.index - b.index,
			width: "10%",
		},
		{
			title: "Title",
			dataIndex: "title",
			width: "30%",
		},
		{
			title: "Number of Services",
			dataIndex: "number_of_users",
			width: "30%",
			render: (number_of_users, record) => {
				if (number_of_users > 0) {
					return (
						<>
							<span>{number_of_users} </span>
							<a
								style={{ color: "var(--color-primary)", cursor: "pointer" }}
								onClick={() => handleViewServices(record.id)} // Call function to view services
							>
								View
							</a>
						</>
					);
				}
				return <span>{number_of_users}</span>;
			},
		},
		{
			title: "Action",
			dataIndex: "action",
			render: (_, record) => (
				<Space size="middle">
					<Button
						style={{ margin: "0px", borderRadius: "25px" }}
						onClick={(event) => navigateToEditBlog(event, record.id)}
						icon={<EditOutlined />}
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

	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedRowKeys: React.Key[]) => {
			setSelectedRowKeys(selectedRowKeys);
		},
	};

	const getData = async (params = {}) => {
		try {
			setLoading(true);

			// Fetch specialities with pagination and limit
			const result = await GetSpecialities(localStorage.getItem("adminToken"), {
				...params,
				limit: 100, // Ensure the limit is passed
				page: tableParams.pagination.current, // Use the correct current page from tableParams
			});

			// Adding index for serial number
			const newData = result.data.rows.map((item, index) => ({
				...item,
				index: index + 1 + ((tableParams.pagination.current ?? 1) - 1) * 100, // Adjust index based on pagination
			}));

			// Update the state with new data
			setServiceData(newData);
			setServiceBackupData(newData);

			// Update the table's pagination with total count
			setTableParams((prevParams) => ({
				...prevParams,
				pagination: {
					...prevParams.pagination,
					total: result.data.count, // Access the correct total count from the API response
				},
			}));
		} catch (e) {
			// Log the full error for debugging
			console.error("Error: ", e);

			if (apiErrorStatus(e) === 401) {
				navigate("/error401");
				console.error("You do not have access to this page as a sub-admin.");
			} else if (apiErrorStatus(e) === 500) {
				// An expired session is handled for every request (utils/session.ts).
				console.error("Server error. Please try again later.");
			} else {
				console.error("Error loading data. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getData({
			page: tableParams.pagination.current,
			pageSize: tableParams.pagination.pageSize,
			sortField: tableParams.sortField,
			sortOrder: tableParams.sortOrder,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleViewServices = async (categoryId: number) => {
		try {
			// Fetch the service list data by category ID
			let result = await GetUserByProfessionId(categoryId);

			// Add auto-increment index to the data for better display
			const dataWithIndex = result.data.data.map((item, index) => ({
				...item,
				autoIncrementId: index + 1,
			}));

			// Set the service list data to display in the modal
			setUserListData(dataWithIndex);

			// Show the modal
			setIsModalVisible(true);
		} catch (error) {
			console.error("Error fetching service list data: ", error);
		}
	};

	const handleTableChange: TableChangeHandler<WithIndex<Speciality>> = (pagination, filters, sorter) => {
		const { field, order } = singleSorter(sorter);
		setTableParams({
			pagination,
			filters,
			sortField: field,
			sortOrder: order,
		});
		getData({
			page: pagination.current,
			pageSize: pagination.pageSize,
			sortField: field,
			sortOrder: order,
		});
	};

	const onSearch = (searchField: string) => {
		const LIST = [...serviceBackupData];
		const searchList = LIST.filter(
			(item) =>
				item.title.toLowerCase().includes(searchField.toLowerCase()) ||
				item.title.toLowerCase().includes(searchField.toLowerCase())
		);
		setServiceData(searchList);
	};

	const handleDelete = (blogIds: React.Key[]) => {
		Modal.confirm({
			title: "Confirm",
			content: `Are you sure you want to delete ${
				blogIds.length > 1 ? "these Specialities" : "this Speciality"
			}?`,
			onOk: async () => {
				try {
					await DeleteSpecialities(blogIds);
					message.success("Speciality(s) deleted successfully");
					getData();
				} catch (error) {
					console.error("Error deleting Speciality(s):", error);
					message.error("Error deleting Speciality(s)");
				}
			},
		});
	};
	const handleModalClose = () => {
		setIsModalVisible(false);
		setUserListData([]); // Clear the data on modal close
	};

	const navigateToAddBlog = () => {
		navigate("/add-specialities");
	};

	const navigateToEditBlog = (event: React.MouseEvent<HTMLElement>, id: number) => {
		navigate(`/edit-specialities/${id}`);
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
					<h3 className="page-title">SPECIALITIES</h3>
					<p className="page-sub-title">Create,View & Edit Specialities</p>
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
							    borderRadius: "5px",
							    cursor: "pointer"
							}}
							onClick={() => handleDelete(selectedRowKeys)}
							disabled={!selectedRowKeys.length}
							icon={<DeleteOutlined />}
							danger
							size="large" />
						<Button
							style={{
							    margin: "0px 10px",
							    borderRadius: "5px"
							}}
							onClick={navigateToAddBlog}
							icon={<PlusOutlined />}
							type="primary"
							size="large" />
					</div>
				</div>
			</div>
			<Table
				columns={columns}
				rowKey={(record) => record.id}
				dataSource={serviceData}
				pagination={tableParams.pagination}
				loading={loading}
				onChange={handleTableChange}
				rowSelection={rowSelection}
			/>

			<Modal
				centered
				width={800}
				title="User List"
				open={isModalVisible}
				onCancel={handleModalClose}
				footer={null}
			>
				<Table
					columns={[
						{
							title: "User Name",
							dataIndex: "name",
							key: "name",
						},
						{
							title: "Created On",
							dataIndex: "created_at",
							width: "30%",
							render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
						},
						{
							title: "",
							key: "redirect",
							render: (text, record) => (
								<RightCircleOutlined
									style={{ fontSize: "20px", cursor: "pointer" }}
									onClick={() => navigate(`/view-user/${record.id}`)}
								/>
							),
						},
					]}
					dataSource={userListData}
					rowKey={(record) => record.id}
					pagination={false}
				/>
			</Modal>
		</div>
	);
};

export default Specialities;
