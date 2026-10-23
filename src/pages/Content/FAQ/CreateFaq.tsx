/** @format */
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { message, Button, Card, Form, Input } from "antd";
import { CreateFAQ } from "../../../services/Api/ContentApi";
import RichTextEditor from "../../../components/RichTextEditor";

import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../../utils/apiError";

const CreateFaq = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState({ question: "", answer: "" });

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async () => {
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
			if (apiErrorStatus(err) === 401) {
				// The session has ended; the shared API client (utils/session.ts) has signed the admin out.
			} else {
				message.error("Something went wrong");
			}
		}
	};

	return (
		<div>
			{/* header */}
			<div
				style={{
				    display: "flex",
				    justifyContent: "space-between",
				    marginBottom: 16
				}}>
				<div>
					<h3 className="page-title">FAQ MANAGEMENT</h3>
					<p className="page-sub-title">
						Manage user queries by answering them
					</p>
				</div>
				<Button
					onClick={() => navigate("/faqs")}
					style={{ borderRadius: 5, height: 47 }}
					icon={<ArrowLeftOutlined />}>
					<span style={{ marginLeft: 5 }}>Return to FAQ</span>
				</Button>
			</div>

			{/* form */}
			<Card style={{ padding: "10px" }}>
				<Form layout="vertical" onFinish={handleSubmit}>
					<Form.Item label="Question">

						<Input
							name="question"
							value={form.question}
							onChange={handleChange}
							placeholder="Enter the question…" />
					</Form.Item>

					<Form.Item label="Answer">

						<RichTextEditor
							value={form.answer}
							onChange={data => {
							    setForm((prev) => ({ ...prev, answer: data }));
							}} />
					</Form.Item>

					<div style={{ marginTop: 40 }}>
						<Button
							style={{ height: 45, padding: "0 20px", borderRadius: 5 }}
							icon={<CheckOutlined />}
							htmlType="submit"
							type="primary"
						>
							Save
						</Button>
						<Button
							onClick={() => navigate("/faqs")}
							style={{
								marginLeft: 10,
								height: 45,
								padding: "0 20px",
								borderRadius: 5,
							}}
							icon={<CloseOutlined />}>
							Cancel
						</Button>
					</div>
				</Form>
			</Card>
		</div>
	);
};

export default CreateFaq;
