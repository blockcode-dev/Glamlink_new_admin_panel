/** @format */
import React, { useState } from "react";
import { Box } from "@mui/material";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { CreateFAQ } from "../../../services/Api/ContentApi";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const CreateFaq = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState({ question: "", answer: "" });

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// a bit of basic validation
		if (!form.question.trim() || !form.answer.trim()) {
			return message.warning("Both question and answer are required");
		}

		try {
			const data = new FormData();
			data.append("question", form.question);
			data.append("answer", form.answer);

			const res = await CreateFAQ(data);

			if (res.status === 201) {
				message.success("FAQ saved 🎉");
				navigate("/faqs");
			}
		} catch (err) {
			if (err?.response?.status === 401) {
				message.error("Session expired – please log in again");
				localStorage.removeItem("adminToken");
				setTimeout(() => navigate("/Login"), 2000);
			} else {
				message.error("Something went wrong");
			}
		}
	};

	return (
		<Box>
			{/* header */}
			<Box display="flex" justifyContent="space-between" mb={2}>
				<div>
					<h3 className="page-title">FAQ MANAGEMENT</h3>
					<p className="page-sub-title">
						Manage user queries by answering them
					</p>
				</div>
				<Button
					icon="pi pi-arrow-left"
					severity="secondary"
					onClick={() => navigate("/faqs")}
					style={{ borderRadius: 5, height: 47 }}
				>
					<span style={{ marginLeft: 5 }}>Return to FAQ</span>
				</Button>
			</Box>

			{/* form */}
			<Card style={{ padding: "10px" }}>
				<Form onSubmit={handleSubmit}>
					<Form.Group className="mb-3">
						<Form.Label>Question</Form.Label>
						<Form.Control
							type="text"
							name="question"
							value={form.question}
							onChange={handleChange}
							placeholder="Enter the question…"
						/>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>Answer</Form.Label>
						<CKEditor
							editor={ClassicEditor}
							data={form.answer}
							onChange={(event, editor) => {
								const data = editor.getData();
								setForm((prev) => ({ ...prev, answer: data }));
							}}
						/>
					</Form.Group>

					<div style={{ marginTop: 40 }}>
						<Button
							icon="pi pi-check"
							severity="info"
							type="submit"
							style={{ height: 45, padding: "0 20px", borderRadius: 5 }}
						>
							Save
						</Button>
						<Button
							icon="pi pi-times"
							severity="secondary"
							onClick={() => navigate("/faqs")}
							style={{
								marginLeft: 10,
								height: 45,
								padding: "0 20px",
								borderRadius: 5,
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

export default CreateFaq;
