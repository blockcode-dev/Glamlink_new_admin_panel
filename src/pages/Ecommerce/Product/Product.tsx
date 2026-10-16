/** @format */

import React, { useEffect, useState } from "react";
import {
    Table,
	Space,
	message,
	Select,
	Drawer,
	Button,
	Input,
	type TableColumnsType,
} from "antd";
import { useNavigate } from "react-router";
import { Tooltip,Modal } from "antd";
import { htmlToText } from "../../../utils/sanitizeHtml";
import { downloadCsv } from "../../../utils/csv";
import {
	GetAllNumeralCategory,
	GetProduct,
	UpdateProduct,
	DeleteProduct
} from "../../../services/Api/EcommeceApi";

import {
    CheckCircleOutlined,
	CheckOutlined,
	CloseCircleOutlined,
	CloseOutlined,
	CloudDownloadOutlined,
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	SearchOutlined,
	StarFilled,
	WarningOutlined,
} from "@ant-design/icons";
import { apiErrorStatus } from "../../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../../utils/table";
import type { Product, TaxCategory } from "../../../types/ecommerce";

const Product = () => {
	const navigate = useNavigate();
	const [data, setData] = useState<WithIndex<Product>[]>([]);
	const [userBackupData, setUserBackupData] = useState<WithIndex<Product>[]>([]);
	const [loading, setLoading] = useState(false);
	const [drawerVisible, setDrawerVisible] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [categories, setCategories] = useState<TaxCategory[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string | null | undefined>(null);
	const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

	const [tableParams, setTableParams] = useState<TableParams>({
		pagination: {
			current: 1,
			pageSize: 100,
		},
		sortField: null,
		sortOrder: null,
	});

	const columns: TableColumnsType<WithIndex<Product>> = [
		{
			title: "S.No.",
			dataIndex: "index",
			width: "5%",
			sorter: (a, b) => a.index - b.index,
		},
		{
			title: "Product Name",
			dataIndex: "name",
			sorter: (a, b) => a.name.localeCompare(b.name),
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
				const renderStars = (rating: number | string) => {
					const validRating = parseFloat(String(rating)); // Ensure rating is a valid number
					if (isNaN(validRating) || validRating < 0) return null; // Return null if the rating is invalid

					const fullStars = Math.floor(validRating); // Full stars
					const halfStar = validRating % 1 >= 0.5; // Half star check
					const emptyStars = 5 - fullStars - (halfStar ? 1 : 0); // Empty stars

					// Rendering each star with onClick functionality
					return (
						<div style={{ display: "flex", alignItems: "center" }}>
							{/* Full Stars */}
							{[...Array(fullStars)].map((_, i) => (
								<StarFilled
									key={`full-${i}`}
									style={{
									    color: "var(--color-rating)",
									    marginRight: "2px",

									    // Make the cursor a pointer when hovering over the stars
										cursor: "pointer"
									}}
									// Redirect on star click
									onClick={() => navigate(`/product-rating/${record.id}`)} />
							))}
							{/* Half Star */}
							{halfStar && (
								<StarFilled
									key="half"
									style={{
									    color: "var(--color-rating)",
									    marginRight: "2px",
									    opacity: 0.5,

									    // Make the cursor a pointer when hovering over the star
										cursor: "pointer"
									}}
									// Redirect on half star click
									onClick={() => navigate(`/product-rating/${record.id}`)} />
							)}
							{/* Empty Stars */}
							{[...Array(emptyStars)].map((_, i) => (
								<StarFilled
									key={`empty-${i}`}
									style={{
									    color: "var(--color-text-disabled)",
									    marginRight: "2px",

									    // Make the cursor a pointer when hovering over the stars
										cursor: "pointer"
									}}
									// Redirect on empty star click
									onClick={() => navigate(`/product-rating/${record.id}`)} />
							))}
						</div>
					);
				};

				return Number(record.average_rating) > 0 ? (
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
				let color = status === "approved" ? "var(--color-success)" : "var(--color-error)";
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
					color = "var(--color-error)";
				} else if (stock <= 10) {
					label = "Limited";
					color = "var(--color-warning)";
				} else {
					label = "In Stock";
					color = "var(--color-success)";
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
							<CloseCircleOutlined style={{ marginRight: "5px" }} />
						)}
						{stock > 0 && stock <= 10 && (
							<WarningOutlined style={{ marginRight: "5px" }} />
						)}
						{stock > 10 && (
							<CheckCircleOutlined style={{ marginRight: "5px" }} />
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
							style={{ margin: "0px", borderRadius: "25px" }}
							onClick={() => openDrawer(record)}
							icon={<EditOutlined />}
							shape="circle"></Button>
					</Tooltip>
					<Tooltip placement="bottom" title="View Product">
						<Button
							style={{ margin: "0px", borderRadius: "25px" }}
							onClick={(event) => navigateToViewProduct(event, record.id)}
							icon={<EyeOutlined />}
							shape="circle"></Button>
					</Tooltip>
					<Tooltip placement="bottom" title="Delete Product">
						<Button
							style={{ margin: "0px", borderRadius: "25px" }}
							onClick={() => handleDelete([record.id])}
							icon={<DeleteOutlined />}
							danger
							shape="circle"></Button>
					</Tooltip>
				</Space>
			),
		},
	];


	const handleDelete = (blogIds: React.Key[]) => {
		Modal.confirm({
			title: "Confirm",
			content: `Are you sure you want to delete ${
				blogIds.length > 1 ? "these Products" : "this Product"
			}?`,
			onOk: async () => {
				try {
					await DeleteProduct(blogIds);
					message.success("Product(s) deleted successfully");
					getData();
				} catch (error) {
					console.error("Error deleting Product(s):", error);
					message.error("Error deleting Product(s)");
				}
			},
		});
	};

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
			console.error(e);
			if (apiErrorStatus(e) === 403) {
				navigate("/error401");
				console.error("Access denied. You do not have the required permissions.");
			} else {
				console.error("Error loading data. Please try again later.");
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
		getData();
	}, [tableParams]);

	const handleTableChange: TableChangeHandler<WithIndex<Product>> = (pagination, filters, sorter) => {
		const { field, order } = singleSorter(sorter);
		setTableParams({
			pagination,
			filters,
			sortField: field,
			sortOrder: order,
		});
	};

	const onSearch = (searchField: string) => {
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
		downloadCsv(
			"products.csv",
			["ID", "Name", "Description", "Price", "Quantity", "Status"],
			data.map((row) => [
				row.id,
				row.name,
				htmlToText(row.description).replace(/s+/g, " ").trim(),
				row.price,
				row.stock,
				row.stock === 0 ? "Out of Stock" : row.stock <= 10 ? "Limited" : "In Stock",
			]),
		);
	};

	const navigateToViewProduct = (event: React.MouseEvent<HTMLElement>, id: number) => {
		navigate(`/view-product/${id}`);
	};

	const openDrawer = (record: Product) => {
		setSelectedProduct(record);
		setDrawerVisible(true);
		setSelectedCategory(record.numeral_tax_category);
		setSelectedStatus(record.status);
	};

	// Handle Save
	const handleSave = async () => {
		if (!selectedProduct || !selectedStatus || !selectedCategory) {
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
		<div>
			<div
				style={{
				    display: "flex",
				    justifyContent: "space-between",
				    alignItems: "center",
				    marginBottom: "20px"
				}}>
				<div>
					<h3 className="page-title">PRODUCT MANAGEMENT</h3>
					<p className="page-sub-title">View, delete, and add Product</p>
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
			/>

			<Drawer
				title="Edit Product"
				open={drawerVisible}
				onClose={() => setDrawerVisible(false)}
				size={600}
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
					onClick={handleSave}
					style={{
					    height: "35px",
					    borderRadius: "5px",
					    marginTop: "300px"
					}}
					icon={<CheckOutlined />}
					htmlType="submit"
					type="primary">Save</Button>
				<Button
					onClick={() => setDrawerVisible(false)}
					style={{
					    marginLeft: "10px",
					    marginTop: "300px",
					    height: "35px",
					    borderRadius: "5px"
					}}
					icon={<CloseOutlined />}>Cancel</Button>
			</Drawer>
		</div>
	);
};

export default Product;
