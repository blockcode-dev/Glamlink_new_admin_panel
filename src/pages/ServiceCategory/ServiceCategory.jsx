/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, message, Modal } from "antd";
import { useNavigate } from "react-router";
import { Box } from "@material-ui/core";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import moment from "moment/moment";
import {
	DeleteServiceCategory,
	GetServiceCategory,
	GetServiceListByCategoryId,
} from "../../services/Api/ServiceApi";

const ServiceCategory = () => {
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
			width: "10%",
		},
		{
			title: "Title",
			dataIndex: "title",
			width: "30%",
		},
		{
			title: "Number of Services",
			dataIndex: "number_of_service_list",
			width: "30%",
			render: (number_of_service_list, record) => {
				if (number_of_service_list > 0) {
					return (
						<>
							<span>{number_of_service_list} </span>
							<a
								style={{ color: "#1890ff", cursor: "pointer" }}
								onClick={() => handleViewServices(record.id)} // Call function to view services
							>
								View
							</a>
						</>
					);
				}
				return <span>{number_of_service_list}</span>;
			},
		},
		{
			title: "Action",
			dataIndex: "action",
			render: (_, record) => (
				<Space size="middle">
					{/* <Button
						icon="pi pi-eye"
						rounded
						severity="warning"
						outlined
						className="mr-2"
						style={{ margin: "0px", borderRadius: "25px" }}
						onClick={(event) => navigateToViewBlog(event, record.id)}
					/> */}
					<Button
						icon="pi pi-pencil"
						rounded
						outlined
						className="mr-2"
						style={{ margin: "0px", borderRadius: "25px" }}
						onClick={(event) => navigateToEditBlog(event, record.id)}
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
			const result = await GetServiceCategory(
				localStorage.getItem("adminToken"),
				{
					page: pagination.current,
					limit: pagination.pageSize, // Pass 'limit' instead of 'pageSize'
					sortBy: sortField,
				}
			);

			// Adding index for serial number
			const newData = result.data.rows.map((item, index) => ({
				...item,
				index: index + 1 + (pagination.current - 1) * pagination.pageSize,
			}));

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

	const handleViewServices = async (categoryId) => {
		try {
			// Fetch the service list data by category ID
			let result = await GetServiceListByCategoryId(categoryId);

			// Add auto-increment index to the data for better display
			const dataWithIndex = result.data.data.map((item, index) => ({
				...item,
				autoIncrementId: index + 1,
			}));

			// Set the service list data to display in the modal
			setServiceListData(dataWithIndex);

			// Show the modal
			setIsModalVisible(true);
		} catch (error) {
			console.error("Error fetching service list data: ", error);
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
				item.title.toLowerCase().includes(searchField.toLowerCase()) ||
				item.title
					.toLowerCase()
					.includes(searchField.toLowerCase())
		);
		setServiceData(searchList);
	};

	const handleDelete = (blogIds) => {
		Modal.confirm({
			title: "Confirm",
			content: `Are you sure you want to delete ${
				blogIds.length > 1 ? "these Categroy" : "this Categroy"
			}?`,
			onOk: async () => {
				try {
					await DeleteServiceCategory(blogIds, localStorage.getItem("adminToken"));
					message.success("Categroy(s) deleted successfully");
					setSelectedRowKeys([]);
					getData();
				} catch (error) {
					console.error("Error deleting Categroy(s):", error);
					message.error("Error deleting Categroy(s)");
				}
			},
		});
	};
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
					<h3 className="page-title">SERVICE CATEGORY</h3>
					<p className="page-sub-title">
						View, delete, and add Service Category
					</p>
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
						<Button
							icon="pi pi-plus"
							severity="info"
							style={{
								margin: "0px 10px",
								borderRadius: "5px",
								height: "47px",
							}}
							onClick={navigateToAddBlog}
						/>
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
				rowSelection={rowSelection}
			/>

			<Modal
				centered
				width={800}
				title="Service List"
				open={isModalVisible}
				onCancel={handleModalClose}
				footer={null}
			>
				<Table
					columns={[
						{
							title: "Service Name",
							dataIndex: "title",
							key: "title",
						},
						{
							title: "Created On",
							dataIndex: "created_at",
							width: "30%",
							render: (date) => moment(date).format("YYYY-MM-DD HH:mm:ss"),
						},
						{
							title: "",
							key: "redirect",
							render: (text, record) => (
								<IoArrowForwardCircleOutline
									style={{ fontSize: "20px", cursor: "pointer" }}
									onClick={() =>
										navigate(`/edit-service-categories/${record.category_id}`)
									}
								/>
							),
						},
					]}
					dataSource={serviceListData}
					rowKey={(record) => record.id}
					pagination={false}
				/>
			</Modal>
		</Box>
	);
};

export default ServiceCategory;
