/** @format */

import React, { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Card } from "antd";
import { message } from "antd";
import Form from "react-bootstrap/Form";
import { Button } from "primereact/button";
import { GetProductCategoryById, UpdateProductCategory } from "../../../services/Api/EcommeceApi";


const EditProductCategory = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [serviceData, setServiceData] = useState({
		title: "",
	});

	useLayoutEffect(() => {
		GetProductCategoryById(id)
			.then((res) => {
				setServiceData(res.data.data);
			})
			.catch((err) => {
				console.log(err, "error");
			});
	}, [id]);

	const onChange = (e) => {
		setServiceData({ ...serviceData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append("title", serviceData?.title ? serviceData?.title : "");

		UpdateProductCategory(id, formData)
			.then((res) => {
				if (res.status === 200) {
					message.success("Profession Update Successfully!");
				}
				navigate("/product-category");
			})
			.catch((err) => {
				if (err.response && err.response.status === 401) {
					message.error("Token expired!");
					localStorage.removeItem("adminToken");
					setTimeout(() => {
						navigate("/login");
					}, 3000);
				} else {
					message.error("Something went wrong");
				}
			});
	};

	const navigateToService = () => {
		navigate("/product-category");
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
					<h3 className="page-title">Update Product Category</h3>
					<p className="page-sub-title">Edit Details of Product Category</p>
				</div>
				<div>
					<Button
						icon="pi pi-arrow-left"
						severity="secondary"
						onClick={navigateToService}
						style={{ borderRadius: "5px", height: "47px" }}
					>
						<span style={{ marginLeft: "5px" }}>Return to Product Category</span>
					</Button>
				</div>
			</Box>
			<Card style={{ width: "100%" }}>
				<Form>
					<Form.Group className="mb-3">
						<Form.Label>Product Category Name:</Form.Label>
						<Form.Control
							name="title"
							defaultValue={serviceData?.title}
							type="text"
							onChange={(e) => onChange(e)}
						/>
					</Form.Group>

					<div>
						<Button
							icon="pi pi-check"
							severity="info"
							onClick={handleSubmit}
							style={{
								height: "45px",
								padding: "20px",
								borderRadius: "5px",
							}}
						>
							Save
						</Button>

						<Button
							icon="pi pi-times"
							severity="secondary"
							onClick={navigateToService}
							style={{
								marginLeft: "10px",
								marginTop: "10px",
								height: "45px",
								padding: "20px",
								borderRadius: "5px",
							}}
						>
							Cancel
						</Button>
					</div>
				</Form>
			</Card>
		</Box>
	);
};

export default EditProductCategory;

