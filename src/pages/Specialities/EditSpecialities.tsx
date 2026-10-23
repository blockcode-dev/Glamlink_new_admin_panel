/** @format */

import React, { useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, Button, Form, Input } from "antd";
import { message } from "antd";
import { GetSpecialitiesById, UpdateSpecialities } from "../../services/Api/SpecialitiesApi";


import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";


import { apiErrorStatus } from "../../utils/apiError";


import { useIdParam } from "../../utils/routing";
import type { Speciality } from "../../types/catalog";


const EditSpecialities = () => {
	const id = useIdParam();
	const navigate = useNavigate();
	const [serviceData, setServiceData] = useState<Partial<Speciality>>({
		title: "",
	});

	useLayoutEffect(() => {
		GetSpecialitiesById(id)
			.then((res) => {
				setServiceData(res.data.data);
			})
			.catch((err) => {
				console.error(err, "error");
			});
	}, [id]);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setServiceData({ ...serviceData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append("title", serviceData?.title ? serviceData?.title : "");

		UpdateSpecialities(id, formData)
			.then((res) => {
				if (res.status === 200) {
					message.success("Profession Update Successfully!");
				}
				navigate("/specialities");
			})
			.catch((err) => {
				if (apiErrorStatus(err) === 401) {
					// The session has ended; the shared API client (utils/session.ts) has signed the admin out.
				} else {
					message.error("Something went wrong");
				}
			});
	};

	const navigateToService = () => {
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
					<h3 className="page-title">Update speciality</h3>
					<p className="page-sub-title">Edit Details of Speciality</p>
				</div>
				<div>
					<Button
						onClick={navigateToService}
						style={{
						    borderRadius: "5px"
						}}
						icon={<ArrowLeftOutlined />}
						size="large"
					>
						<span style={{ marginLeft: "5px" }}>Return to Specialities</span>
					</Button>
				</div>
			</div>
			<Card style={{ width: "100%" }}>
				<Form layout="vertical">
					<Form.Item label="Speciality Title:">

						<Input name="title" value={serviceData?.title} onChange={(e) => onChange(e)} />
					</Form.Item>

					<div>
						<Button
							onClick={handleSubmit}
							style={{
							    borderRadius: "5px"
							}}
							icon={<CheckOutlined />}
							type="primary"
							size="large">
							Save
						</Button>

						<Button
							onClick={navigateToService}
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

export default EditSpecialities;

