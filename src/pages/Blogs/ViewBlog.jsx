/** @format */

import React, { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Card } from "primereact/card";
import Form from "react-bootstrap/Form";
import { Button } from "primereact/button";
import { BASE_URL_IMAGE } from "../../services/Host";
import { Row, Col } from "react-bootstrap";
import { GetBlogById } from "../../services/Api/BlogsApi";

const ViewBlog = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [serviceData, setServiceData] = useState(null);

	useLayoutEffect(() => {
		GetBlogById(id)
			.then((res) => {
				setServiceData(res.data.data);
				console.log(res.data.data, "dd");
			})
			.catch((err) => {
				console.log(err, "error");
			});
	}, [id]);

	const navigateToService = () => {
		navigate("/blogs");
	};
	return (
		<Box>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				marginBottom="30px"
			>
				<div>
					<h3 className="page-title">About Blog</h3>
					<p className="page-sub-title">Details of Blog</p>
				</div>
				<div>
					<Button
						icon="pi pi-arrow-left"
						severity="secondary"
						onClick={(e) => {
							navigateToService();
						}}
						style={{ borderRadius: "5px", height: "40px" }}
					>
						<span style={{ marginLeft: "5px" }}> Return to Blogs</span>
					</Button>
				</div>
			</Box>
			<Card style={{ width: "100%" }}>
				<Form>
					<Form.Group className="mb-3">
						<Form.Label>Blog Title:</Form.Label>
						<Form.Control
							name="name"
							defaultValue={serviceData?.title}
							type="text"
							rows={9}
							disabled
						/>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Description:</Form.Label>
						<div
							style={{
								backgroundColor: "#EBECF2",
								borderRadius: "5px",
								padding: "10px",
								border: "1px solid #ced4da ",
							}}
							dangerouslySetInnerHTML={{
								__html: serviceData?.description,
							}}
						/>
					</Form.Group>
					<Row>
						<Col>
							<Form.Group className="mb-3">
								<Form.Label>Blog's Categories:</Form.Label>
								<Form.Control
									name="name"
									value={
										serviceData?.blog_categories?.length > 0
											? serviceData.blog_categories
													.map((category) => category.title)
													.join(", ")
											: "No category selected"
									}
									type="text"
									rows={9}
									disabled
								/>
							</Form.Group>
						</Col>
					</Row>
					<Form.Group className="mb-3">
						<Form.Label>Images:</Form.Label>
						<Row gutter={[16, 16]}>
							{serviceData?.blog_attachments.map((attachment, index) => (
								<Col key={index} span={6}>
									<img
										// crossOrigin="anonymous"
										src={
											attachment?.file_name.split("//")[0] === "https:"
												? attachment?.file_name
												: `${BASE_URL_IMAGE}${attachment?.file_name}`
										}
										alt={`Service graphic ${index + 1}`}
										style={{
											height: "150px",
											width: "150px",
											borderRadius: "10px",
										}}
									/>
								</Col>
							))}
						</Row>
					</Form.Group>
				</Form>
			</Card>
		</Box>
	);
};

export default ViewBlog;
