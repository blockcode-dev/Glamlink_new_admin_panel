/** @format */

import React, { useState } from "react";
import { Form, Input, message, Button, Card } from "antd";
import { useNavigate } from "react-router";
import { CreateSpecialities } from "../../services/Api/SpecialitiesApi";

import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../utils/apiError";
import { clearSession } from "../../utils/session";

const AddSpecialities = () => {
	const [form] = Form.useForm();
	const [disable, setDisable] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (values: { title: string }) => {
		setDisable(true);

		try {
			const response = await CreateSpecialities({
				title: values.title,
			});

			if (response.status === 201) {
				message.success("Speciality added successfully");
				setTimeout(() => {
					navigate("/specialities");
				}, 1000);
			}
		} catch (error) {
			if (apiErrorStatus(error) === 400) {
				message.error("Email already exists");
			} else if (apiErrorStatus(error) === 401) {
				message.error("Token expired");
				clearSession();
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
		navigate("/specialities");
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
					<h3 className="page-title">Speciality</h3>
					<p className="page-sub-title">Create New Speciality</p>
				</div>
				<div>
					<Button
						onClick={navigateToUser}
						style={{
						    borderRadius: "5px"
						}}
						icon={<ArrowLeftOutlined />}
						size="large"
					>
						<span style={{ marginLeft: "5px" }}>Return to Speciality</span>
					</Button>
				</div>
			</div>
			<Card style={{padding:"20px"}}>
				<Form form={form} onFinish={handleSubmit} layout="vertical">
					<Form.Item
						name="title"
						label="Specialities Name:"
						rules={[
							{ required: true, message: "Please enter Specialities Name" },
						]}
					>
						<Input placeholder="Enter Specialities Name" />
					</Form.Item>

					<div style={{ marginTop: "40px" }}>
						<Button
							disabled={disable}
							style={{
							    borderRadius: "5px"
							}}
							icon={<CheckOutlined />}
							htmlType="submit"
							type="primary"
							size="large">
							{disable ? "Saving...." : "Save"}
						</Button>

						<Button
							onClick={navigateToUser}
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
			</Card>
		</div>
	);
};

export default AddSpecialities;
