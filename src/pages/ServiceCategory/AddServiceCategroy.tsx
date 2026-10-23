/** @format */

import React, { useState } from "react";
import { CreateServiceCategory } from "../../services/Api/ServiceApi";
import { useNavigate } from "react-router";
import { message, Button, Card, Form, Input } from "antd";

import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../utils/apiError";

const AddServiceCategory = () => {
	const [title, setTitle] = useState("");
	const [disable, setDisable] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async () => {
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
			if (apiErrorStatus(error) === 401) {
				// The session has ended; the shared API client (utils/session.ts) has signed the admin out.
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
		<div>
			<div
				style={{
				    display: "flex",
				    justifyContent: "space-between",
				    alignItems: "center",
				    marginBottom: "20px"
				}}>
				<div>
					<h3 className="page-title">Create Category</h3>
					<p className="page-sub-title">Add new Category</p>
				</div>
				<div>
					<Button
						onClick={navigateToCategory}
						style={{
						    borderRadius: "5px"
						}}
						icon={<ArrowLeftOutlined />}
						size="large"
					>
						<span style={{ marginLeft: "5px" }}>Return to Category</span>
					</Button>
				</div>
			</div>
			<Card style={{padding:"20px"}}>
				<div>
					<Form layout="vertical" onFinish={handleSubmit}>
						<Form.Item label="Title:">

							<Input
								required
								placeholder="Please Enter Title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="new_form_control" />
						</Form.Item>

						<div>
							<Button
								onClick={handleSubmit}
								disabled={disable}
								style={{
								    borderRadius: "5px"
								}}
								icon={<CheckOutlined />}
								type="primary"
								size="large">
								{disable ? "Saving...." : "Save"}
							</Button>
							<Button
								onClick={navigateToCategory}
								style={{
								    marginLeft: "10px",
								    marginTop: "10px",
								    borderRadius: "5px"
								}}
								icon={<CloseOutlined />}
								size="large"
							>
								Cancel
							</Button>
						</div>
					</Form>
				</div>
			</Card>
		</div>
	);
};

export default AddServiceCategory;
