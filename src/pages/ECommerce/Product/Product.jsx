import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
	GetAllProducts,
	DeleteProduct,
} from "../../../services/Api/ProductApi";
import {
	Table,
	TableContainer,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	Paper,
	TextField,
} from "@mui/material";
import { Button } from "primereact/button";
import Alert from "../../Customer/Alert";
import { message } from "antd";

// Import the UpdateProduct function
export const UpdateProduct = async (id, formData) => {
	console.log(id, formData);
	try {
		const adminToken = localStorage.getItem("adminToken");
		const response = await axios.put(
			`https://node.nunamoving.com:8080/api/v1/product/updateProduct/${id}`,
			formData,
			{
				headers: {
					"x-access-token": adminToken,
					"Content-Type": "multipart/form-data",
				},
			}
		);
		console.log(response, "response2");
		return response.data;
	} catch (error) {
		console.error("Error updating product:", error);
		throw error;
	}
};

function EditableTable() {
	const navigate = useNavigate();
	const [data, setData] = useState([]);
	const [editRowId, setEditRowId] = useState(null);
	const [productData, setProductData] = useState([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [updateStockClicked, setUpdateStockClicked] = useState(false);

	const navigateToAddProduct = () => {
		navigate("/addProduct");
	};

	const navigateToViewProduct = (event, id) => {
		navigate(`/viewProduct/${id}`);
	};
	const navigateToEditProduct = (event, id) => {
		navigate(`/editProduct/${id}`);
	};

	const getData = async () => {
		try {
			let result = await GetAllProducts(localStorage.getItem("adminToken"));
			setProductData(result.data.data);
			console.log("product==>", result.data.data);
		} catch (e) {
			console.log(e);
		}
	};
	useEffect(() => {
		getData();
	}, []);
	const handleDelete = (id) => {
		setIsModalVisible(false);
		DeleteProduct(id)
			.then((res) => {
				console.log(res, "res");
				message.success(res?.data?.message);
				getData();
			})
			.catch((error) => {
				console.log(error, "error");
			});
	};
	const handleEdit = (id) => {
		setEditRowId(id);
	};

	const handleSave = async (id) => {
		try {
			const updatedRow = productData.find((row) => row.id === id); // Use productData instead of data
			await UpdateProduct(id, updatedRow); // Pass updatedRow instead of data
			setEditRowId(null);
			setUpdateStockClicked(false); // Reset the state after saving
		} catch (error) {
			console.error("Error saving data:", error);
		}
	};
	

	const handleCancel = () => {
		setEditRowId(null);
		setUpdateStockClicked(false); // Reset the state after canceling
	};

	const isRowInEditMode = (id) => {
		return editRowId === id;
	};

	const handleInputChange = (id, field, value) => {
		setProductData((prevData) =>
			prevData.map((r) => (r.id === id ? { ...r, [field]: value } : r))
		);
	};

	return (
		<Box>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				marginBottom="20px"
			>
				<h3>Products</h3>
				<Box>
					<Button
						label=" Add New Product"
						icon="pi pi-plus"
						severity="info"
						onClick={navigateToAddProduct}
						style={{ margin: "0px 10px", borderRadius: "5px" }}
					/>
				</Box>
			</Box>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Sr.No.</TableCell>
							<TableCell>Name</TableCell>
							<TableCell>Stock Analysis</TableCell>
							<TableCell>Stock</TableCell>
							<TableCell>Price</TableCell>
							<TableCell>Action</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{productData?.map((row) => (
							<TableRow key={row.id}>
								<TableCell>{row.id}</TableCell>
								<TableCell>{row.name}</TableCell>
								<TableCell>
									<div style={{ color: row.stock > 0 ? "green" : "red" }}>
										{row.stock > 0 ? "In Stock" : "Out of Stock"}
									</div>
								</TableCell>
								<TableCell>
									{isRowInEditMode(row.id) ? (
										<TextField
											type="number"
											value={row.stock}
											onChange={(e) =>
												handleInputChange(row.id, 'stock', parseInt(e.target.value))
											}
										/>
									) : (
										row.stock
									)}
								</TableCell>

								<TableCell>
									{isRowInEditMode(row.id) ? (
										<TextField
											value={row.price}
                                            type="number"
											onChange={(e) =>
												handleInputChange(row.id, 'price', parseInt(e.target.value))
											}
										/>
									) : (
										row.price
									)}
								</TableCell>
								<TableCell>
									{updateStockClicked ? (
										<>
											<Button
												label="Save"
												text
												raised
												onClick={() => handleSave(row.id)}
												style={{ borderRadius: "25px", marginRight: "10px" }}
											></Button>
											<Button
												label="Cancel"
												text
												raised
												onClick={handleCancel}
												style={{ borderRadius: "25px", marginRight: "10px" }}
											></Button>
										</>
									) : (
										<Button
											label="Update Stock"
											text
											raised
											onClick={() => {
												handleEdit(row.id);
												setUpdateStockClicked(true);
											}}
											style={{ borderRadius: "25px", marginRight: "10px" }}
										></Button>
									)}
									<Button
										icon="pi pi-info-circle"
										rounded
										outlined
										severity="warning"
										className=" product"
										style={{ borderRadius: "25px" }}
										onClick={(event) => navigateToViewProduct(event, row.id)}
									/>
									<Button
										icon="pi pi-pencil"
										rounded
										outlined
										className="mr-2"
										style={{ marginLeft: "10px", borderRadius: "25px" }}
										onClick={(event) => navigateToEditProduct(event, row.id)}
									/>
									<Alert
										title="Product"
										handleDelete={() => handleDelete(row.id)}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}
export default EditableTable;
