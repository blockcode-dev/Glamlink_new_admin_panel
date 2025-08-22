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
	DeleteProductCategory,
	GetProductCategory,
	GetProductCategoryByCategoryId,
} from "../../../services/Api/EcommeceApi";

const ProductCategory = () => {
	const navigate = useNavigate();
	const [serviceData, setServiceData] = useState([]);
	const [serviceBackupData, setServiceBackupData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [serviceListData, setServiceListData] = useState([]);
	const [selectedCategoryId, setSelectedCategoryId] = useState(null);

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
			title: "Number of SubCategory",
			dataIndex: "number_of_product_categories",
			width: "30%",
			render: (number_of_product_categories, record) => {
				if (number_of_product_categories > 0) {
					return (
						<>
							<span>{number_of_product_categories} </span>
							<a
								style={{ color: "#1890ff", cursor: "pointer" }}
								onClick={() => handleViewServices(record.id, record.title)}
							>
								View
							</a>
						</>
					);
				}
				return <span>{number_of_product_categories}</span>;
			},
		},
		{
			title: "Action",
			dataIndex: "action",
			render: (_, record) => (
				<Space size="middle">
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

			// Fetch specialities with pagination and limit
			const result = await GetProductCategory(
				localStorage.getItem("adminToken"),
				{
					...params,
					limit: 100, // Ensure the limit is passed
					page: tableParams.pagination.current, // Use the correct current page from tableParams
				}
			);

			// Adding index for serial number
			const newData = result.data.rows.map((item, index) => ({
				...item,
				index: index + 1 + (tableParams.pagination.current - 1) * 100, // Adjust index based on pagination
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
			console.log("Error: ", e);

			if (e.response && e.response.status === 401) {
				navigate("/error401");
				console.log("You do not have access to this page as a sub-admin.");
			} else if (e.response && e.response.status === 500) {
				// Handle specific 500 error (like JWT expiration)
				const errorMessage = e.response.data?.message || e.response.message;
				if (errorMessage === "jwt expired") {
					navigate("/login");
					message.error("Session Expired");
				} else {
					console.log("Server error. Please try again later.");
				}
			} else {
				console.log("Error loading data. Please try again later.");
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

	const handleTableChange = (pagination, filters, sorter) => {
		setTableParams({
			pagination,
			filters,
			sortField: sorter.field,
			sortOrder: sorter.order,
		});
		getData({
			page: pagination.current,
			pageSize: pagination.pageSize,
			sortField: sorter.field,
			sortOrder: sorter.order,
		});
	};

	const onSearch = (searchField) => {
		const LIST = [...serviceBackupData];
		const searchList = LIST.filter(
			(item) =>
				item.title.toLowerCase().includes(searchField.toLowerCase()) ||
				item.title.toLowerCase().includes(searchField.toLowerCase())
		);
		setServiceData(searchList);
	};

	const handleDelete = (blogIds) => {
		Modal.confirm({
			title: "Confirm",
			content: `Are you sure you want to delete ${
				blogIds.length > 1 ? "these categories" : "this Category"
			}?`,
			onOk: async () => {
				try {
					await DeleteProductCategory(
						blogIds,
						localStorage.getItem("adminToken")
					);
					message.success("Category(s) deleted successfully");
					getData();
				} catch (error) {
					console.error("Error deleting Category(s):", error);
					message.error("Error deleting Category(s)");
				}
			},
		});
	};

	const handleViewServices = async (categoryId, title) => {
		try {
			setSelectedCategoryId(categoryId);

			let result;
			let services = [];

			result = await GetProductCategoryByCategoryId(categoryId);
			services = result?.data?.data || [];

			const dataWithIndex = services.map((item, index) => ({
				...item,
				autoIncrementId: index + 1,
			}));

			setServiceListData(dataWithIndex);
			setIsModalVisible(true);
		} catch (error) {
			console.error("Error fetching service list data: ", error);
		}
	};

	const handleModalClose = () => {
		setIsModalVisible(false);
		setServiceListData([]);
		setSelectedCategoryId(null); // reset
	};

	const navigateToAddBlog = () => {
		navigate("/add-product-category");
	};

	const navigateToEditBlog = (event, id) => {
		navigate(`/edit-product-category/${id}`);
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
					<h3 className="page-title">PRODUCT CATEGORY</h3>
					<p className="page-sub-title">Create,View & Edit Product Category</p>
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
				title="SubCategory List"
				open={isModalVisible}
				onCancel={handleModalClose}
				footer={null}
			>
				<Table
					columns={[
						{
							title: "SubCategory Name",
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
										navigate(`/edit-product-category/${record.category_id}`)
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

export default ProductCategory;
