/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, message, Modal } from "antd";
import { useNavigate } from "react-router";
import { Box } from "@material-ui/core";
import { InputText } from "primereact/inputtext";
import { DeleteBlog, GetBlogs } from "../../services/Api/BlogsApi";
import { Button } from "primereact/button";

const Blogs = () => {
	const navigate = useNavigate();
	const [serviceData, setServiceData] = useState([]);
	const [serviceBackupData, setServiceBackupData] = useState([]);
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
			width: "10%",
		},
		{
			title: "Title",
			dataIndex: "title",
			width: "30%",
		},
		{
			title: "Blog Category",
			width: "40%",
			dataIndex: "blog_categories", // Make sure this is the correct field in your data
			render: (categories) => {
				if (!categories || categories.length === 0) {
					return "No category selected yet";
				}
				// If categories is an array of objects, join the titles with commas
				return categories.map((cat) => cat.title).join(", ");
			},
		},
		{
			title: "Action",
			dataIndex: "action",
			render: (_, record) => (
				<Space size="middle">
					<Button
						icon="pi pi-eye"
						rounded
						severity="warning"
						outlined
						className="mr-2"
						style={{ margin: "0px", borderRadius: "25px" }}
						onClick={(event) => navigateToViewBlog(event, record.id)}
					/>
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

			// Fetch blogs with pagination and sorting
			const result = await GetBlogs(localStorage.getItem("adminToken"), {
				page: pagination.current,
				limit: pagination.pageSize, // Ensure correct pagination limit
				sortBy: sortField,
				order: sortOrder === "ascend" ? "ASC" : "DESC", // Optional sorting order if needed
			});

			// Adding index for serial number
			const newData = result.data.rows.map((item, index) => ({
				...item,
				index: index + 1 + (pagination.current - 1) * pagination.pageSize,
			}));

			// Update state with fetched blog data
			setServiceData(newData);
			setServiceBackupData(newData);
			setTableParams({
				...tableParams,
				pagination: {
					...pagination,
					total: result.count, // Total number of blogs from the API response
				},
			});
		} catch (e) {
			// Log the full error object for debugging
			console.log("Error: ", e);

			if (e.response && e.response.status === 401) {
				navigate("/error401");
				console.log("You do not have access to this page as a sub-admin.");
			} else if (e.response && e.response.status === 500) {
				// Handling specific 500 error (like JWT expiration)
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
				item.blog_category.title
					.toLowerCase()
					.includes(searchField.toLowerCase())
		);
		setServiceData(searchList);
	};

	const handleDelete = (blogIds) => {
		Modal.confirm({
			title: "Confirm",
			content: `Are you sure you want to delete ${
				blogIds.length > 1 ? "these Blogs" : "this Blog"
			}?`,
			onOk: async () => {
				try {
					await DeleteBlog(blogIds, localStorage.getItem("adminToken"));
					message.success("Blog(s) deleted successfully");
					setSelectedRowKeys([]);

					// Update serviceData to remove deleted blogs
					setServiceData((prevData) =>
						prevData.filter((item) => !blogIds.includes(item.id))
					);
				} catch (error) {
					console.error("Error deleting Blog(s):", error);
					message.error("Error deleting Blog(s)");
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
		navigate("/add-blogs");
	};

	const navigateToEditBlog = (event, id) => {
		navigate(`/edit-blog/${id}`);
	};

	const navigateToViewBlog = (event, id) => {
		navigate(`/view-blog/${id}`);
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
					<h3 className="page-title">BLOG MANAGEMENT</h3>
					<p className="page-sub-title">View, delete, and add Blog</p>
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
		</Box>
	);
};

export default Blogs;
