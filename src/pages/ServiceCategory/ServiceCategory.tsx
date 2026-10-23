/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, message, Modal, Button, Input, type TableColumnsType } from "antd";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import {
	DeleteServiceCategory,
	GetServiceCategory,
	GetServiceListByCategoryId,
	GetOtherServiceListByCategoryId,
	DeleteOtherServiceCategory,
} from "../../services/Api/ServiceApi";

import {
    DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	RightCircleOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { apiErrorStatus } from "../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../utils/table";
import type { ServiceCategory, ServiceListItem } from "../../types/catalog";

// Service-list modal rows, numbered for display.
type ServiceRow = ServiceListItem & { autoIncrementId: number };

const ServiceCategory = () => {
	const navigate = useNavigate();
	const [serviceData, setServiceData] = useState<WithIndex<ServiceCategory>[]>([]);
	const [serviceBackupData, setServiceBackupData] = useState<WithIndex<ServiceCategory>[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [serviceListData, setServiceListData] = useState<ServiceRow[]>([]);
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

	const [tableParams, setTableParams] = useState<TableParams>({
		pagination: {
			current: 1,
			pageSize: 100,
		},
		sortField: null,
		sortOrder: null,
	});

	const columns: TableColumnsType<WithIndex<ServiceCategory>> = [
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
								style={{ color: "var(--color-primary)", cursor: "pointer" }}
								onClick={() => handleViewServices(record.id, record.title)}
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
			render: (_, record) => {
				// Hide edit & delete if id === 23 and title is not 'Other'
				if (record.id === 23) {
					return null;
				}

				return (
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
				);
			},
		},
	];

	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedRowKeys: React.Key[]) => {
			setSelectedRowKeys(selectedRowKeys);
		},
	};

	const getData = async (params: TableParams) => {
		try {
			setLoading(true);

			const { pagination, sortOrder } = params;
			// Fetch service categories with pagination and sorting
			const result = await GetServiceCategory({
                page: pagination.current,
                limit: pagination.pageSize, // Ensure correct pagination limit
                sortBy: sortOrder === "ascend" ? "ASC" : "ASC", // <== use ASC/DESC here
            });

			// Adding index for serial numbers
			const newData = result.data.rows.map((item, index) => ({
				...item,
				index: index + 1 + ((pagination.current ?? 1) - 1) * (pagination.pageSize ?? 100),
			}));

			// If 'Other' category is present, get real service count
			const otherIndex = newData.findIndex((item) => item.id === 23);
			if (otherIndex !== -1) {
				try {
				    const otherServiceRes = await GetOtherServiceListByCategoryId({
						category_id: 23,
					});
					const serviceCount =
						otherServiceRes?.data?.data?.number_of_service_list ?? 0;
					newData[otherIndex].number_of_service_list = serviceCount;
				} catch (e) {
					console.warn("Failed to fetch services for 'Other' category", e);
				}
			}

			// Update the state with the new data and pagination
			setServiceData(newData);
			setServiceBackupData(newData);
			setTableParams({
				...tableParams,
				pagination: {
					...pagination,
					total: result.data.count,
				},
			});
		} catch (e) {
			// Log the full error object for debugging purposes
			console.error("Error: ", e);

			if (apiErrorStatus(e) === 403) {
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

	const handleViewServices = async (categoryId: number, title: string) => {
		try {
			setSelectedCategoryId(categoryId);

			let result;
			let services = [];

			if (categoryId === 23) {
				// Result is nested: data.data.data
				result = await GetOtherServiceListByCategoryId({ category_id: 23 });
				services = result?.data?.data?.data || [];
			} else {
				result = await GetServiceListByCategoryId(categoryId);
				services = result?.data?.data || [];
			}

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

	const handleTableChange: TableChangeHandler<WithIndex<ServiceCategory>> = (pagination, filters, sorter) => {
		const { field, order } = singleSorter(sorter);
		setTableParams({
			pagination,
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
				blogIds.length > 1 ? "these Categroy" : "this Categroy"
			}?`,
			onOk: async () => {
				try {
					await DeleteServiceCategory(blogIds);
					message.success("Categroy(s) deleted successfully");
					setSelectedRowKeys([]);
					getData(tableParams);
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

	const navigateToEditBlog = (event: React.MouseEvent<HTMLElement>, id: number) => {
		navigate(`/edit-service-categories/${id}`);
	};

	const handleModalClose = () => {
		setIsModalVisible(false);
		setServiceListData([]);
		setSelectedCategoryId(null); // reset
	};

	const handleDeleteOther = (blogIds: React.Key[]) => {
		Modal.confirm({
			title: "Confirm",
			content: `Are you sure you want to delete ${
				blogIds.length > 1 ? "these Service" : "this Service"
			}?`,
			onOk: async () => {
				try {
					await DeleteOtherServiceCategory(
						blogIds
					);
					message.success("Service(s) deleted successfully");
					setSelectedRowKeys([]);
					setIsModalVisible(false);


					// Update serviceData to remove deleted blogs
					setServiceData((prevData) =>
						prevData.filter((item) => !blogIds.includes(item.id))
					);
				} catch (error) {
					console.error("Error deleting Service(s):", error);
					message.error("Error deleting Service(s)");
				}
			},
		});
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
					<h3 className="page-title">SERVICE CATEGORY</h3>
					<p className="page-sub-title">
						View, delete, and add Service Category
					</p>
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
				title="Service List"
				open={isModalVisible}
				onCancel={handleModalClose}
				footer={null}
			>
				{selectedCategoryId === 23 ? (
					<>
						<Table<ServiceRow>
							columns={[
								{
									title: "Service Name",
									dataIndex: "name",
									key: "name",
								},
								{
									title: "Professional Name",
									dataIndex: ["service_user", "user_profile", "name"],
									key: "professional_name",
								},
								{
									title: "Created On",
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
												style={{
													borderRadius: "25px",
													color: "var(--color-error)",
													borderColor: "var(--color-error)",
												}}
												onClick={() => handleDeleteOther([record.id])}
												icon={<DeleteOutlined />}
												danger
												shape="circle" />
										</Space>
									),
								},
							]}
							dataSource={serviceListData}
							rowKey={(record) => record.id}
							pagination={false}
						/>
					</>
				) : (
					<Table<ServiceRow>
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
								render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
							},
							{
								title: "",
								key: "redirect",
								render: (text, record) => (
									<RightCircleOutlined
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
				)}
			</Modal>
		</div>
	);
};

export default ServiceCategory;
