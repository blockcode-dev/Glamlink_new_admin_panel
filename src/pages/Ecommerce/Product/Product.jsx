/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, message, Select, Drawer } from "antd";
import { Button } from "primereact/button";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
import { useNavigate } from "react-router";
import { InputText } from "primereact/inputtext";
import { Box } from "@material-ui/core";
import { Tooltip } from "antd";
import DOMPurify from "dompurify";
import { FaStar } from "react-icons/fa";
import {
	GetAllNumeralCategory,
	GetProduct,
	UpdateProduct,
} from "../../../services/Api/EcommeceApi";

const Product = () => {
	const navigate = useNavigate();
	const [data, setData] = useState([]);
	const [userBackupData, setUserBackupData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [drawerVisible, setDrawerVisible] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [categories, setCategories] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [selectedStatus, setSelectedStatus] = useState(null);

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
			width: "5%",
			sorter: (a, b) => a.index - b.index,
		},
		{
			title: "Product Name",
			dataIndex: "name",
			sorter: (a, b) => a.user_profile.name.localeCompare(b.user_profile.name),
			width: "20%",
		},

		{
			title: "Sold By",
			dataIndex: ["user_product", "user_profile", "name"],
			width: "20%",
		},
		{
			title: "Average Rating",
			dataIndex: "average_rating",
			width: "20%",
			render: (_, record) => {
				// Function to render stars based on the rating
				const renderStars = (rating) => {
					const validRating = parseFloat(rating); // Ensure rating is a valid number
					if (isNaN(validRating) || validRating < 0) return null; // Return null if the rating is invalid

					const fullStars = Math.floor(validRating); // Full stars
					const halfStar = validRating % 1 >= 0.5; // Half star check
					const emptyStars = 5 - fullStars - (halfStar ? 1 : 0); // Empty stars

					// Rendering each star with onClick functionality
					return (
						<div style={{ display: "flex", alignItems: "center" }}>
							{/* Full Stars */}
							{[...Array(fullStars)].map((_, i) => (
								<FaStar
									key={`full-${i}`}
									color="#ffc107"
									style={{
										marginRight: "2px",
										cursor: "pointer", // Make the cursor a pointer when hovering over the stars
									}}
									onClick={() => navigate(`/product-rating/${record.id}`)} // Redirect on star click
								/>
							))}
							{/* Half Star */}
							{halfStar && (
								<FaStar
									key="half"
									color="#ffc107"
									style={{
										marginRight: "2px",
										opacity: 0.5,
										cursor: "pointer", // Make the cursor a pointer when hovering over the star
									}}
									onClick={() => navigate(`/product-rating/${record.id}`)} // Redirect on half star click
								/>
							)}
							{/* Empty Stars */}
							{[...Array(emptyStars)].map((_, i) => (
								<FaStar
									key={`empty-${i}`}
									color="#e4e5e9"
									style={{
										marginRight: "2px",
										cursor: "pointer", // Make the cursor a pointer when hovering over the stars
									}}
									onClick={() => navigate(`/product-rating/${record.id}`)} // Redirect on empty star click
								/>
							))}
						</div>
					);
				};

				return record.average_rating > 0 ? (
					<div style={{ display: "flex", alignItems: "center" }}>
						{" "}
						{/* Flex container to keep stars and rating inline */}
						{renderStars(record.average_rating)} {/* Render the stars */}
						<span style={{ marginLeft: "8px" }}>
							({record.rating}) {/* Display the rating in parentheses */}
						</span>
					</div>
				) : (
					"0"
				);
			},
		},
		{
			title: "Price",
			dataIndex: "price",
			width: "8%",
			render: (price) => <span>${price}</span>,
		},
		{
			title: "Quantity",
			dataIndex: "stock",
			width: "8%",
		},
		{
			title: "Status",
			dataIndex: "status",
			width: "8%",
			render: (status) => {
				let color = status === "approved" ? "green" : "red";
				return (
					<span
						style={{
							color: color,
							fontWeight: "bold",
							textTransform: "uppercase",
						}}
					>
						{status}
					</span>
				);
			},
		},

		{
			title: "Status",
			dataIndex: "stock",
			width: "20%",
			render: (stock) => {
				let label = "";
				let color = "";

				if (stock === 0) {
					label = "Out of Stock";
					color = "red";
				} else if (stock <= 10) {
					label = "Limited";
					color = "orange";
				} else {
					label = "In Stock";
					color = "green";
				}

				return (
					<span
						style={{
							color: color,
							fontWeight: "bold",
							display: "flex",
							alignItems: "center",
						}}
					>
						{stock === 0 && (
							<i
								className="pi pi-times-circle"
								style={{ marginRight: "5px" }}
							></i>
						)}
						{stock > 0 && stock <= 10 && (
							<i
								className="pi pi-exclamation-triangle"
								style={{ marginRight: "5px" }}
							></i>
						)}
						{stock > 10 && (
							<i
								className="pi pi-check-circle"
								style={{ marginRight: "5px" }}
							></i>
						)}
						{label}
					</span>
				);
			},
		},
		{
			title: "Action",
			dataIndex: "action",
			render: (_, record) => (
				<Space size="middle">
					<Tooltip placement="bottom" title="Edit Product">
						<Button
							icon="pi pi-pencil"
							rounded
							outlined
							severity="info"
							className="mr-2"
							style={{ margin: "0px", borderRadius: "25px" }}
							onClick={() => openDrawer(record)}
						></Button>
					</Tooltip>
					<Tooltip placement="bottom" title="View Product">
						<Button
							icon="pi pi-eye"
							rounded
							outlined
							severity="warning"
							className="mr-2"
							style={{ margin: "0px", borderRadius: "25px" }}
							onClick={(event) => navigateToViewProduct(event, record.id)}
						></Button>
					</Tooltip>
				</Space>
			),
		},
	];

	const getData = async () => {
		try {
			setLoading(true);
			let result = await GetProduct(localStorage.getItem("adminToken"));
			const newData = result.data.map((item, index) => ({
				...item,
				index: index + 1,
			}));
			setData(newData);
			setUserBackupData(newData);
		} catch (e) {
			console.log(e);
			if (e.response && e.response.status === 403) {
				navigate("/error401");
				console.log("Access denied. You do not have the required permissions.");
			} else {
				console.log("Error loading data. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};

	const fetchCategories = async () => {
		try {
			let response = await GetAllNumeralCategory();
			setCategories(response.data);
		} catch (error) {
			console.error("Error fetching categories", error);
			message.error("Failed to load categories");
		}
	};

	useEffect(() => {
		fetchCategories();
		getData({
			page: tableParams.pagination.current,
			pageSize: tableParams.pagination.pageSize,
			sortField: tableParams.sortField,
			sortOrder: tableParams.sortOrder,
		});
	}, [tableParams]);

	const handleTableChange = (pagination, filters, sorter) => {
		setTableParams({
			pagination,
			filters,
			sortField: sorter.field,
			sortOrder: sorter.order,
		});
	};

	const onSearch = (searchField) => {
		const searchList = userBackupData.filter((item) =>
			item.name?.toLowerCase().includes(searchField?.toLowerCase())
		);
		setData(searchList);
	};

	const exportToCSV = () => {
		if (!data.length) {
			message.warning("No data to export.");
			return;
		}

		const stripHtml = (html) => {
			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = html;
			return tempDiv.textContent || tempDiv.innerText || "";
		};

		const csvContent =
			"data:text/csv;charset=utf-8," +
			"ID,Name,Description,Price,Quantity,Status\n" +
			data
				.map((row) => {
					const plainTextDescription = stripHtml(
						DOMPurify.sanitize(row.description || "")
					)
						.replace(/,/g, "") // Remove commas to avoid breaking CSV
						.replace(/[\r\n]+/g, " "); // Remove line breaks
					return `${row.id},"${row.name}","${plainTextDescription}",${
						row.price
					},${row.stock},"${
						row.stock === 0
							? "Out of Stock"
							: row.stock <= 10
							? "Limited"
							: "In Stock"
					}"`;
				})
				.join("\n");

		const encodedURI = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedURI);
		link.setAttribute("download", "products.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const navigateToViewProduct = (event, id) => {
		navigate(`/view-product/${id}`);
	};

	const openDrawer = (record) => {
		setSelectedProduct(record);
		setDrawerVisible(true);
		setSelectedCategory(record.numeral_tax_category);
		setSelectedStatus(record.status);
	};

	// Handle Save
	const handleSave = async () => {
		if (!selectedStatus || !selectedCategory) {
			message.warning("Please select both status and numeral tax category.");
			return;
		}

		try {
			await UpdateProduct(selectedProduct.id, {
				status: selectedStatus,
				numeral_tax_category: selectedCategory,
			});
			message.success("Product updated successfully!");
			setDrawerVisible(false);
			getData(); // Refresh Data
		} catch (error) {
			console.error("Error updating product:", error);
			message.error("Failed to update product.");
		}
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
					<h3 className="page-title">PRODUCT MANAGEMENT</h3>
					<p className="page-sub-title">View, delete, and add Product</p>
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
				// rowSelection={rowSelection}
			/>

			<Drawer
				title="Edit Product"
				visible={drawerVisible}
				onClose={() => setDrawerVisible(false)}
				width={600}
			>
				<label>Status:</label>
				<Select
					style={{ width: "100%", marginBottom: "20px" }}
					value={selectedStatus}
					onChange={setSelectedStatus}
				>
					{/* Ensure selectedStatus is valid before using charAt() */}
					{selectedStatus && (
						<Select.Option value={selectedStatus}>
							{selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
						</Select.Option>
					)}

					{/* Show only the alternative option */}
					{selectedStatus === "approved" && (
						<Select.Option value="pending">Pending</Select.Option>
					)}
					{selectedStatus === "pending" && (
						<Select.Option value="approved">Approved</Select.Option>
					)}
				</Select>

				<label>Category:</label>
				<Select
					style={{ width: "100%" }}
					value={selectedCategory}
					onChange={setSelectedCategory}
				>
					{categories.map((cat) => (
						<Select.Option key={cat.id} value={cat.numeral_tax_category}>
							{cat.name}
						</Select.Option>
					))}
				</Select>

				<Button
					icon="pi pi-check"
					label="Save"
					severity="info"
					type="submit"
					onClick={handleSave}
					style={{
						height: "35px",
						padding: "20px",
						borderRadius: "5px",
						marginTop: "300px",
					}}
				/>
				<Button
					icon="pi pi-times"
					severity="secondary"
					label="Cancel"
					onClick={() => setDrawerVisible(false)}
					style={{
						marginLeft: "10px",
						marginTop: "300px",
						height: "35px",
						padding: "20px",
						borderRadius: "5px",
					}}
				></Button>
			</Drawer>
		</Box>
	);
};

export default Product;
