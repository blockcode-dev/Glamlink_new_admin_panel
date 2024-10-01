/** @format */

import React, { useState } from "react";
import { Box } from "@mui/material";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import Form from "react-bootstrap/Form";
import { CreateServiceCategory } from "../../services/Api/ServiceApi";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const AddServiceCategory = () => {
	const [title, setTitle] = useState("");
	const [disable, setDisable] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (event) => {
		event.preventDefault();

		setDisable(true);

		if (!title) {
			message.error("Please enter title");
			setDisable(false);
			return;
		}

		try {
			const formData = new FormData();
			formData.append("title", title);

			const response = await CreateServiceCategory(formData);

			if (response.status === 201) {
				message.success("Category addedd successfully!");
			}
			navigate("/service-categories");
			setDisable(false);
		} catch (error) {
			if (error.response.status === 401) {
				message.error("Token expired");
				localStorage.removeItem("adminToken");
				setTimeout(() => {
					navigate("/Login");
				}, 1000);
			} else {
				message.error("Something went wrong");
			}
			setDisable(false);
		}
	};

	const navigateToCategory = () => {
		navigate("/service-categories");
	};

	return (
		<Box>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				marginBottom="20px"
			>
				<Box>
					<h3 className="page-title">Create Category</h3>
					<p className="page-sub-title">Add new Category</p>
				</Box>
				<div>
					<Button
						icon="pi pi-arrow-left"
						severity="secondary"
						onClick={navigateToCategory}
						style={{ borderRadius: "5px", height: "47px" }}
					>
						<span style={{ marginLeft: "5px" }}>Return to Category</span>
					</Button>
				</div>
			</Box>
			<Card className="service_card">
				<div>
					<Form onSubmit={handleSubmit}>
						<Form.Group className="mb-3">
							<Form.Label>Title:</Form.Label>
							<Form.Control
								type="text"
								required
								placeholder="Please Enter Title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="new_form_control"
							/>
						</Form.Group>

						<div>
							<Button
								icon="pi pi-check"
								severity="info"
								onClick={handleSubmit}
								disabled={disable}
								style={{
									height: "45px",
									padding: "20px",
									borderRadius: "5px",
								}}
							>
								{disable ? "Saving...." : "Save"}
							</Button>
							<Button
								icon="pi pi-times"
								severity="secondary"
								onClick={navigateToCategory}
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
				</div>
			</Card>
		</Box>
	);
};

export default AddServiceCategory;
