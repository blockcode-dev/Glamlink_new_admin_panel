/** @format */

import { Box } from "@mui/material";
import React, { useLayoutEffect } from "react";
import { Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { GetFAQId, UpdateFAQ } from "../../../services/Api/ContentApi";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const EditFaq = () => {
	const { id } = useParams();
	const [idData, setIdData] = React.useState({});

	//get role By ID
	useLayoutEffect(() => {
		GetFAQId(id)
			.then((res) => {
				setIdData(res.data.data);
			})
			.catch((err) => {
				console.log(err, "error");
			});
	}, [id]);

	//update role api implementation
	const handleNameChange = (e) => {
		console.log("Selected value:", e.target.value);
		setIdData({ ...idData, [e.target?.name]: e.target?.value });
	};

	console.log(idData?.question, "idData?.question");

	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append("question", idData?.question ? idData?.question : "");
		formData.append("answer", idData?.answer ? idData?.answer : "");

		UpdateFAQ(id, formData)
			.then((res) => {
				if (res.status === 200) {
					message.success("Data updated successfully!");
				}
				navigate("/faqs");
			})
			.catch((err) => {
				if (err.response && err.response.status === 401) {
					message.error("Token expired!");
					localStorage.removeItem("adminToken");
					setTimeout(() => {
						navigate("/Login");
					}, 3000);
				} else {
					message.error("Something went wrong");
				}
			});
	};

	const navigate = useNavigate();
	const navigateToRole = () => {
		navigate("/faqs");
	};

	if (!idData?.id) return <div>Loading...</div>;

	return (
		<Box>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				marginBottom="20px"
			>
				<div>
					<h3 className="page-title">FAQ MANAGEMENT</h3>
					<p className="page-sub-title">
						Manage User Queries By Answering Them
					</p>
				</div>
				<div>
					<Button
						icon="pi pi-arrow-left"
						severity="secondary"
						onClick={navigateToRole}
						style={{ borderRadius: "5px", height: "47px" }}
					>
						<span style={{ marginLeft: "5px" }}>Return to FAQ</span>
					</Button>
				</div>
			</Box>
			<Card style={{ padding: "10px" }}>
				<Form>
					<Form.Group className="mb-3">
						<Form.Label>Question</Form.Label>
						<Form.Control
							type="text"
							value={idData?.question || ""}
							name="question"
							onChange={handleNameChange}
						/>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>Answer</Form.Label>
						<CKEditor
							editor={ClassicEditor}
							data={idData?.answer || ""}
							onChange={(event, editor) => {
								const data = editor.getData();
								setIdData({ ...idData, answer: data });
							}}
						/>
					</Form.Group>
				</Form>
				<div style={{ marginTop: "40px" }}>
					<Button
						icon="pi pi-check"
						severity="info"
						type="submit"
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
						onClick={(e) => {
							navigateToRole();
						}}
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
			</Card>
		</Box>
	);
};

export default EditFaq;
