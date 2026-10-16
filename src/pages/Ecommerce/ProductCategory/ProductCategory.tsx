/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, message, Modal, Button, Input, type TableColumnsType } from "antd";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import {
	DeleteProductCategory,
	GetProductCategory,
	GetProductCategoryByCategoryId,
} from "../../../services/Api/EcommeceApi";

import {
    DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	RightCircleOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { apiErrorStatus } from "../../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../../utils/table";
import type { ProductCategory, ProductSubCategory } from "../../../types/ecommerce";

const ProductCategory = () => {
	const navigate = useNavigate();
	const [serviceData, setServiceData] = useState<WithIndex<ProductCategory>[]>([]);
	const [serviceBackupData, setServiceBackupData] = useState<WithIndex<ProductCategory>[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [serviceListData, setServiceListData] = useState<(ProductSubCategory & { autoIncrementId: number })[]>([]);

	const [tableParams, setTableParams] = useState<TableParams>({
		pagination: {
			current: 1,
			pageSize: 100,
		},
		sortField: null,
		sortOrder: null,
	});

	const columns: TableColumnsType<WithIndex<ProductCategory>> = [
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
								style={{ color: "var(--color-primary)", cursor: "pointer" }}
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

	const handleTableChange: TableChangeHandler<WithIndex<ProductCategory>> = (pagination, filters, sorter) => {
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
				blogIds.length > 1 ? "these categories" : "this Category"
			}?`,
			onOk: async () => {
				try {
					await DeleteProductCategory(blogIds);
					message.success("Category(s) deleted successfully");
					getData();
				} catch (error) {
					console.error("Error deleting Category(s):", error);
					message.error("Error deleting Category(s)");
				}
			},
		});
	};

	const handleViewServices = async (categoryId: number, title: string) => {
		try {

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
	};

	const navigateToAddBlog = () => {
		navigate("/add-product-category");
	};

	const navigateToEditBlog = (event: React.MouseEvent<HTMLElement>, id: number) => {
		navigate(`/edit-product-category/${id}`);
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
					<h3 className="page-title">PRODUCT CATEGORY</h3>
					<p className="page-sub-title">Create,View & Edit Product Category</p>
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
							render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
						},
						{
							title: "",
							key: "redirect",
							render: (text, record) => (
								<RightCircleOutlined
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
		</div>
	);
};

export default ProductCategory;
