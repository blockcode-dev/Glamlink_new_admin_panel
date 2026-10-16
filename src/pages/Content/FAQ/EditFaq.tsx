/** @format */

import React, { useLayoutEffect } from "react";
import { useNavigate } from "react-router";
import { message, Button, Card, Form, Input } from "antd";
import { GetFAQId, UpdateFAQ } from "../../../services/Api/ContentApi";
import RichTextEditor from "../../../components/RichTextEditor";

import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../../utils/apiError";
import { clearSession } from "../../../utils/session";
import { useIdParam } from "../../../utils/routing";
import type { Faq } from "../../../types/content";

const EditFaq = () => {
    const id = useIdParam();
	const [idData, setIdData] = React.useState<Partial<Faq>>({});

	//get role By ID
	useLayoutEffect(() => {
		GetFAQId(id)
			.then((res) => {
				setIdData(res.data.data);
			})
			.catch((err) => {
				console.error(err, "error");
			});
	}, [id]);

	//update role api implementation
	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	    setIdData({ ...idData, [e.target?.name]: e.target?.value });
	};

	const handleSubmit = (e: React.MouseEvent<HTMLElement>) => {
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
				if (apiErrorStatus(err) === 401) {
					message.error("Token expired!");
					clearSession();
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
		<div>
			<div
				style={{
				    display: "flex",
				    justifyContent: "space-between",
				    alignItems: "center",
				    marginBottom: "20px"
				}}>
				<div>
					<h3 className="page-title">FAQ MANAGEMENT</h3>
					<p className="page-sub-title">
						Manage User Queries By Answering Them
					</p>
				</div>
				<div>
					<Button
						onClick={navigateToRole}
						style={{
						    borderRadius: "5px"
						}}
						icon={<ArrowLeftOutlined />}
						size="large"
					>
						<span style={{ marginLeft: "5px" }}>Return to FAQ</span>
					</Button>
				</div>
			</div>
			<Card style={{ padding: "10px" }}>
				<Form layout="vertical">
					<Form.Item label="Question">

						<Input
							value={idData?.question || ""}
							name="question"
							onChange={handleNameChange} />
					</Form.Item>

					<Form.Item label="Answer">

						<RichTextEditor
							value={idData?.answer || ""}
							onChange={data => {
							    setIdData({ ...idData, answer: data });
							}} />
					</Form.Item>
				</Form>
				<div style={{ marginTop: "40px" }}>
					<Button
						onClick={handleSubmit}
						style={{
						    borderRadius: "5px"
						}}
						icon={<CheckOutlined />}
						htmlType="submit"
						type="primary"
						size="large">
						Save
					</Button>

					<Button
						onClick={(e) => {
							navigateToRole();
						}}
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
			</Card>
		</div>
	);
};

export default EditFaq;
