/** @format */

import { Box } from "@mui/material";
import React, { useState } from "react";
import { Form, Input,  message } from "antd";
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { CreateProductCategory } from "../../../services/Api/EcommeceApi";


const AddProductCategory = () => {
	const [form] = Form.useForm();
	const [disable, setDisable] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (values) => {
		setDisable(true);

		try {
			const response = await CreateProductCategory({
				title: values.title,
			});

			if (response.status === 201) {
				message.success("Product Category added successfully");
				setTimeout(() => {
					navigate("/product-category");
				}, 1000);
			}
		} catch (error) {
			if (error.response && error.response.status === 409) {
				message.error("This category already exists");
			} else if (error.response.status === 401) {
				message.error("Token expired");
				localStorage.removeItem("adminToken");
				setTimeout(() => {
					navigate("/login");
				}, 3000);
			} else {
				message.error("Something went wrong");
			}
		} finally {
			setDisable(false);
		}
	};

	const navigateToUser = () => {
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
					<h3 className="page-title">Product Category</h3>
					<p className="page-sub-title">Create New Product Category</p>
				</div>
				<div>
					<Button
						icon="pi pi-arrow-left"
						severity="secondary"
						onClick={navigateToUser}
						style={{ borderRadius: "5px", height: "47px" }}
					>
						<span style={{ marginLeft: "5px" }}>Return to Product Category</span>
					</Button>
				</div>
			</Box>
			<Card style={{padding:"20px"}}>
				<Form form={form} onFinish={handleSubmit} layout="vertical">
					<Form.Item
						name="title"
						label="Product Category Name:"
						rules={[
							{ required: true, message: "Please enter Product Category Name" },
						]}
					>
						<Input placeholder="Enter Product Category Name" />
					</Form.Item>

					<div style={{ marginTop: "40px" }}>
						<Button
							icon="pi pi-check"
							severity="info"
							type="submit"
							disabled={disable}
							style={{ height: "45px", padding: "20px", borderRadius: "5px" }}
						>
							{disable ? "Saving...." : "Save"}
						</Button>

						<Button
							icon="pi pi-times"
							severity="secondary"
							onClick={navigateToUser}
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

export default AddProductCategory;
