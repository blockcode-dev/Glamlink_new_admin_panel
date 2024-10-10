/** @format */

import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Form, Select, Input, Row, Col, message } from "antd";
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { AddBlogCategroy } from "../../services/Api/BlogsApi";

const AddBlogCategory = () => {
	const [form] = Form.useForm();
	const [title, setTitle] = useState("");
	const [disable, setDisable] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (values) => {
		setDisable(true);

		try {
			const response = await AddBlogCategroy({
				title: values.title,
			});

			if (response.status === 201) {
				message.success("Blog Category added successfully");
				setTimeout(() => {
					navigate("/blogs-categories");
				}, 1000);
			}
		} catch (error) {
			if (error.response && error.response.status === 400) {
				message.error("Email already exists");
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
		navigate("/blogs-categories");
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
					<h3 className="page-title">BLOG CATEGORY</h3>
					<p className="page-sub-title">Create New Blog Cayegroy</p>
				</div>
				<div>
					<Button
						icon="pi pi-arrow-left"
						severity="secondary"
						onClick={navigateToUser}
						style={{ borderRadius: "5px", height: "47px" }}
					>
						<span style={{ marginLeft: "5px" }}>Return to Blog Category</span>
					</Button>
				</div>
			</Box>
			<Card style={{padding:"20px"}}>
				<Form form={form} onFinish={handleSubmit} layout="vertical">
					<Form.Item
						name="title"
						label="Blog Category Title"
						rules={[{ required: true, message: "Please enter Category Title" }]}
					>
						<Input placeholder="Enter Category Title" />
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

export default AddBlogCategory;
